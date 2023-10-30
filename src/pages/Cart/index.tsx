/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// assets:
import emtyCartBackground from "src/assets/shopee-emty-cart-background.png";
// react hooks:
import { useEffect, useMemo, useCallback, useRef } from "react";
// i18n
import { useTranslation } from "react-i18next";
// react redux
import { useDispatch, useSelector } from "react-redux";
// react - router - dom:
import { useLocation } from "react-router-dom";
import keyBy from "lodash/keyBy";
import { Helmet } from "react-helmet-async";
// react toastify:
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// types
import { BuyProductsApiPropsType, ExtendPurchaseSuccessResponse, ProductItemApiType, RootState } from "src/types";
// constants
import { purchaseStatus, paths } from "src/constants";
// actions
import {
	setPurchaseItemDisableStatusAction,
	setPurchaseItemQuantityOnTypeAction,
	updateExtendPurchaseListAction,
	setPurchaseItemCheckStatusAction,
	setAllPurchaseItemCheckStatusAction,
} from "src/slices/purchaseListSlice";
// private components:
import { TitleArea, SettlementArea } from "./components";
// common components:
import { PurchaseItem, Button } from "src/components";
// custome hooks
import { useAppDispatch } from "src/hooks";
import {
	buyCheckedPurchaseItemsThunkAction,
	deletePurchaseItemThunkAction,
	getPurchaseListInCartThunkAction,
	updatePurchaseListThunkAction,
} from "src/thunkActions";

