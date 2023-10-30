/* eslint-disable @typescript-eslint/no-explicit-any */
// react hooks
import { useEffect, useMemo } from "react";
// react-hook-form:
import { useForm } from "react-hook-form";
// react toastify
import { toast } from "react-toastify";
// yup:
import { yupResolver } from "@hookform/resolvers/yup";
// react-router-dom:
import { createSearchParams, useNavigate } from "react-router-dom";
// lodash:
// Chú ý: do thư viện lodash không có tính năng tree-shaking, đó là khi ta cài đặt thư viện vào dependency, import vào componant -> mặc định lodash sẽ import toàn bộ cả
// bộ thư viện lodash vào, -> gây ra tăng dung lượng file Production 1 cách không cần thiết khi build ra.
// -> fix bằng cách import kiểu này:
import omit from "lodash/omit";
// react redux
import { useDispatch, useSelector } from "react-redux";
// app context
// custome hooks:
import { useAppDispatch, useQueryConfig } from "src/hooks";
// types:
import { ProductListSearchFormType, HeaderPropsType, RootState } from "src/types";
// schemas:
import { productListSearchSchema } from "src/utils";
// constants:
import { paths, purchaseStatus } from "src/constants";
// thunk actions
import { logoutThunkAction, getPurchaseListInCartThunkAction } from "src/thunkActions";
// actions
import { setPurchaseList } from "src/slices/purchaseListSlice";
import { setIsLoggedInAction } from "src/slices/authenticationSlice";
import { setCurrentUserProfileAction } from "src/slices/userProfileSlice";
// private components:
import { LoginRegisterLanguages, SearchForm, ShopeeHeaderLogo, Cart } from "./components";

