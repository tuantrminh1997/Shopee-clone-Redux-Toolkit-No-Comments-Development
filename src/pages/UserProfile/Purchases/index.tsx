/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
// assets
import purchaseListEmtyImgage from "src/assets/purchase-list-empty-background.png";
// react router dom
import { createSearchParams } from "react-router-dom";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// i18n
import { useTranslation } from "react-i18next";
// react redux
import { useSelector } from "react-redux";
// react hooks:
import { useEffect, useMemo } from "react";
// constants
import { purchaseStatus, paths } from "src/constants";
// thunk actions
import { getPurchaseListThunkAction } from "src/thunkActions";
// hooks:
import { useAppDispatch, useQueryParams } from "src/hooks";
// types:
import { ExtendPurchaseSuccessResponse, RootState } from "src/types";
// common components:
import { Button, PurchaseItem } from "src/components";

export default function Purchases() {
	// React Context -> App Context
	// isLoggedIn = Context API quản lý trạng thái đăng nhập: có accessToken lưu trong LocalStorage hay không ?
	// userProfile được lấy từ Local Storage (lưu vào Local Storage nhờ Interceptor - Axios)
	const isLoggedIn = useSelector((state: RootState) => state.authentication.isLoggedIn);
	// constants:
	const { allPurschases } = purchaseStatus;
	const { purchases } = paths;

	// object queryParams: chứa loạt tham số query params và giá trị của nó lấy được từ url (truyền lên bằng thẻ Link và prop to, hoặc sử dụng navigate = useNavigate())
	const queryParams = useQueryParams();
	const purchaseListStatus = useMemo(() => {
		if ((queryParams as any).status) return (queryParams as any).status;
		return allPurschases;
	}, [(queryParams as any).status]);

	// Query quản lý tác vụ callAPI get purchase List -> nhận dữ liệu Các sản phẩm đang có trong cart -> truyền vào Component Cart -> đổ ra UI
	// -> Query không bị gọi lại khi chuyển Page có cùng layout là MainLayout, do MainLayout khi đó chỉ bị re-render
	// -> query này không bị inactive (query bị inactive khi component chứa nó bị unmunted hàon toàn -> khi đó query bắt đầu bị tính thời gian kể từ khi bị xoá)
	// -> không cần thiết phải set staleTime là infinity (vô hạn)
	// Chú ý: Khi component chứa query bị unmounted, thì React Query sẽ ngừng tính thời gian "stale" cho query đó. Nghĩa là nếu bạn mounted lại component và query đó được gọi lại, thời
	// gian "stale" sẽ tính lại từ đầu, không tính tiếp từ thời điểm trước đó khi component bị unmounted.
	// const { data: purchaseListQueryData } = useQuery({
	// 	queryKey: ["purchaseList", { purchaseListStatus }],
	// 	// Chú ý: sẽ phát sinh vấn đề khi thêm 1 sản phẩm vào giỏ hàng -> dữ liệu thêm mới trong giỏ hàng chưa được cập nhật và đổ ra UI
	// 	// -> nguyên nhân: do khi kích hoạt sự kiện onClick -> thêm vào giỏ hàng -> call API -> cập nhật mới dữ liệu giỏ hàng trên Server và success
	// 	queryFn: () => getPurchaseListApi({ status: purchaseListStatus as PurchaseListStatus }),
	// 	keepPreviousData: true,
	// 	// Sau khi logout và reload lại page -> component header được mounted lại và gọi API getPurchaseListApi, tuy nhiên do đã logout và không còn token trong localStorage
	// 	// -> cuộc gọi API bị lỗi
	// 	// -> fix các vấn đề:
	// 	// 1. sau khi đã logout thì không còn sản phẩm nào trong giỏ hàng.
	// 	// 2. đồng thời không call API getPurchaseListApi -> handle bằng cách sử dụng context isLoggedIn -> enabled khi isLoggedIn = truthy
	// 	enabled: isLoggedIn,
	// });
	const appDispatch = useAppDispatch();
	useEffect(() => {
		if (isLoggedIn) {
			const getPurchaseListPromise = appDispatch(getPurchaseListThunkAction({ status: purchaseListStatus }));
			return () => getPurchaseListPromise.abort();
		}
	}, [purchaseListStatus, isLoggedIn]);
	const purchaseListFromReducer = useSelector((state: RootState) => state.purchaseList.purchaseList);

	// biến đại diện cho toàn bộ Purchase List (get from server)
	const purchaseList = useMemo(() => {
		if (purchaseListFromReducer) {
			return purchaseListFromReducer;
		}
	}, [purchaseListFromReducer]);

	// Biến quản lý trạng thái số lượng trong Purchase List:
	const hasPurchaseItems: boolean | undefined = useMemo(
		() => purchaseList && purchaseList.length > 0,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[purchaseList?.length as number],
	);

	const { t } = useTranslation("user");

	const purchaseTabs = [
		{ status: purchaseStatus.allPurschases, title: t("purchaseTopTitle.all") },
		{ status: purchaseStatus.waitingForShop, title: t("purchaseTopTitle.to pay") },
		{ status: purchaseStatus.gettingFromShop, title: t("purchaseTopTitle.to ship") },
		{ status: purchaseStatus.purchaseDelivering, title: t("purchaseTopTitle.to receive") },
		{ status: purchaseStatus.purchaseDelivered, title: t("purchaseTopTitle.completed") },
		{ status: purchaseStatus.purchaseCanceled, title: t("purchaseTopTitle.cancelled") },
	] as const;

	return (
		<div className='flex flex-col justify-between max-w-[993px] rounded-sm h-full'>
			<Helmet>
				<title>Danh sách đơn mua | Shopee clone</title>
				<meta name='description' content='Chức năng theo dõi danh sách đơn mua - Dự án Shopee clone' />
			</Helmet>
			<div className='flex bg-white mb-6 myProfileBoxShadow'>
				{purchaseTabs.map((purchaseTab) => {
					const { status, title } = purchaseTab;
					const isActive = purchaseListStatus == String(status);
					return (
						<Button
							key={status}
							// purchases = /user/purchases
							// create Search Params -> nối thêm params status=[status quy định trạng thái các đơn hàng (được server nhận diện và xử lý)]
							// -> sử dụng hook useQueryConfig lấy các giá trị params trên url và gói vào object queryConfig -> gọi lên API và get List
							to={{
								pathname: purchases,
								search: createSearchParams({ status: String(status) }).toString(),
							}}
							className={`cursor-pointer py-4 basis-[calc(100%/6)] text-center border-b-2 hover:text-[#ee4d2d] ${
								isActive ? "border-[#ee4d2d] text-[#ee4d2d]" : "border-[#rgba(0,0,0,.09)]"
							} capitalize`}
						>
							{title}
						</Button>
					);
				})}
			</div>
			<div className={`flex rounded-sm bg-white purchaseListContentBoxShadow w-full py-0 ${!hasPurchaseItems ? "min-w-[993px] min-h-[740px]" : ""}`}>
				{(!hasPurchaseItems as boolean) && (
					<div className='flex flex-col items-center m-auto'>
						<img src={purchaseListEmtyImgage} alt='purchaseListEmtyImgage' className='w-[100px] h-[100px]' />
						<p className='text-lg text-[#000000cc] mt-5'>{t("content.no orders yet")}</p>
					</div>
				)}
				{(hasPurchaseItems as boolean) && (
					<div className='flex flex-col w-[1200px] xl:w-screen'>
						{purchaseList?.map((purchaseItem, purchaseItemIndex) => {
							const purchaseItemBuyCount = purchaseList?.find((_, index) => index === purchaseItemIndex)?.buy_count;
							return (
								// Sử dụng extendPurchaseItemIndex hoặc extendPurchaseItem._id làm key
								<PurchaseItem
									key={purchaseItemIndex} // Hoặc key={extendPurchaseItem._id}
									// purchaseItem={purchaseItem}
									extendPurchaseItem={purchaseItem as ExtendPurchaseSuccessResponse}
									extendPurchaseItemIndex={purchaseItemIndex}
									// sử dụng purchaseItemBuyCount  === purchaseItem.buy_count để so sánh với giá trị quantity nhập tay và xuất ra từ
									purchaseItemBuyCount={purchaseItemBuyCount as number}
								/>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
