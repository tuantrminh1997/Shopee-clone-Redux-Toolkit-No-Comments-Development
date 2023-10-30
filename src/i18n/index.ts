/* eslint-disable import/no-named-as-default-member */
// Handle tính năng đa ngôn ngữ trong ứng dụng React - ứng dụng thư viện i18n
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// locales;
// english:
import PRODUCT_LIST_ENGLISH from "src/locales/english/productList.json";
import PRODUCT_ITEM_DETAIL_ENGLISH from "src/locales/english/productItemDetail.json";
import HEADER_ENGLISH from "src/locales/english/header.json";
import LOGIN_REGISTER_ENGLISH from "src/locales/english/loginRegister.json";
import CART_ENGLISH from "src/locales/english/cart.json";
import USER_ENGLISH from "src/locales/english/user.json";
import FOOTER_ENGLISH from "src/locales/english/footer.json";
// vietnamese:
import PRODUCT_LIST_VIETNAMESE from "src/locales/vietnamese/productList.json";
import PRODUCT_ITEM_DETAIL_VIETNAMESE from "src/locales/vietnamese/productItemDetail.json";
import HEADER_VIETNAMESE from "src/locales/vietnamese/header.json";
import LOGIN_REGISTER_VIETNAMESE from "src/locales/vietnamese/loginRegister.json";
import CART_VIETNAMESE from "src/locales/vietnamese/cart.json";
import USER_VIETNAMESE from "src/locales/vietnamese/user.json";
import FOOTER_VIETNAMESE from "src/locales/vietnamese/footer.json";
// locales = handle vấn đề load tên ngôn ngữ đã target lên phần hover target
export const locales = {
	vietnamese: "tiếng việt",
	english: "english",
};

// Khai báo 1 namespace default để handle tình huống tại component, sử dụng const { t } = useTranslation();
// -> không truyền 1 namespace cụ thể vào hoặc component không nhận diện được namespace muốn truyền
// -> mặc định lấy namespace default
export const defaultNamespace = "home";
// -> đặt xuống defaultNS tại i18 để phân phối ra toàn bộ dự án

export const resources = {
	vietnamese: {
		// các namespace tương ứng với các pages trong dự án, được hỗ trợ bộ chuyển đổi ngôn ngữ
		// -> tiếp tục khai báo các namespaces được sử dụng trong dự án ở array ns
		productList: PRODUCT_LIST_VIETNAMESE,
		productItemDetail: PRODUCT_ITEM_DETAIL_VIETNAMESE,
		header: HEADER_VIETNAMESE,
		loginRegister: LOGIN_REGISTER_VIETNAMESE,
		cart: CART_VIETNAMESE,
		user: USER_VIETNAMESE,
		footer: FOOTER_VIETNAMESE,
	},
	// namespace
	english: {
		// các namespace tương ứng với các pages trong dự án, được hỗ trợ bộ chuyển đổi ngôn ngữ
		// -> tiếp tục khai báo các namespaces được sử dụng trong dự án ở array ns
		productList: PRODUCT_LIST_ENGLISH,
		productItemDetail: PRODUCT_ITEM_DETAIL_ENGLISH,
		header: HEADER_ENGLISH,
		loginRegister: LOGIN_REGISTER_ENGLISH,
		cart: CART_ENGLISH,
		user: USER_ENGLISH,
		footer: FOOTER_ENGLISH,
	},
} as const;

// Phân phối bộ chuyển đổi ngôn ngữ ra toàn bộ phạm vi dự án
i18n.use(initReactI18next).init({
	resources,
	// Ngôn ngữ mặc định của ứng dụng  = vietnamese
	lng: "vietnamese",
	// Các namespaces được sử dụng trong dự án
	ns: ["productList", "productItemDetail"],
	// Ngôn ngữ fallback = trong tình huống user chưa xác định được ngôn ngữ cần chọn -> mặc định cho về vietnamese
	fallbackLng: "vietnamese",
	defaultNS: defaultNamespace,

	// - Trong React, việc render dữ liệu dưới dạng JSX đã được thiết kế để mặc định chống tấn công XSS (cross-site
	// scripting) bằng cách áp dụng xử lý an toàn đối với dữ liệu động. Điều này có nghĩa là React sẽ mặc định
	// escape (hoặc làm cho vô hiệu hóa) các giá trị động được chèn vào các phần tử JSX để đảm bảo rằng chúng
	// không thể thực hiện mã JavaScript độc hại.
	// - Do đó, khi bạn sử dụng React và đã có cơ chế bảo vệ XSS mặc định, bạn có thể tắt chức năng chống tấn
	// công XSS của thư viện i18next bằng cách đặt escapeValue thành false, như trong đoạn cấu hình bạn đã đưa ra. Điều này sẽ loại bỏ việc thực hiện escape (vô hiệu hóa) các giá trị trong quá trình dịch, bởi vì bạn đã tin tưởng vào cơ chế bảo vệ XSS của React.

	// - một trong những phương pháp tối ưu nhất để chống tấn công XSS (Cross-Site Scripting) là sử dụng các thư viện và framework phía client mạnh mẽ như React, Angular, hoặc Vue.js để xây dựng ứng dụng web. Các thư viện và framework này đã được thiết kế và kiểm tra kỹ lưỡng để bảo vệ chống XSS mặc định.
	// - Dưới đây là một số cách mà các thư viện và framework phía client giúp bảo vệ chống tấn công XSS:
	// 1. Escape by Default: Các thư viện này mặc định sẽ escape (vô hiệu hóa) các giá trị động được chèn vào các phần tử JSX. Điều này đảm bảo rằng các đoạn mã JavaScript độc hại không thể được thực thi ngay cả khi chúng được chèn vào các thành phần giao diện người dùng.
	// 2. DOM Sanitization: Một số framework như Angular điều khiển việc render HTML và cung cấp bộ lọc để đảm bảo rằng dữ liệu động không thể chèn các thẻ HTML nguy hiểm.
	// 3. Content Security Policy (CSP): CSP là một cơ chế bảo vệ bổ sung có thể được sử dụng để kiểm soát từng nguồn tải và giới hạn việc thực thi mã JavaScript từ các nguồn không tin cậy.
	// 4. Kỹ thuật khác: Các thư viện và framework phía client thường cung cấp các kỹ thuật bảo mật khác như hạn chế truy cập Cookie, hạn chế truy cập tài nguyên bên ngoài, và quản lý an toàn cho các yêu cầu AJAX và gửi đi.
	// -> Tuy nhiên, điều quan trọng là bạn vẫn phải tuân thủ các best practice bảo mật và kiểm tra ứng dụng của mình thường xuyên để đảm bảo rằng không có lỗ hổng XSS nào xuất hiện. Dự án open source như React và Angular cũng thường cập nhật để bảo mật chống XSS tốt hơn trong phiên bản mới.
	interpolation: {
		escapeValue: false,
	},
});
// -> cấu hình xong, tiến hành import vào file tổng: app hoặc main (ta nên chọn main).
// -> sau đó vào component quản lý Selection chuyển đổi ngôn ngữ: Tiếng Việt - Tiếng Anh -> khai báo hàm handleChangeLanguage
export default i18n;
