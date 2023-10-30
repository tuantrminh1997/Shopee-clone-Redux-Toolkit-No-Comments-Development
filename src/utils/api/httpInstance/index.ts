/* eslint-disable @typescript-eslint/no-explicit-any */
// axios
import axios, { AxiosResponse, AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
// react toastify:
import { toast } from "react-toastify";
// types:
import { RefreshTokenResponseType, AuthenticationSuccessResponse, User, ErrorResponseApi } from "src/types";
// utils authentication:
import {
	// access token
	saveAccessTokenToLocalStorage,
	clearAccessTokenFromLocalStorage,
	getAccessTokenFromLocalStorage,
	// user profile
	saveUserProfileToLocalStorage,
	clearUserProfileFromLocalStorage,
	// refresh_token:
	saveRefreshTokenToLocalStorage,
	clearRefreshTokenFromLocalStorage,
	getRefreshTokenFromLocalStorage,
	// event target, event message clear local storage:
	clearLocalStorageEventTarget,
	clearAccessTokenUserProfileEvent,
	// type predicate:
	isAxiosUnauthorizedError,
	isNotUnprocessableEntityError,
	isAxiosExpiredTokenError,
	isCanceledError,
} from "src/utils";
// paths constants:
import {
	paths,
	// API URLs
	loginPathURL,
	registerPathURL,
	refreshTokenPathURL,
	logoutPathURL,
} from "src/constants";

class Http {
	instance: AxiosInstance;
	// Tạo 1 thuộc tính accessToken và lưu dữ liệu access Token (lưu vào đây chính là lưu trên RAM) được lấy ra từ Local Storage vào ram.
	private accessToken: string;
	// thuộc tính lưu giá trị của refresh_token:
	private refreshToken: string;
	// Handle chức năng Refresh Token: sử dụng gián tiếp thông qua thuộc tính refreshTokenRequest của class Http thay vì sử dụng trục tiếp method handleRefreshTokenAutomatically
	// -> handle được vấn đề Refresh_Token bị gọi liên tiếp nhiều lần trong 1 vài trường hợp đặc biệt, đảm bảo luôn luôn chỉ thực hiện refresh_token 1 lần duy nhất khi thực sự
	// cần thiết -> vì refreshTokenRequest có giá trị khởi tạo là null và được set ngược về null mỗi khi thực hiện Refresh_Token xong, đồng thời được gán bằng 1 async Function
	// khi thực hiện Refresh Token -> refreshTokenRequest có type Promise resolve string hoặc null
	private refreshTokenRequest: Promise<string> | null;
	// 2. Khai báo phương thức refresh token: chú ý, đây là định nghĩa nhóm các thuộc tính và phương thức trong 1 class chứ không phải 1 object nên ta ko được khai báo
	// thêm từ khoá : function -> lỗi cú pháp
	private async handleRefreshTokenAutomatically() {
		// async function handleRefreshTokenAutomatically
		try {
			// -> async function handleRefreshTokenAutomatically chạy hết khối try và return về 1 giá trị trong khối try
			// -> toàn bộ async function handleRefreshTokenAutomatically sẽ return về Promise.resolve(giá trị return)
			// trong trường hợp async function handleRefreshTokenAutomatically chạy hết toàn bộ khối try hoặc catch đồng thời trong khối try và catch mà nó chạy hết không có giá trị return
			// -> toàn bộ async function handleRefreshTokenAutomatically return về Promise.resolve(undefined)
			const response = await this.instance.post<RefreshTokenResponseType>(refreshTokenPathURL, {
				refresh_token: this.refreshToken as string,
			});
			const { access_token: accessToken } = (response as AxiosResponse<RefreshTokenResponseType>).data.data as {
				access_token: string;
			};
			// nhận được accessToken -> công việc quen thuộc: lưu vào local storage đồng thời gán cho thuộc tính this.accessToken
			saveRefreshTokenToLocalStorage(accessToken as string);
			this.accessToken = accessToken as string;
			return accessToken as string;
		} catch (error) {
			// trong trường hợp refresh token thất bại khi refresh_token hết hạn
			// -> chỉ còn có thể logout
			// -> đồng thời response error sẽ được bắt vào interceptor response error
			// -> logout:
			this.accessToken = "";
			this.refreshToken = "";
			clearAccessTokenFromLocalStorage();
			clearUserProfileFromLocalStorage();
			clearRefreshTokenFromLocalStorage();
		}
	}
	// constructor của class Http chỉ được gọi 1 lần duy nhất khi ứng dụng được chạy
	// -> 1. lấy accessToken từ local storage.
	constructor() {
		// 1. -> lấy access token từ local storage chỉ 1 lần duy nhất khi ứng dụng được khởi chạy (Bởi vì hàm constructor chỉ được chạy 1 lần duy
		// nhất khi khởi chạy ứng dụng).
		// -> các lần request sau cần sử dụng accessToken, ta lấy từ giá trị của thuộc tính this.accessToken (chính là lấy từ RAM -> cải thiện về mặt hiệu suất) và đính vào
		// kèm vào config.headers.authorization.
		// * giải thích: bất cứ khi nào cần sử dụng access Token (get Api) ta lại lấy access Token được lưu trong local storage
		// điều đó gây giảm hiệu suất máy tính, vì Local Storage là được lưu vào ổ cứng máy tính, việc lấy dữ liệu trong
		// ổ cứng máy tính và đọc bao giờ cũng chậm hơn so với trên RAM, đọc dữ liệu từ RAM luôn luôn nhanh hơn gấp nhiều
		// lần so với việc đọc tù ổ cứng.
		// Giải thích: Khi gửi access token lên server thì thường sẽ gửi thông qua HTTP Header Authorization như dưới đây
		// ```bash
		// Authorization: Bearer <access token>
		// ```
		// -  Tất nhiên bạn cũng có thể gửi thông qua HTTP Header khác tùy bạn, hoặc thậm chí là HTTP body nếu bạn đã thống nhất với phía server. Việc thông qua Header là
		// Authorization đã có từ trước đây và được nhiều nơi sử dụng nên sau này nhiều anh em dev làm vậy cho dễ dàng nhận biết.
		// -  Cái chữ `Bearer` trước access token là để phân biệt giữa các Authentication schemes. Có một số Authentication schemes như: Basic, Bearer, Digest,... Tất nhiên là
		// cũng có thể bạn bỏ đi cái `Bearer` này cũng được nếu server bạn không cần nó.
		this.accessToken = getAccessTokenFromLocalStorage();
		// Khởi tạo refresh_token khi khởi chạy ứng dụng (kể cả khi chưa đăng nhập), lấy từ local storage, lúc chưa đăng nhập chưa có -> trả về chuỗi rỗng.
		this.refreshToken = getRefreshTokenFromLocalStorage();
		this.refreshTokenRequest = null;
		this.instance = axios.create({
			// -> đoạn này tạo 1 instance từ class Http khi chạy const httpInstance = new Http().instance
			// 1. baseURL = URL cơ sở = địa chỉ bề mặt của nơi chứa toàn bộ data mà client sẽ cần.
			baseURL: paths.baseURL,
			// 2. nếu một request không hoàn thành trong vòng 1000ms (1 giây), nó sẽ bị hủy và được xem như thất bại. Mục đích của việc này là đảm bảo
			// rằng ứng dụng của bạn không bị treo hoặc bị chậm do chờ đợi quá lâu cho một yêu cầu.
			timeout: 15000,
			headers: {
				// 3. thiết lập tiêu đề của yêu cầu HTTP, cụ thể là "Content-Type", để cho server biết rằng nội dung của yêu cầu là dữ liệu JSON. Điều
				// này quan trọng khi gửi dữ liệu về server hoặc khi server mong đợi dữ liệu đầu vào dưới dạng JSON.
				"Content-Type": "application/json",
				// Server ta đang sử dụng cho phép custome thời gian hết hạn của access_token và refresh_token như sau:
				"expire-access-token": 60 * 5, // -> Access Token hết hạn sau 5 phút
				"expire-refresh-token": 60 * 60, // -> refresh token hết hạn sau 60 phút
			},
		});
		/**
		 * Axios Interceptor - Bộ đón chặn
		 * Sửa axios -> this.instance, mục đích là http sẽ là một instance của lớp Http, và đồng thời nó sẽ sở hữu những interceptor
		 * mà bạn đã thiết lập trong constructor của Http. Điều này cho phép mọi cuộc gọi Axios thông qua biến http này cũng sẽ trải
		 * qua các interceptors đó, cho phép bạn thực hiện các tương tác chung như kiểm tra lỗi, gửi các thông báo, thêm
		 * header, v.v. trước hoặc sau khi gửi request và nhận response.
		 */
		// Thêm một bộ đón chặn response
		// Interceptor cho response trả về khi gửi request, truy cập vào các Route yêu cầu cần xác thực
		// Theo quy định trong API Document: Đối với các route cần xác thực => Gửi token lên bằng headers với key là
		// `authorization`. Token phải bắt đầu bằng 'Bearer ' (accessToken được trả về từ server và lưu luôn vào LocalStorage)
		// đã kèm cả Bearer.
		// Interceptor cho request: Mục đích là đảm bảo rằng mọi yêu cầu HTTP gửi từ ứng dụng của bạn đều đi kèm với access token nếu có, để xác
		// thực người dùng và cho phép họ truy cập các tài nguyên được bảo vệ, Cụ thể:
		this.instance.interceptors.request.use(
			// 1. Trong hàm config, kiểm tra xem access token (this.accessToken) đã được định nghĩa và tồn tại.
			(successRequest) => {
				// Nếu có và config.headers tồn tại (để tránh gửi yêu cầu với undefined headers), bạn thêm access token vào tiêu đề
				// (config.headers.authorization) của yêu cầu. Điều này đảm bảo rằng mọi yêu cầu đi kèm với access token nếu người dùng đã đăng nhập.
				// Mấu chốt ở đây là ta sử dụng access_token từ giá trị của thuộc tính this.access_token thay vì lấy từ LS ở mỗi lần Request sau.
				if (this.accessToken && successRequest.headers) {
					successRequest.headers.authorization = this.accessToken;
					return successRequest;
				}
				// 2. Nếu không có access token hoặc config.headers không tồn tại, không làm gì và chỉ trả về config ban đầu. Điều này đảm bảo rằng
				// các yêu cầu không đi kèm với access token nếu người dùng chưa đăng nhập.
				return successRequest;
			},
			// 3. Trong trường hợp có lỗi xảy ra - cụ thể là trong trường hợp xảy ra lỗi khi tạo request và request đó vẫn chưa được gửi đi,
			//  sử dụng error để tạo một promise bị reject, giữ nguyên lỗi và chuyển nó ra ngoài để được xử lý bởi các interceptor hoặc mã gọi yêu
			// cầu HTTP khác, nếu có.
			(errorRequest) => {
				return Promise.reject(errorRequest);
			},
			// -> Tóm lại, interceptor này đảm bảo rằng việc xác thực thông qua access token được thực hiện cho mọi yêu cầu gửi từ ứng dụng của bạn,
			// và nó loại bỏ việc phải thêm access token thủ công vào mỗi yêu cầu một cách riêng lẻ. Điều này giúp giảm lỗi trong việc xác thực và
			// làm cho mã của bạn trở nên sạch sẽ và dễ bảo trì hơn.
		);
		// Interceptor xử lý phản hồi từ máy chủ sau khi gửi yêu cầu HTTP từ phía ứng dụng. Nó có hai phần chính:
		this.instance.interceptors.response.use(
			// Callback Interceptor cho response khi thực hiện tác vụ call API thành công: Khi máy chủ trả về một phản hồi thành công sau khi thực
			// hiện một tác vụ API như đăng nhập hoặc đăng ký, bạn thực hiện các công việc sau:
			(successResponse) => {
				// 1. Kiểm tra xem đường dẫn URL của phản hồi (response.config.url) có phải là đường dẫn của đăng nhập hoặc đăng ký không. Nếu đúng,
				// đây là các tác vụ đăng nhập hoặc đăng ký.
				const { url } = successResponse.config;
				// Chú ý: giá trị url cần lấy theo path url của API (quy định bởi Server) chứ không phải lấy theo path url quy định bởi react-router
				// -> nếu không đây sẽ là chỗ tiềm tàng bug, trong trường hợp react router thay đổi khác đi so với patth url từ API sẽ gây ra bug.
				if (url === loginPathURL || url === registerPathURL) {
					const data: AuthenticationSuccessResponse | User = successResponse.data;
					// 2. Trích xuất access token từ phản hồi (response.data.data.access_token) và lưu nó vào biến this.accessToken. Điều này làm cho
					// access token này có sẵn cho các yêu cầu tiếp theo mà người dùng có thể thực hiện, lưu ý cần để callback này là arrow function mới
					// có thể truy cập vào this.accessToken: string
					this.accessToken = (successResponse.data as AuthenticationSuccessResponse).data.access_token;
					// 3. trích xuất refresh_token từ API trả về và lưu vào thuộc tính this.refreshToken: (Khi thực hiện chức năng refresh_token, ta lại lấy refresh_token từ thuộc
					// tính này, tức là lấy từ RAM để cải thiện hiệu suất).
					// -> tiếp theo cần khai báo 3 utils thực hiện 3 tác vụ: lưu refresh_token, xoá refresh_token và lấy từ/trong local storage.
					this.refreshToken = (successResponse.data as AuthenticationSuccessResponse).data.refresh_token;
					// 4. Lưu access_token, refresh_token và user_profile vào local storage (lưu từ thuộc tính this......)
					// -> lưu accessToken vào localStorage (src/utils/authentication/saveAccess....)
					saveAccessTokenToLocalStorage(this.accessToken as string);
					// -> Lưu refresh_token vào local storage:
					saveRefreshTokenToLocalStorage(this.refreshToken as string);
					// Lưu userProfile vào local storage:
					saveUserProfileToLocalStorage(data as User);
				} else if (url === logoutPathURL) {
					// Khi logout:
					// -> accessToken, refreshToken được clear hết trong Local Storage và trả về chuỗi rỗng, userProfile cũng tương tự.
					this.accessToken = "";
					this.refreshToken = "";
					clearAccessTokenFromLocalStorage();
					clearUserProfileFromLocalStorage();
					clearRefreshTokenFromLocalStorage();
				}
				return successResponse;
			},
			// Callback Interceptor cho response khi thực hiện tác vụ call API thất bại.
			// cần sử dụng Arrow Function tại đây để truy cập được vào thuộc tính
			(errorResponse: AxiosError) => {
				// Test để thực hiện 1 cuộc gọi API thất bại -> cố tình sửa: khi call API login -> cố tình đi vào path "/loginnn"
				// -> xảy ra lỗi (Địa chỉ để truy cập tài nguyên trên server không đúng) và đi vào callback này.
				/**
				 *** Đối với các error chung chung, không có định hình cụ thể (khác 422 và 401 -> ta toast lên)
				 *** Chú ý: lỗi 401 do access_token hết hạn ta không toast lên nữa vì đã được handle bằng refresh _token
				 */
				if (isNotUnprocessableEntityError(errorResponse) && !isAxiosUnauthorizedError(errorResponse) && !isCanceledError(errorResponse)) {
					// Bắt lỗi khác lỗi có status Khác 422, chính là những lỗi chung chung, có message đơn giản.
					// -> đơn giản là toast lên bằng React Toastify.
					// Error về typescript xuất hiện ở đây: message không tồn tại trong type {}
					// const errorMessage = error.response?.data?.message;
					// -> error object được server trả về thì error.response?.data có thể là bất kì kiểu gì (1 string HTML, thậm chí là
					// undefined hoặc null)
					const errorData: any | undefined | null = (errorResponse as AxiosError<unknown, any>).response?.data;
					// -> trong trường hợp error.response.data là 1 kiểu vô định (có thể là chuỗi HTML) và không chứa thuộc tính message
					// -> ta sử dụng message trong error object (message: "Request failed with status code 404")

					// Chú ý: phải thêm option chaining tại errorData?.message, nếu không gây lỗi crash do errorData có thể bị undefined (tại chức năng upload ảnh khi ta cố tình upload
					//  1 ảnh kích thước > 1mb, cụ thể ở trường hợp đó -> toast ra error.message)
					const errorMessage = errorData?.message || (errorResponse as AxiosError<unknown, any>).message;
					toast.error(errorMessage);
				}
				// type Predicate bắt lỗi 401: bao gồm cả trường hợp access_token hết hạn.
				if (isAxiosUnauthorizedError<ErrorResponseApi<{ name: string; message: string }>>(errorResponse)) {
					// trường hợp: 1 request với access_token hết hạn đồng thời request đó không phải là truy cập vào Khối tài nguyên yêu cầu Refresh token của server
					// (trường hợp đang sử dụng app bình thường thì access_token hết hạn)
					// -> điều kiện 1: server trả về lỗi access_token hết hạn -> isAxiosExpiredTokenError(error)
					// -> điều kiện 2: url truy cập vào khác với url chỉ định khối tài nguyên Refresh Token trên server -> error.response.config.url !== refreshTokenPathURL.
					// -> Tiến hành refresh_token.
					const errorResponseConfig = errorResponse.response?.config;
					const { url } = errorResponseConfig as InternalAxiosRequestConfig<any>;
					if (isAxiosExpiredTokenError<AxiosError<AxiosError<unknown, any>, any>>(errorResponse) && url !== refreshTokenPathURL) {
						// Thực hiện việc refresh_token gián tiếp thông qua thuộc tính this.refreshTokenRequest
						this.refreshTokenRequest =
							this.refreshTokenRequest !== null
								? this.refreshTokenRequest
								: (this.handleRefreshTokenAutomatically().finally(() => {
										// Sau khi thực hiện refresh_token xong ở callback của then
										// -> set ngược lại this.refreshTokenRequest thành null để fix vấn đề.
										// -> vẫn có thể xảy ra 1 vài trường hợp đặc biệt, đó là khi ta cố tình set thời gian hết hạn access_token ngắn (khoảng 5s), access_token hết hạn và được
										// refresh kịp thời đồng thời this.refreshTokenRequest đã được set ngược về null.
										// -> tiếp tục thực hiện 1 tác vụ call API gần như ngay sau đó khi mà access_token vừa hết hạn và this.refreshToken đã bị set ngược về null
										// -> API refresh_token bị gọi lại gần như ngay lập tức.
										// -> Ta có thể handle tiếp đến cả các trường hợp đặc biệt như thế bằng cách giữ this.refreshTokenRequest thêm khoảng 10s trước khi set ngược về null
										// (nhỏ hơn hạn sử dụng của refresj_token).
										setTimeout(() => {
											this.refreshTokenRequest = null;
										}, 10000);
								  }) as Promise<string> | null);

						// this.refreshTokenRequest là 1 promise resolve giá trị access_token mới, access_token mới được bắt vào then và thực hiện tác vụ return về this.instance.
						// promise this.refreshTokenRequest sẽ tiếp tục return về 1 Promise resolve(this.instance).
						// -> toàn bộ khối callback này sẽ tiếp tục return về this.refreshTokenRequest?
						return this.refreshTokenRequest?.then((new_access_token) => {
							// Đính acccess_token mới sau khi refresh vào headers.Authorization
							// -> Tiếp tục thực hiện request vừa rồi với config đã được thay access_token mới.
							return this.instance({
								...errorResponseConfig,
								headers: {
									...(errorResponseConfig as InternalAxiosRequestConfig<any>).headers,
									Authorization: new_access_token,
								},
							});
						});
						// -> Tiếp theo, sau khi đã xử lý được lỗi 401 do access_ token hết hạn thì không toast lên
					}
					// Bắt lỗi 401 và xử lý, cụ thể là lỗi Access_token hết hạn/bị sai đồng thời cũng không thể refresh được vì refresh_token cũng đã hết hạn
					// -> cho logout thằng
					// -> mục tiêu ta cần xử lý là khi access_token bị sai hoặc hết hạn thì clear trong local storage + context API, đăng xuất
					// -> khi access_token bị sai hoặc hết hạn, ta cần xử lý:
					// 1. clear access_token trong local storage.
					clearAccessTokenFromLocalStorage();
					// 2. clear user profile trong local storage.
					clearUserProfileFromLocalStorage();
					this.accessToken = "";
					this.refreshToken = "";
					// Không thể refresh_token -> toast lên:
					toast.error(
						((errorResponse.response?.data as ErrorResponseApi<{ name: string; message: string }>).data?.message as string) ||
							(errorResponse.response?.data.message as string),
					);
					// -> tuy nhiên chưa đủ, ta vẫn thấy ta cần reset lại isLoggedIn và userProfile trong Context API -> initial vì ta thấy khi f5 lại
					// trang -> bị đăng xuất ra ngoài do Context API get từ LS, trong khi LS đã bị xóa dữ liệu.
					// -> ta có 2 cách xử lý ở đây để tiếp tục reset isLoggedIn và userProfile trong Context API về initial sau khi clear LS:
					// 1. cố tình reload lại ứng dụng bằng window.location.reload() sau khi clear local storage -> cũng được nhưng không hay, ko đúng
					// bản chất, đồng thời làm sai đi định nghĩa về SPA.
					// 2. -> cách hay hơn là sử dụng Event Target ():
					// 2.1. xuất ra 1 event và tại 1 nơi khác tại ứng dụng, ta lắng nghe event đó.
					// 2.2. tại App, lắng nghe event clear LS và tiếp tục thực hiện reset Context API.
					// - tạo 1 event target:
					// const clearLocalStorageEventTarget = new EventTarget();
					// - sau khi clear access_token + userProfile -> xuất ra 1 event thông báo rằng đã hoàn thành 2 tác vụ trên.
					// - Truyền thông báo trên cho event target, để event target nhận diện và trong tương lai khi nhận được event message này
					// -> thực hiện tác vụ cụ thể
					clearLocalStorageEventTarget.dispatchEvent(clearAccessTokenUserProfileEvent);
					// -> tại App, sử dụng useEffect để lắng nghe event trên và thực hiện tác vụ reset khi bắt được event
				}
				return Promise.reject(errorResponse);
			},
		);
	}
}
const httpInstance = new Http().instance;
export default httpInstance;
