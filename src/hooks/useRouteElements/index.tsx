// react hooks:
import { lazy, Suspense } from "react";
// react - router - dom:
import { Navigate, Outlet, useRoutes } from "react-router-dom";
// layouts:
import { RegisterLayout, MainLayout, CartLayout, UserProfileLayout } from "src/layouts";
// paths constants:
import { paths } from "src/constants";
// types
import { RootState } from "src/types";
// react redux
import { useSelector } from "react-redux";

// Tối ưu hiệu suất ứng dụng bằng lazy load: Chú ý không cần sử dụng đoạn import các Page ở trên nữa.
// Tối ưu hiệu suất ứng dụng frontend bằng cách sử dụng lazy loading là một phần quan trọng của việc xây dựng ứng dụng web hiệu quả và nhanh chóng. Dưới đây là ý nghĩa của
// việc tối ưu hiệu suất ứng dụng front end bằng lazy load:
// 1. Tăng tốc tải trang: Khi ứng dụng được tải lần đầu, nó có thể chứa rất nhiều mã nguồn và tài nguyên. Lazy loading cho phép bạn chia nhỏ ứng dụng thành các phần, chỉ
// tải những phần cần thiết ban đầu. Điều này dẫn đến thời gian tải trang nhanh hơn, cải thiện trải nghiệm người dùng và giảm tải cho máy chủ.
// 2. Tiết kiệm băng thông: Lazy loading giúp giảm việc tải các tài nguyên không cần thiết khi người dùng truy cập trang web của bạn. Điều này đặc biệt quan trọng đối với
// người dùng di động có giới hạn băng thông.
// 3. Giảm thời gian khởi đầu ứng dụng: Khi một ứng dụng được tải, việc tải toàn bộ mã nguồn và tài nguyên có thể tốn thời gian và tài nguyên hệ thống. Lazy loading giúp
// giảm thời gian cần thiết để ứng dụng bắt đầu hoạt động.
// 4. Tối ưu hóa bộ nhớ: Khi ứng dụng không tải toàn bộ mã nguồn và tài nguyên cùng một lúc, nó sẽ sử dụng ít bộ nhớ hơn. Điều này đặc biệt quan trọng trên các thiết bị có
// tài nguyên hạn chế như điện thoại di động.
// 5. Phân chia công việc phát triển: Lazy loading cho phép nhóm phát triển chia ứng dụng thành các module riêng lẻ. Mỗi module có thể được phát triển và bảo trì độc lập,
// giúp tối ưu hóa quá trình phát triển và bảo trì.
// 6. Tăng khả năng mở rộng: Khi ứng dụng của bạn ngày càng phát triển, việc sử dụng lazy loading giúp tăng khả năng mở rộng. Bạn có thể thêm các module mới mà không ảnh
// hưởng đến hiệu suất tổng thể của ứng dụng.
// 7. Cải thiện SEO: Lazy loading cũng có thể giúp tối ưu hóa cho SEO. Việc tải nội dung quan trọng trước giúp trình duyệt và các công cụ tìm kiếm hiểu được nội dung trang
// web của bạn nhanh hơn.
// -> Tóm lại, việc sử dụng lazy loading là một cách quan trọng để tối ưu hiệu suất ứng dụng frontend, giúp cải thiện trải nghiệm người dùng, tiết kiệm tài nguyên, và tăng
// khả năng mở rộng của ứng dụng.
const Cart = lazy(() => import("src/pages/Cart"));
const Login = lazy(() => import("src/pages/Login"));
const ProductList = lazy(() => import("src/pages/ProductList"));
const Profile = lazy(() => import("src/pages/UserProfile/Profile"));
const Register = lazy(() => import("src/pages/Register"));
const ProductItemDetail = lazy(() => import("src/pages/ProductItemDetail"));
const ChangePassword = lazy(() => import("src/pages/UserProfile/ChangePassword"));
const Purchases = lazy(() => import("src/pages/UserProfile/Purchases"));
const PageNotFound = lazy(() => import("src/pages/PageNotFound"));

// Route quản lý việc: ngăn chặn truy cập vào Route Profile khi chưa Login -> cố tình truy cập thì Navigate về Route login
const ProtectedRoute: () => React.ReactElement = () => {
	// lấy giá trị của biến isLoggedIn từ reducer:
	const isLoggedIn = useSelector((state: RootState) => state.authentication.isLoggedIn);
	// Những Route truy cập vào đây
	// Nếu như User đã loggedin -> isLoggedIn = true -> tiếp tục cho truy cập vào Outlet, còn không thì Navigate về Route login
	return isLoggedIn ? <Outlet /> : <Navigate to='/login' />;
};

