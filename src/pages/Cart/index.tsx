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
// lodash: chỉ định rõ function keyBy từ lodash để import mỗi function đó, do lodash ko có cơ chế lọc import -> import toàn bộ thư viện lodash vào component khiến cho dung lượng file
// khi build ra bị nặng lên 1 cách không cần thiết.
import keyBy from "lodash/keyBy";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
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
	// Phân tích chức năng:
	// 1. Shopee gốc lưu state quản lý trạng thái check vào Global State thay vì lưu trong nội bộ Component Cart
	// -> Khi đó chuyển Route sẽ không bị mất trạng thái check, nhưng khi Reload lại trạng thì sẽ mất
	// -> dự án ta sử dụng Context API để quản lý Global State cho Local
	// -> Tiến hành lưu extendPurchaseList (PurchaseProductItem sau khi thêm 2 thuộc tính isCheck và disabled) vào Context API
	// thay vì lưu trong Component Cart

	// Handle 2 vấn đề trên UI gốc của Shopee:
	// 1. tích chọn -> sử dụng immerJS
	// 2. khi tăng/giảm quantity của QuantityController -> call API -> Disable nút thay đổi quantity.
	// -> ta quản lý qua 1 state local, state đó có giá trị bằng khối dữ liệu purchaseListQueryData (-> lấy ra purchaseList) nhưng ghi đè thêm 2 thuộc tính isCheckFull, disabled
	// -> local state là 1 array PurchaseSuccessResponse
	// const [extendPurchaseList, setExtendPurchaseList] = useState<ExtendPurchaseSuccessResponse[]>([]);

	// -> Chuyển lên Context API thay vì quản lý trong nội bộ Component -> lấy về từ Context API để sử dụng.
	// purchase List hiện tại lấy từ Redux
	const extendPurchaseList: ExtendPurchaseSuccessResponse[] = useSelector((state: RootState) => state.purchaseList.extendPurchaseList);
	const isLoggedIn: boolean = useSelector((state: RootState) => state.authentication.isLoggedIn);
	// tối ưu Component Cart bằng useMemo (biến), useCallback (function) -> ngăn chặn việc gọi lại liên tục các function
	// -> áp dụng với các function có vòng lặp: every, filter, find,..v..v...

	// mặc định là 1 array rỗng, sau khi component được mounted -> get purchaseListQueryData -> get purchaseList
	// -> set lại giá trị cho state bằng cách ghi đè thêm 2 thuộc tính trên: 2 thuộc tính isCheck, disabled
	// -> useEffect

	// constants:
	const { inCart } = purchaseStatus;
	const { productList: productListUrl } = paths;
	const dispatch = useDispatch();
	const appDispatch = useAppDispatch();

	// Query fetching API và get purchase list trong giỏ hàng
	useEffect(() => {
		if (isLoggedIn) {
			// get Purchase List
			const getPurchaseListPromise = appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
			return () => getPurchaseListPromise.abort();
		}
	}, [isLoggedIn]);
	const purchaseListFromReducer = useSelector((state: RootState) => state.purchaseList.purchaseListInCart);
	// Khai báo các biến sử dụng trong component Cart
	// biến đại diện cho toàn bộ Purchase List (get from server)
	const purchaseList = useMemo(() => purchaseListFromReducer, [purchaseListFromReducer]);

	// biến đại diện cho toàn bộ Purchase Item đang được check (tối ưu = useMemo do đây là biến)
	const checkedPurchaseItems = useMemo(() => extendPurchaseList.filter((purchaseItem) => purchaseItem.isCheck), [extendPurchaseList]);
	// biến đại diện cho trạng thái check tất cả product item -> đặt gần method handleCheckFull
	// biến đại diện cho số lượng các product items đã được check
	const checkedPurchaseItemsCount = useMemo(() => checkedPurchaseItems.length, [checkedPurchaseItems]);

	// Nhận state từ Route ProductItemDetail, _id của PurchaseItemDetail.
	const location = useLocation();

	// Nhấn Buy Now -> lập tức bắn khối id của Product Item Detail sang Component Cart
	// -> handle chức năng Buy Now
	const purchaseProductItemId = useMemo(() => location.state?.purchaseProductItemId, [location]);

	// bài toán purchase list trong component cart
	useEffect(() => {
		if (purchaseList) {
			const extendPurchaseObject = keyBy(extendPurchaseList, "_id");
			const newPurchaseList =
				purchaseList.map((purchaseItem) => {
					// Handle chức năng Buy Now
					const isBuyNowProductItemDetail = (purchaseProductItemId as string | null) === (purchaseItem._id as string);
					return {
						...purchaseItem,
						// handle vấn đề khi tăng/ giảm quantity Controller -> giữ nguyên giá trị thuộc tính isCheck
						// 1. -> Nếu _id của PurchaseItem trùng với id của PurchaseItem (ProductItem sau khi ấn mua ngay) -> tích chọn.
						// 2. -> Lấy giá trị hiện tại của thuộc tính isCheck
						isCheck: isBuyNowProductItemDetail || Boolean(extendPurchaseObject[purchaseItem._id]?.isCheck) || false,
						disabled: false,
					};
					// lúc đầu khi component được mounted purchaseList = undefined
					// -> callback của useEffect chạy -> setExtendPurchaseList([])
					// -> sau khi purchaseList nhận dữ liệu -> callback của useEffect lại được chạy
					// -> setExtendPurchaseList(dữ liệu mới)
				}) || [];
			dispatch(updateExtendPurchaseListAction(newPurchaseList));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [purchaseList, purchaseProductItemId, dispatch]);

	// khi unmounted component Cart
	// -> xóa state id truyền sang từ Component ProductItemDetail (chức năng mua ngay)
	useEffect(() => {
		return () => {
			history.replaceState(null, "");
		};
	}, []);

	// Sau khi reload lại page Cart -> clear đi state truyền từ Product Item Detail sang
	// -> clean up function

	// Handle bài toán 2 way binding -> khi check mà chưa check thì check, khi check mà đã check thì bỏ check của input type = checkbox
	// -> sử dụng thư viện immerJS (Thư viện đoạt giải Breakout of the year) -> yarn add immer -> import { produce } from "immer"
	// mutate trong react = thư viện immer
	// const handleCheck = 1 function nhận vào (purchaseItemIndex: number) và return về 1 arrow function
	// (arrow function nhận vào (event: React.ChangeEvent<HTMLInputElement>)) và return về
	const handleCheck: (purchaseItemIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => void =
		(purchaseItemIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
			// nếu thiếu setExtendPurchaseList -> gây ra lỗi nghiêm trọng
			// chú ý sử dụng produce
			// dispatch(updateExtendPurchaseListAction(purchaseItemIndex));
			// setExtendPurchaseList(
			// 	produce((extendPurchaseList) => {
			// 		// tham số của callback của produce - đại diện cho Array (cụ thể ở đây là Array extendPurchaseList)
			// 		// chỉ định ra 1 đối tượng cụ thể trong Array extendPurchaseList thông qua chỉ mục truyền lên (purchaseItemIndex) để update
			// 		// -> update thuộc tính isCheck === event.target.checked (khi input checkbox được check -> event.target.checked === true và ngược lại)
			// 		const onFocusExtendPurchaseItem = extendPurchaseList.find((_, index) => index === purchaseItemIndex);
			// 		// sử dụng type dicate trong trường hợp này phức tạp hơn
			// 		(onFocusExtendPurchaseItem as ExtendPurchaseSuccessResponse).isCheck = event.target.checked;
			// 	}),
			// );
			const purchaseItemCheckStatus: boolean = event.target.checked;
			dispatch(setPurchaseItemCheckStatusAction({ purchaseItemIndex, purchaseItemCheckStatus }));
		};

	// Handle chức năng chọn tất cả:
	// flow: tích chọn tất cả -> chọn hết
	// -> tích chọn tất cả tiếp -> bỏ chọn hết.
	// -> tạo 1 biến isCheckFull, trả về true khi tất cả các item trong extendPurchaseList có thuộc tính isCheck === true.
	// 1. tích thủ công tất cả item bằng tay -> isCheckFull === true -> nút chọn tất cả được check
	// Tối ưu Performance bằng useMemo (biến), useCallback (function)
	const isCheckFull: boolean = useMemo(() => extendPurchaseList.every((extendPurchaseItem) => extendPurchaseItem.isCheck), [extendPurchaseList]);

	// Method quản lý chức năng bật chọn tất cả -> bật thuộc tính isCheck của tất cả các đối tượng.
	const handleCheckFull: () => void = () => {
		const checkFullExtendPurchaseListItems = extendPurchaseList.map((extendPurchaseItem) => {
			const checkedPurchaseItem = { ...extendPurchaseItem, isCheck: !isCheckFull };
			return checkedPurchaseItem;
		});
		dispatch(setAllPurchaseItemCheckStatusAction(checkFullExtendPurchaseListItems));
	};

	// Mutation handle chức năng cập nhật Quantity Product Item trong Cart
	// Mutation handle chức năng Buy Product trong Cart
	// const { mutate: buyCheckedPurchaseItemsMutation, isLoading: buyCheckedPurchaseItemsIsLoading } = useMutation({
	// 	mutationFn: (body: BuyProductsApiPropsType<ProductItemApiType>) => buyCheckedPurchaseItemsApi(body),
	// 	onSuccess: (buyProductListMutationSuccessData) => {
	// 		purchaseListQueryRefetch();
	// 		// -> refetch API của query purchaseList xong -> data của query: purchaseListQueryData thay đổi -> dependency của useEffect purchaseList
	// 		// thay đổi -> callback của useEffect bị gọi lại -> isCheck === false
	// 		// -> khi refetch lại API của query purchaseList, khi purchase Item đang checked/unchecked -> giữ nguyên trạng thái checked/unchecked
	// 		// -> giữ nguyên trạng thái nguyên trạng của thuộc tính isCheck
	// 		const buyProductListMutationSuccessDataMessage = buyProductListMutationSuccessData.data.message;
	// 		toast.success(buyProductListMutationSuccessDataMessage, {
	// 			position: "top-center",
	// 			autoClose: 2000,
	// 		});
	// 	},
	// });

	// trạng thái loading của purchase list
	const purchaseListLoading = useSelector((state: RootState) => state.purchaseList.purchaseListLoading);

	// Method handle chức năng tiến hành mua/thanh toán các Purchase Item đã được check
	const handleBuyCheckedPurchaseItems: () => void = async () => {
		if (checkedPurchaseItemsCount < 1) {
			toast.error("Vui lòng tích chọn các sản phẩm bạn muốn thành toán", {
				position: "top-right",
				autoClose: 2000,
			});
			return;
		}
		const checkedPurchaseItemsToServer: BuyProductsApiPropsType<ProductItemApiType> = checkedPurchaseItems.map((checkedPurchaseItem) => ({
			// product_id: checkedPurchaseItem._id -> lỗi -> đọc lại hệ thống để tìm hiểu nguyên nhân
			product_id: checkedPurchaseItem.product._id,
			buy_count: checkedPurchaseItem.buy_count,
		}));
		// const response = await buyCheckedPurchaseItemsMutation(checkedPurchaseItemsToServer);
		await appDispatch(buyCheckedPurchaseItemsThunkAction(checkedPurchaseItemsToServer))
			.unwrap()
			.then(() => {
				// Khi thanh toán thành công -> chạy lại API get Purchase List
				appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
			});
	};

	// Mutation handle chức năng Delete Product Item trong Cart

	// Method quản lý chức năng cập nhật quantity trong cart:
	// - tham số enable: cho phép tiếp tục tăng/giảm quantity
	const handleUpdateQuantityPurchaseItem: (purchaseItemIndex: number, buyCountValue: number, enable: boolean) => void = (
		purchaseItemIndex: number,
		buyCountValue: number,
		enable: boolean,
	) => {
		if (enable) {
			// lấy ra purchaseItem đang được update Quantity:
			const purchaseItem = extendPurchaseList[purchaseItemIndex];
			// Ghi đè thuộc tính disabled === true -> ta sẽ căn cứ vào thuộc tính này để handle việc bật/tắt trạng thái disabled của quantityController
			dispatch(setPurchaseItemDisableStatusAction(purchaseItemIndex));
			// Tiến hành mutate -> truyền product_id + buy_count lên api updateCartPurchaseApi
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
		// -> tái sử dụng lại function handleUpdateQuantityPurchaseItem để handle chức năng -> khi out focus -> call API và update quantity
	};

	// method handle chức năng nhập tay quantity:
	// cú pháp currying: do bên dưới ta gọi vào 1 function nên ở đây cần dùng cú pháp currying
	// biến value? :mục đích để truyền vào component QuantityController, truyền giá trị của biến value từ trong component QuantityController
	// ra ngoài, gán vào thuộc tính buy_count của extendPurchaseItem
	const handleTypeQuantity: (purchaseItemIndex: number) => (value: number) => void = (purchaseItemIndex: number) => (value: number) => {
		dispatch(setPurchaseItemQuantityOnTypeAction({ purchaseItemIndex, buyCountValue: value }));
	};

	// Khởi tạo một biến để lưu trữ onDeletePurchaseItemId trước đó -> handle việc: ngăn chặn dupplicate call API delete purchase list khi user cố tình spam button delete
	// purchase item
	const previousDeletePurchaseItemIdRef = useRef<string | null>(null);

	// Method handle chức năng Delete Product Item trong Cart -> xong
	const handleDeletePurchaseItem: (purchaseItemIndex: number) => () => void = (purchaseItemIndex: number) => async () => {
		const onDeletePurchaseItemId = (
			extendPurchaseList.find((_, extendPurchaseItemIndex: number) => extendPurchaseItemIndex === purchaseItemIndex) as ExtendPurchaseSuccessResponse
		)._id;

		// nếu onDeletePurchaseItemId trùng với giá trị trước đó -> return hàm và không thực hiện tiếp tác vụ call API
		if (onDeletePurchaseItemId === previousDeletePurchaseItemIdRef.current) {
			return;
		}

		// lưu giá trị onDeletePurchaseItemId của lần này vào biến previousDeletePurchaseItemIdRef.current để sử dụng cho lần so sánh sau đó
		previousDeletePurchaseItemIdRef.current = onDeletePurchaseItemId;

		// call API delete purchase Item
		await appDispatch(deletePurchaseItemThunkAction([onDeletePurchaseItemId]))
			.unwrap()
			.then(() => {
				// Khi thành công -> tự động call API get Purchase List
				appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
			});
	};

	// Method handle chức năng Delete Product Items trong Cart -> xong
	const handleDeleteCheckedPurchaseItems: () => void = async () => {
		if (checkedPurchaseItems.length < 1) {
			toast.error("Vui lòng tích chọn sản phẩm cần xóa", { position: "top-right", autoClose: 3000 });
		} else {
			const purchaseItemIds = checkedPurchaseItems.map((checkedPurchaseItem) => checkedPurchaseItem._id);
			// const response = await deletePurchaseItemMutation(purchaseItemIds);
			await appDispatch(deletePurchaseItemThunkAction(purchaseItemIds))
				.unwrap()
				.then(() => {
					// Khi thành công -> tự động call API get Purchase List
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
	// Method quản lý chức năng tính tổng 1 thuộc tính của tất cả các đối tượng trong 1 array -> reduce
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
			{/* Background giỏ hàng trống rỗng */}
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
					{/* - 1 khối sản phẩm -> trong tương lai map dữ liệu vào. */}
					{/* purchaseList = list vừa get về từ API, chưa bị set thành extendPurchaseList (sử dụng thuộc tính buy_count trong này
              để so sánh với giá trị value xuất ra từ quantity khi nhập tay) */}
					{extendPurchaseList.map((extendPurchaseItem, extendPurchaseItemIndex) => {
						const purchaseItemBuyCount = purchaseList?.find((_, index) => index === extendPurchaseItemIndex)?.buy_count;
						return (
							// Sử dụng extendPurchaseItemIndex hoặc extendPurchaseItem._id làm key
							<PurchaseItem
								key={extendPurchaseItemIndex} // Hoặc key={extendPurchaseItem._id}
								extendPurchaseItem={extendPurchaseItem}
								extendPurchaseItemIndex={extendPurchaseItemIndex}
								// sử dụng purchaseItemBuyCount  === purchaseItem.buy_count để so sánh với giá trị quantity nhập tay và xuất ra từ
								purchaseItemBuyCount={purchaseItemBuyCount}
								handleCheck={handleCheck}
								handleUpdateQuantityPurchaseItem={handleUpdateQuantityPurchaseItem}
								handleTypeQuantity={handleTypeQuantity}
								handleDeletePurchaseItem={handleDeletePurchaseItem}
							/>
						);
					})}
					{/* Vùng tổng số tiền thanh toán */}
					<SettlementArea
						isCheckFull={isCheckFull}
						extendPurchaseList={extendPurchaseList}
						handleCheckFull={handleCheckFull}
						handleDeletePurchaseItems={handleDeleteCheckedPurchaseItems}
						checkedPurchaseItemsCount={checkedPurchaseItemsCount}
						// Tổng giá tiền của các sản phẩm đang được check trong giỏ hàng:
						getTotalCheckedPurchaseItemsPrice={getTotalCheckedPurchaseItemsPrice}
						getTotalCheckedPurchaseItemsSavingPrice={getTotalCheckedPurchaseItemsSavingPrice}
						// Method quản lý chức năng mua các purchase Items đã checked
						handleBuyCheckedPurchaseItems={handleBuyCheckedPurchaseItems}
						buyCheckedPurchaseItemsIsLoading={purchaseListLoading}
					/>
				</div>
			)}
		</div>
	);
}