// Trước mắt component Header dùng cho MainLayout -> Layout sau khi đăng nhập thành công
export default function Header({ isHeaderForCartLayout = false }: HeaderPropsType) {
	// React Context -> App Context
	// isLoggedIn = Context API quản lý trạng thái đăng nhập: có accessToken lưu trong LocalStorage hay không ?
	// userProfile được lấy từ Local Storage (lưu vào Local Storage nhờ Interceptor - Axios)
	const isLoggedIn = useSelector((state: RootState) => state.authentication.isLoggedIn);
	const currentUserProfileFromSlice = useSelector((state: RootState) => state.userProfile.currentUserProfile);
	const userProfile = useMemo(() => currentUserProfileFromSlice, [currentUserProfileFromSlice]);
	// constants:
	const { inCart } = purchaseStatus;
	const navigate = useNavigate();

	// react redux hook
	const dispatch = useDispatch();

	// custome hooks
	const appDispatch = useAppDispatch();

	// react-hook-form cho Product Search Form:
	// type ProductListSearchFormType có cấu trúc kế thừa schema productListSearchSchema {productListSearchForm: string}
	// type ProductListSearchFormType khai báo type cho data của form khi submit thành công
	// type ProductListSearchFormType khai báo type cho object defaultValues luôn !
	const {
		reset: resetForm,
		register,
		handleSubmit,
	} = useForm<ProductListSearchFormType>({
		defaultValues: {
			productListSearchForm: "",
		},
		// Ta đã khai báo type ProductListSearchFormType kế thừa lại cấu trúc của Schema productListSearchSchema
		// -> để cho các rule trong schema này được ép vào form và phát huy tác dụng
		// -> đặt schema vào resolver: yupResolver()
		resolver: yupResolver(productListSearchSchema),
	});

	// custome hook useQueryConfig -> trả về toàn bộ query Params trên trên thanh url
	// -> lưu vào biến queryConfig
	const queryConfig = useQueryConfig();

	// query data quản lý tác vụ get purchase list
	useEffect(() => {
		if (isLoggedIn) {
			const getPurchaseListPromise = appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
			return () => getPurchaseListPromise.abort();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoggedIn, appDispatch]);
	const purchaseListInCartFromReducer = useSelector((state: RootState) => state.purchaseList.purchaseListInCart);
	const purchaseListInCart = useMemo(() => purchaseListInCartFromReducer, [purchaseListInCartFromReducer]);

	// method quản lý chức năng Logout:
	const handleLogout = async () => {
		await appDispatch(logoutThunkAction())
			.unwrap()
			.then((data) => {
				// logout thành công:
				// 1. set userProfile thành null
				dispatch(setCurrentUserProfileAction(null));
				// 2. set isLoggedIn (trong authenticationSlice -> false)
				dispatch(setIsLoggedInAction(false));
				// 3. xoá dữ liệu purchase list trong
				dispatch(setPurchaseList([]));
				// toast thông báo lên -> logout thành công
				const successMessage = data.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 2000,
				});
			});
	};

	// method quản lý chức năng submit form:
	const handleSubmitForm = handleSubmit((dataFormSuccess) => {
		// Chạy vào callback này khi success form thành công
		// -> đồng nghĩa với việc chỉ chạy vào callback này khi object errors trong formState(errors) trống rỗng.
		// -> submit form thành công
		// -> Bắn các giá trị nhập vào form lên thanh Url.
		// -> Sử dụng navigate = useNavigate()(react-router-dom)
		const productName = dataFormSuccess.productListSearchForm;
		// Nếu như có giá trị order trên url -> omit đi sort_by = price và order = asc/desc
		// Còn không thì giữ nguyên
		const config = queryConfig.order
			? omit(
					{
						...queryConfig,
						// ghi đè thuộc tính name:
						name: productName,
					},
					// Các trường thuộc tính bị xóa bỏ khi thực hiện Search tên sản phẩm
					// Chú ý: API không hỗ trợ search ký tự không dấu, cần phải search ký tự đầy đủ dấu, không cần uppercase
					["order", "sort_by"],
			  )
			: {
					...queryConfig,
					// ghi đè thuộc tính name:
					name: productName,
			  };
		navigate({
			pathname: paths.defaultPath,
			search: createSearchParams(config).toString(),
		});
		resetForm();
	});

	// Query quản lý tác vụ callAPI get purchase List -> nhận dữ liệu Các sản phẩm đang có trong cart -> truyền vào Component Cart -> đổ ra UI
	// -> Query không bị gọi lại khi chuyển Page có cùng layout là MainLayout, do MainLayout khi đó chỉ bị re-render
	// -> query này không bị inactive (query bị inactive khi component chứa nó bị unmunted hàon toàn -> khi đó query bắt đầu bị tính thời gian kể từ khi bị xoá)
	// -> không cần thiết phải set staleTime là infinity (vô hạn)
	// Chú ý: Khi component chứa query bị unmounted, thì React Query sẽ ngừng tính thời gian "stale" cho query đó. Nghĩa là nếu bạn mounted lại component và query đó được gọi lại, thời
	// gian "stale" sẽ tính lại từ đầu, không tính tiếp từ thời điểm trước đó khi component bị unmounted.
	// const { data: purchaseListQueryData } = useQuery({
	// 	queryKey: ["purchaseList", { status: inCart }],
	// 	// Chú ý: sẽ phát sinh vấn đề khi thêm 1 sản phẩm vào giỏ hàng -> dữ liệu thêm mới trong giỏ hàng chưa được cập nhật và đổ ra UI
	// 	// -> nguyên nhân: do khi kích hoạt sự kiện onClick -> thêm vào giỏ hàng -> call API -> cập nhật mới dữ liệu giỏ hàng trên Server và success
	// 	queryFn: () => getPurchaseListApi({ status: inCart }),
	// 	// Sau khi logout vaf reload lại page -> component header được mounted lại và gọi API getPurchaseListApi, tuy nhiên do đã logout và không còn token trong localStorage
	// 	// -> cuộc gọi API bị lỗi
	// 	// -> fix các vấn đề:
	// 	// 1. sau khi đã logout thì không còn sản phẩm nào trong giỏ hàng.
	// 	// 2. đồng thời không call API getPurchaseListApi -> handle bằng cách sử dụng context isLoggedIn -> enabled khi isLoggedIn = truthy
	// 	enabled: isLoggedIn,
	// });
	return (
		<div
			className={`text-white w-full flex h-[119px] ${
				isHeaderForCartLayout
					? "bg-white border-b border-[rgba(0,0,0,.09)]"
					: "bg-[linear-gradient(-180deg,#f53d2d,#f63)] z-[999] lg:sticky lg:top-0 lg:right-0 lg:left-0"
			}`}
		>
			<div className={`flex flex-col justify-start w-[1200px] h-full m-auto ${isHeaderForCartLayout ? "flex justify-center" : ""} xl:w-full`}>
				{!isHeaderForCartLayout && <LoginRegisterLanguages isLoggedIn={isLoggedIn} userProfile={userProfile} handleLogout={handleLogout} />}
				<div
					className={`flex items-center justify-between flex-1 ${
						isHeaderForCartLayout ? "w-[1200px] xl:grid xl:grid-cols-1 xl:w-[100%] xl:justify-center" : ""
					}`}
				>
					{/* Logo Shopee -> tái sử dụng Component PopoverOption do có cấu trúc giống */}
					<ShopeeHeaderLogo isHeaderForCartLayout={isHeaderForCartLayout} />
					{/* 
          - Chức năng tìm kiếm tên sản phẩm -> sử dụng React Hook Form -> useForm, src/utils/schemas/ProductListSearchSchema
          */}
					<SearchForm isHeaderForCartLayout={isHeaderForCartLayout} handleSubmitForm={handleSubmitForm} register={register} />
					{!isHeaderForCartLayout && <Cart purchaseList={purchaseListInCart} isLoggedIn={isLoggedIn} />}
				</div>
			</div>
		</div>
	);
}