// Route quản lý việc ngăn chặn truy cập vào Route login hoặc register, khi đã login
// -> RejectedRoute = ngược lại của ProtectedRoute
// -> Khi user đã loggedIn -> isLoggedIn = true -> không cho phép User truy cập vào Route /login /register nữa, nếu user
// cố tình truy cập -> navigate sang route khác
const RejectedRoute: () => React.ReactElement = () => {
	// lấy giá trị của biến isLoggedIn từ reducer:
	const isLoggedIn = useSelector((state: RootState) => state.authentication.isLoggedIn);
	// nếu !isLoggedIn -> chưa login -> cho phép truy cập vào /login hoặc /register, còn đã login -> Navigate về Route /
	return !isLoggedIn ? <Outlet /> : <Navigate to='/' />;
};

export default function useRouteElements() {
	const { cart, profile, changePassword, purchases, login, register, productItemDetail, productList, user } = paths;
	const element = useRoutes([
		// ProtectedRoute = Route ngăn chặn truy cập vào Route profile (MainLayout) vì chưa login
		// -> route /profile là children của Route ProtectedRoute
		// -> trong trường hợp user cố tình truy cập vào route /profile -> bị navigate sang route /login
		{
			path: "",
			element: <ProtectedRoute />, // -> Những route cần đăng nhập
			children: [
				{
					path: cart,
					element: (
						<CartLayout>
							<Suspense>
								<Cart />
							</Suspense>
						</CartLayout>
					),
				},
				// My Account
				{
					path: user,
					element: <MainLayout />,
					children: [
						{
							path: "",
							element: <UserProfileLayout />,
							children: [
								{
									path: profile,
									element: (
										<Suspense>
											<Profile />
										</Suspense>
									),
								},
								{
									path: changePassword,
									element: (
										<Suspense>
											<ChangePassword />
										</Suspense>
									),
								},
								{
									path: purchases,
									element: (
										<Suspense>
											<Purchases />
										</Suspense>
									),
								},
							],
						},
					],
				},
			],
		},
		// RejectedRoute -> Route ngăn chặn truy cập vào Route /login và /register (vì đã Login)
		// -> children của RejectedRoute là 2 route bị ngăn chặn: /login, /register
		{
			path: "",
			element: <RejectedRoute />,
			children: [
				{
					path: "",
					element: <RegisterLayout />,
					children: [
						{
							path: login,
							element: (
								<Suspense>
									<Login />
								</Suspense>
							),
						},
						{
							path: register,
							element: (
								<Suspense>
									<Register />
								</Suspense>
							),
						},
					],
				},
			],
		},
		{
			path: "",
			element: <MainLayout />,
			children: [
				{
					path: productItemDetail, // :id, click vào thẻ Link -> bắn path url /[ProductItemId] lên thanh url -> render Element
					index: true,
					element: (
						<Suspense>
							<ProductItemDetail />
						</Suspense>
					),
				},
				// Chú ý: Về đúng mặt Logic, thì khi chuyển Route -> React Router Dom sẽ unmounted element cũ và mounted lại Element mới
				// tuy nhiên, sự thông minh của React-Router-Dom ở đây đó là khi chuyển Route, ReactRouterDom nhận thấY 2 component ProductItemDetail và ProductList nhận chung 1 Parent là MainLayot
				// -> Mục đích chính là để cải thiện hiệu suất ứng dụng bằng cách tránh việc thực hiện những công việc không cần thiết mỗi khi chuyển đổi Route.
				// -> dẫn đến Component MainLayout không bị unmounted và mounted lại, mà chỉ bị re-render và mounted vào ProductList (khi chuyển route giữa ProductItemDetail -> ProductList )
				// -> Component Header nằm trong MainLayout cũng chỉ bị re-render chứ không bị unmounted và mounted lạui 2 lần liên tiếp.
				// -> query nằm trong Component Header cũng không bị gọi lại thêm lần nữa -> không bị call Api lần nữa.
				{
					path: productList,
					index: true,
					element: (
						<Suspense>
							<ProductList />
						</Suspense>
					),
				},
				{
					path: "*",
					element: (
						<Suspense>
							<PageNotFound />
						</Suspense>
					),
				},
			],
		},
	]);
	return element;
}