export default function Cart() {
	const extendPurchaseList: ExtendPurchaseSuccessResponse[] = useSelector((state: RootState) => state.purchaseList.extendPurchaseList);
	const isLoggedIn: boolean = useSelector((state: RootState) => state.authentication.isLoggedIn);

	// constants:
	const { inCart } = purchaseStatus;
	const { productList: productListUrl } = paths;
	const dispatch = useDispatch();
	const appDispatch = useAppDispatch();

	useEffect(() => {
		if (isLoggedIn) {
			const getPurchaseListPromise = appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
			return () => getPurchaseListPromise.abort();
		}
	}, [isLoggedIn]);

	const purchaseListFromReducer = useSelector((state: RootState) => state.purchaseList.purchaseListInCart);
	const purchaseList = useMemo(() => purchaseListFromReducer, [purchaseListFromReducer]);

	const checkedPurchaseItems = useMemo(() => extendPurchaseList.filter((purchaseItem) => purchaseItem.isCheck), [extendPurchaseList]);

	const checkedPurchaseItemsCount = useMemo(() => checkedPurchaseItems.length, [checkedPurchaseItems]);

	const location = useLocation();

	const purchaseProductItemId = useMemo(() => location.state?.purchaseProductItemId, [location]);

	useEffect(() => {
		if (purchaseList) {
			const extendPurchaseObject = keyBy(extendPurchaseList, "_id");
			const newPurchaseList =
				purchaseList.map((purchaseItem) => {
					const isBuyNowProductItemDetail = (purchaseProductItemId as string | null) === (purchaseItem._id as string);
					return {
						...purchaseItem,
						isCheck: isBuyNowProductItemDetail || Boolean(extendPurchaseObject[purchaseItem._id]?.isCheck) || false,
						disabled: false,
					};
				}) || [];
			dispatch(updateExtendPurchaseListAction(newPurchaseList));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [purchaseList, purchaseProductItemId, dispatch]);

	useEffect(() => {
		return () => {
			history.replaceState(null, "");
		};
	}, []);

	// Handle bài toán 2 way binding -> khi check mà chưa check thì check, khi check mà đã check thì bỏ check của input type = checkbox
	const handleCheck: (purchaseItemIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => void =
		(purchaseItemIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
			const purchaseItemCheckStatus: boolean = event.target.checked;
			dispatch(setPurchaseItemCheckStatusAction({ purchaseItemIndex, purchaseItemCheckStatus }));
		};

	// Handle chức năng chọn tất cả:
	const isCheckFull: boolean = useMemo(() => extendPurchaseList.every((extendPurchaseItem) => extendPurchaseItem.isCheck), [extendPurchaseList]);

	// Method quản lý chức năng bật chọn tất cả -> bật thuộc tính isCheck của tất cả các đối tượng.
	const handleCheckFull: () => void = () => {
		const checkFullExtendPurchaseListItems = extendPurchaseList.map((extendPurchaseItem) => {
			const checkedPurchaseItem = { ...extendPurchaseItem, isCheck: !isCheckFull };
			return checkedPurchaseItem;
		});
		dispatch(setAllPurchaseItemCheckStatusAction(checkFullExtendPurchaseListItems));
	};

	// trạng thái loading của purchase list
	const purchaseListLoading = useSelector((state: RootState) => state.purchaseList.purchaseListLoading);

	// Method handle chức năng tiến hành mua/thanh toán các Purchase Item đã được check
	const handleBuyCheckedPurchaseItems: () => void = async () => {
		if (checkedPurchaseItemsCount < 1) {
			toast.error("Vui lòng tích chọn các sản phẩm bạn muốn thanh toán", {
				position: "top-right",
				autoClose: 2000,
			});
			return;
		}
		const checkedPurchaseItemsToServer: BuyProductsApiPropsType<ProductItemApiType> = checkedPurchaseItems.map((checkedPurchaseItem) => ({
			product_id: checkedPurchaseItem.product._id,
			buy_count: checkedPurchaseItem.buy_count,
		}));
		await appDispatch(buyCheckedPurchaseItemsThunkAction(checkedPurchaseItemsToServer))
			.unwrap()
			.then(() => {
				appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
			});
	};

	// Method quản lý chức năng cập nhật quantity trong cart:
	const handleUpdateQuantityPurchaseItem: (purchaseItemIndex: number, buyCountValue: number, enable: boolean) => void = (
		purchaseItemIndex: number,
		buyCountValue: number,
		enable: boolean,
	) => {
		if (enable) {
			const purchaseItem = extendPurchaseList[purchaseItemIndex];
			dispatch(setPurchaseItemDisableStatusAction(purchaseItemIndex));
			appDispatch(
				updatePurchaseListThunkAction({
					product_id: purchaseItem.product._id,
					buy_count: buyCountValue,
				}),
			)
				.unwrap()
				.then(() => {
					appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
				});
		}
	};

	// method handle chức năng nhập tay quantity:
	const handleTypeQuantity: (purchaseItemIndex: number) => (value: number) => void = (purchaseItemIndex: number) => (value: number) => {
		dispatch(setPurchaseItemQuantityOnTypeAction({ purchaseItemIndex, buyCountValue: value }));
	};

	const previousDeletePurchaseItemIdRef = useRef<string | null>(null);

	// Method handle chức năng Delete Product Item trong Cart -> xong
	const handleDeletePurchaseItem: (purchaseItemIndex: number) => () => void = (purchaseItemIndex: number) => async () => {
		const onDeletePurchaseItemId = (
			extendPurchaseList.find((_, extendPurchaseItemIndex: number) => extendPurchaseItemIndex === purchaseItemIndex) as ExtendPurchaseSuccessResponse
		)._id;
		if (onDeletePurchaseItemId === previousDeletePurchaseItemIdRef.current) {
			return;
		}
		previousDeletePurchaseItemIdRef.current = onDeletePurchaseItemId;
		await appDispatch(deletePurchaseItemThunkAction([onDeletePurchaseItemId]))
			.unwrap()
			.then(() => {
				appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
			});
	};

	// Method handle chức năng Delete Product Items trong Cart -> xong
	const handleDeleteCheckedPurchaseItems: () => void = async () => {
		if (checkedPurchaseItems.length < 1) {
			toast.error("Vui lòng tích chọn sản phẩm cần xóa", { position: "top-right", autoClose: 3000 });
		} else {
			const purchaseItemIds = checkedPurchaseItems.map((checkedPurchaseItem) => checkedPurchaseItem._id);
			await appDispatch(deletePurchaseItemThunkAction(purchaseItemIds))
				.unwrap()
				.then(() => {
					appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
				});
		}
	};

	// Method quản lý chức năng tính tổng số tiền các sản phẩm được check trong giỏ hàng
	// Method quản lý chức năng tính tổng 1 thuộc tính của tất cả các đối tượng trong 1 array -> reduce
	const getTotalCheckedPurchaseItemsPrice: () => number = useCallback(() => {
		const totalCheckedPurchaseItemsPrice = checkedPurchaseItems.reduce((result, checkedPurchaseItem) => {
			return result + checkedPurchaseItem.buy_count * checkedPurchaseItem.price;
		}, 0);
		return totalCheckedPurchaseItemsPrice;
	}, [checkedPurchaseItems]);

	// Method quản lý chức năng tính tổng số tiền tiết kiệm các sản phẩm được check trong giỏ hàng
	const getTotalCheckedPurchaseItemsSavingPrice: () => number | null = useCallback(() => {
		const totalCheckedPurchaseItemsPriceBeforeDiscount = checkedPurchaseItems.reduce((result, checkedPurchaseItem) => {
			return (result as number) + (checkedPurchaseItem.buy_count as number) * (checkedPurchaseItem.price_before_discount as number);
		}, 0);
		const totalCheckedPurchaseItemsPrice = getTotalCheckedPurchaseItemsPrice;
		const totalCheckedPurchaseItemsSavingPrice = totalCheckedPurchaseItemsPriceBeforeDiscount - totalCheckedPurchaseItemsPrice();
		if (totalCheckedPurchaseItemsSavingPrice > 0) return totalCheckedPurchaseItemsSavingPrice;
		return null;
	}, [getTotalCheckedPurchaseItemsPrice, checkedPurchaseItems]);

	const { t } = useTranslation("cart");

	return (
		<div className='flex justify-center bg-[rgba(0,0,0,.09] pt-5 pb-10'>
			<Helmet>
				<title>Quản lý giỏ hàng | Shopee clone</title>
				<meta name='description' content='Chức năng quản lý giỏ hàng - Dự án Shopee clone' />
			</Helmet>
			{extendPurchaseList && extendPurchaseList.length < 1 && (
				<div className='flex w-[1200px]'>
					<div className='m-auto flex flex-col justify-center items-center'>
						<img className='w-[108px] h-[98px]' src={emtyCartBackground} alt='emtyCartBackground' />
						<p className='text-sm text-[#00000066] mt-5'>{t("emtyCart.your shopping cart is emty")}</p>
						<Button
							to={productListUrl}
							childrenClassName={"text-base text-white capitalize"}
							className={"rounded-sm px-[42px] py-[10px] bg-[#ee4d2d] mt-5 hover:bg-[#f05d40]"}
						>
							{t("emtyCart.go shopping now")}
						</Button>
					</div>
				</div>
			)}
			{extendPurchaseList && extendPurchaseList.length > 0 && (
				<div className='flex flex-col w-[1200px] xl:w-screen'>
					<TitleArea isCheckFull={isCheckFull} handleCheckFull={handleCheckFull} />
					{extendPurchaseList.map((extendPurchaseItem, extendPurchaseItemIndex) => {
						const purchaseItemBuyCount = purchaseList?.find((_, index) => index === extendPurchaseItemIndex)?.buy_count;
						return (
							// Sử dụng extendPurchaseItemIndex hoặc extendPurchaseItem._id làm key
							<PurchaseItem
								key={extendPurchaseItemIndex} // Hoặc key={extendPurchaseItem._id}
								extendPurchaseItem={extendPurchaseItem}
								extendPurchaseItemIndex={extendPurchaseItemIndex}
								purchaseItemBuyCount={purchaseItemBuyCount}
								handleCheck={handleCheck}
								handleUpdateQuantityPurchaseItem={handleUpdateQuantityPurchaseItem}
								handleTypeQuantity={handleTypeQuantity}
								handleDeletePurchaseItem={handleDeletePurchaseItem}
							/>
						);
					})}
					<SettlementArea
						isCheckFull={isCheckFull}
						extendPurchaseList={extendPurchaseList}
						handleCheckFull={handleCheckFull}
						handleDeletePurchaseItems={handleDeleteCheckedPurchaseItems}
						checkedPurchaseItemsCount={checkedPurchaseItemsCount}
						getTotalCheckedPurchaseItemsPrice={getTotalCheckedPurchaseItemsPrice}
						getTotalCheckedPurchaseItemsSavingPrice={getTotalCheckedPurchaseItemsSavingPrice}
						handleBuyCheckedPurchaseItems={handleBuyCheckedPurchaseItems}
						buyCheckedPurchaseItemsIsLoading={purchaseListLoading}
					/>
				</div>
			)}
		</div>
	);
}
