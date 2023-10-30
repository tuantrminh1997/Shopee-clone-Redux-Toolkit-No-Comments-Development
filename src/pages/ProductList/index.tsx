// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// types
import { RootState } from "src/types";
// react hooks
import { useEffect, useMemo } from "react";
// react redux
import { useSelector } from "react-redux";
// custome hooks
import { useQueryConfig, useAppDispatch } from "src/hooks";
// thunk actions
import { getCategoriesThunkAction, getProductListThunkAction } from "src/thunkActions";
// common components:
import { ProductItem } from "src/components";
// private components:
import { SkeletonLoadingProductItem, Pagination, Sort, AsideFilter } from "./components";
import { createSearchParams, useNavigate } from "react-router-dom";
import { paths } from "src/constants";

export default function ProductList() {
	// Khi ta chủ động truyền query params trực tiếp lên url -> biến productListQueryParams thay đổi giá trị
	// -> vì biến productListQueryParams là 1 dependency của
	// hook useQuery -> Component bị re-render và khởi tạo 1 query mới -> 1 truy vấn mới đưỢc tạo ra và hàm queryFn đưỢc gọi.
	// const productListQueryParams: QueryConfigType = useQueryParams();

	// biến productListQueryParams -> đỡ lấy toàn bộ giá trị query params và lưu vào 1 object
	// Lưu ý: ở đây có thể có 1 cách khác -> lấy giá trị của biến productListQueryParams làm dependency của useEffect, mỗi khi dependency productListQueryParams thay
	// đổi giá trị -> set lại giá trị cho object queryConfig -> làm như thế không sai nhưng bị thừa, vì ta quan niệm: khi có 1 biến có giá trị phụ thuộc vào giá trị
	// 1 biến khác, ta hoàn toàn có thể tạo ra 1 biến và suy ra thay vì tạo ra hẳn 1 state mới để quản lý biến đó (biến queryConfig phụ thuộc vào giá trị của biến
	// productListQueryParams, biến productListQueryParams lại là dependency của useQuerry rồi nên ko cần cho nó thành dependency của useEffect nữa !)
	// -> tiếp tục lấy giá trị query params trong object productListQueryParams và lưu vào biến query config, có type QueryConfigType

	// Lưu ý ta cần khai báo kiểu QueryConfigType như sau:
	// type QueryConfigType = {
	//   page?: string;
	//   limit?: string;
	//   order?: string;
	//   sort_by?: string;
	//   category?: string;
	//   exclude?: string;
	//   rating_filter?: string;
	//   price_max?: string;
	//   price_min?: string;
	//   name?: string;
	// };
	// -> cấu trúc giống hệt interface ProductListQueryParams
	// -> ta khai báo theo kiểu lấy hết các thuộc tính của inteface ProductListQueryParams nhưng tuy nhiên thay hết = string (vì giá trị lấy ra từ url và lưu vào
	// object productListQueryParams đều là string)

	// Handle chức năng Tìm kiếm sản phẩm:
	// -> tại page ProductList -> filter, lọc priceMax+priceMin/ lọc category
	// -> truyền lên url các query params: rating_filter, price_max, price_min, category
	// -> khi thực hiện nhập từ khóa vào thanh tìm kiếm: ví dụ: Áo nam -> bắn khối query params lên url và xóa đi 1 vài query params
	// - Bước 1: tạo 1 custome hook riêng: useQueryConfig.
	// -> trả về object queryConfig chứa các thuộc tính và giá trị là các query params thu được từ productListQueryParams.
	// -> phân tích lý do vì sao ta chọn cách triển khai bằng custome hook:
	// Thanh tìm kiếm sản phẩm nằm trong Component Header
	// Component ProductList cũng cần các query params và nằm riêng biệt so với component Header
	// -> chọn cách tạo ra 1 custome hook useQueryConfig -> cả 2 Component đều có thể gọi vào và lấy được.
	const queryConfig = useQueryConfig();
	const navigate = useNavigate();

	// app dispatch để dispatch thunk actions
	const appDispatch = useAppDispatch();
	// -> tại component Header dùng tương tự custome hook useQueryConfig() -> thu được object queryConfig chứa các cặp key/value là các
	// query params

	// lấy dữ liệu product list từ Slice
	const productListFromSlice = useSelector((state: RootState) => state.productList.productList);
	const categoriesFromSlice = useSelector((state: RootState) => state.productList.categories);
	const pagination = useSelector((state: RootState) => state.productList.pagination);
	const productListLoadingStatus = useSelector((state: RootState) => state.productList.isLoading);

	// tổng số trang:
	const totalPage: number = pagination.page_size;

	// Biến quản lý trạng thái quay về trang đầu tiên khi currentPage > totalPage
	const toFirstPage = useMemo(() => Number(queryConfig.page) > (totalPage as number), [queryConfig.page, totalPage]);

	// Handle bug: khi số trang hiện tại > total Page -> vẫn ở trang hiện tại
	useEffect(() => {
		if (toFirstPage) {
			const newSearchParams = createSearchParams({
				...queryConfig,
				page: "1",
			}).toString();
			// Nếu như số trang hiện tại lớn hơn tổng số trang
			// -> navigate về url được ghi đè số trang hiện tại = 1
			// -> tự động call API get List
			navigate(`${paths.defaultPath}?${newSearchParams}`);
		}
	}, [navigate, toFirstPage, queryConfig]);

	// Product List và Categories lấy từ Slice
	const productList = useMemo(() => productListFromSlice, [productListFromSlice]);
	const categories = useMemo(() => categoriesFromSlice, [categoriesFromSlice]);

	// const previousQueryConfigRef = useRef();
	// previousQueryConfigRef.current = queryConfig;

	// Side effect quản lý tác vụ dispatch Thunk Action -> call API get Product List
	useEffect(() => {
		const getProductListPromise = appDispatch(getProductListThunkAction(queryConfig));
		return () => getProductListPromise.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appDispatch, queryConfig]);

	// Side effect quản lý tác vụ dispatch Thunk Action -> call API get Categories
	useEffect(() => {
		const getCategoriesPromise = appDispatch(getCategoriesThunkAction());
		return () => getCategoriesPromise.abort();
	}, [appDispatch]);

	return (
		<div className={`flex w-[1200px] ${!productList ? "min-h-1000px" : ""}`}>
			<Helmet>
				<title>Trang chủ | Shopee clone</title>
				<meta name='description' content='Trang chủ - Dự án Shopee clone' />
			</Helmet>
			<AsideFilter categoriesData={categories} queryConfig={queryConfig} />
			<div className={`flex flex-col justify-start ${!productList ? "h-full" : ""}`}>
				{productListLoadingStatus && (
					<div className='flex flex-wrap mt-2 w-[1000px] min-h-[800px] pb-10'>
						{Array(Number(queryConfig.limit))
							.fill(undefined)
							.map((_, index) => (
								<SkeletonLoadingProductItem key={index} />
							))}
					</div>
				)}
				{!productList && (
					<div className='flex flex-wrap mt-2 w-[1000px] min-h-[800px] pb-10'>
						{Array(Number(queryConfig.limit))
							.fill(undefined)
							.map((_, index) => (
								<SkeletonLoadingProductItem key={index} />
							))}
					</div>
				)}
				{productList && !productListLoadingStatus && (
					<>
						<Sort queryConfig={queryConfig} totalPage={totalPage} categoriesData={categories} />
						<div className='grid grid-cols-5 gap-2 xl:grid-cols-4 lg:grid-cols-2 sm:grid-cols-2 mt-2 pb-10 lowMobile:grid-cols-1'>
							{productList.map((product) => (
								<ProductItem key={product._id} product={product} />
							))}
						</div>
						<Pagination queryConfig={queryConfig} totalPage={totalPage} />
					</>
				)}
			</div>
		</div>
	);
}
// -> chi tiết tuần tự luồng chạy của đoạn code trong component ProductList khi productListQueryParams thay đổi:
// 1. Ban đầu, component ProductList được tạo ra và hiển thị trên giao diện. Tại thời điểm này, biến productListQueryParams đã được khởi tạo từ custom hook
// useProductListQueryParams.
// 2. Khi productListQueryParams thay đổi (ví dụ: khi bạn truyền query params mới lên URL), React sẽ tự động re-render lại component ProductList với giá trị
// productListQueryParams mới.
// 3. Trong quá trình re-render, hook useQuery được gọi lại. Nó sẽ kiểm tra xem các dependencies đã thay đổi hay chưa (trong trường hợp này, dependency là
// productListQueryParams). Vì productListQueryParams đã thay đổi, hook useQuery nhận thấy rằng có sự thay đổi trong dependencies và tiến hành thực hiện lại các bước bên
// trong.
// 4. Hook useQuery gọi hàm queryFn mà bạn đã cung cấp. Trong trường hợp này, queryFn là getProductListApi(productListQueryParams).
// 5. Hàm getProductListApi được gọi với productListQueryParams mới. Điều này có nghĩa là bạn đang yêu cầu lấy dữ liệu sản phẩm mới từ server dựa trên các query params
// mới.
// 6. Sau khi nhận được dữ liệu từ server, hook useQuery sẽ cập nhật data với dữ liệu mới.
// 7. Component ProductList lại được re-render, lần này với dữ liệu mới từ server. Khi component được re-render, nó sẽ hiển thị danh sách sản phẩm dựa trên dữ liệu mới.
// -> Tóm lại, quá trình thay đổi productListQueryParams dẫn đến việc re-render của component ProductList, kích hoạt lại việc gọi API thông qua useQuery, và sau đó hiển
// thị dữ liệu mới lấy được từ server lên giao diện.

// - Ta sẽ truyền toàn bộ khối object queryConfig vào component Pagination thay vì truyền riêng lẻ từng giá trị, mục đích là để trong tương lai, query params có
// nhiều giá trị cùng 1 lúc, giả sử ta thay đổi chỉ 1 giá trị trong nhóm giá trị đó thì chỉ có duy nhất giá trị đó bị cập nhật lại -> các giá trị khác không đổi.

// Lưu ý: API ta đang sử dụng hỗ trợ Pagination gồm:
// pagination: { limit: 30, page: 1, page_size:2 }
