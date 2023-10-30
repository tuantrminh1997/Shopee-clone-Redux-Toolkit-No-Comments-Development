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

	const {
		reset: resetForm,
		register,
		handleSubmit,
	} = useForm<ProductListSearchFormType>({
		defaultValues: {
			productListSearchForm: "",
		},
		resolver: yupResolver(productListSearchSchema),
	});

	const queryConfig = useQueryConfig();

	useEffect(() => {
		if (isLoggedIn) {
			const getPurchaseListPromise = appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
			return () => getPurchaseListPromise.abort();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoggedIn, appDispatch]);
	const purchaseListInCartFromReducer = useSelector((state: RootState) => state.purchaseList.purchaseListInCart);
	const purchaseListInCart = useMemo(() => purchaseListInCartFromReducer, [purchaseListInCartFromReducer]);

	const handleLogout = async () => {
		await appDispatch(logoutThunkAction())
			.unwrap()
			.then((data) => {
				dispatch(setCurrentUserProfileAction(null));
				dispatch(setIsLoggedInAction(false));
				dispatch(setPurchaseList([]));
				const successMessage = data.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 2000,
				});
			});
	};

	// method quản lý chức năng submit form:
	const handleSubmitForm = handleSubmit((dataFormSuccess) => {
		const productName = dataFormSuccess.productListSearchForm;
		const config = queryConfig.order
			? omit(
					{
						...queryConfig,
						name: productName,
					},
					["order", "sort_by"],
			  )
			: {
					...queryConfig,
					name: productName,
			  };
		navigate({
			pathname: paths.defaultPath,
			search: createSearchParams(config).toString(),
		});
		resetForm();
	});
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
					<ShopeeHeaderLogo isHeaderForCartLayout={isHeaderForCartLayout} />
					<SearchForm isHeaderForCartLayout={isHeaderForCartLayout} handleSubmitForm={handleSubmitForm} register={register} />
					{!isHeaderForCartLayout && <Cart purchaseList={purchaseListInCart} isLoggedIn={isLoggedIn} />}
				</div>
			</div>
		</div>
	);
}
