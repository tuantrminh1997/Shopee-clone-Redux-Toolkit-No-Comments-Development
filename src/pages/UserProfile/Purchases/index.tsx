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
								<PurchaseItem
									key={purchaseItemIndex} // Hoặc key={extendPurchaseItem._id}
									extendPurchaseItem={purchaseItem as ExtendPurchaseSuccessResponse}
									extendPurchaseItemIndex={purchaseItemIndex}
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
