import { ExtendPurchaseSuccessResponse, PurchaseSuccessResponse } from "src/types";

interface PurchaseSliceInitialStateType {
	purchaseListInCart: PurchaseSuccessResponse[];
	purchaseList: PurchaseSuccessResponse[];
	extendPurchaseList: ExtendPurchaseSuccessResponse[];
	purchaseListLoading: boolean;
	currentRequestId: undefined | string;
}
export default PurchaseSliceInitialStateType;
