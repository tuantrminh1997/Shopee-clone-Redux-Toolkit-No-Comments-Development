import { createAsyncThunk } from "@reduxjs/toolkit";
import { updatePurchasePathURL } from "src/constants";
import { ProductItemApiType, PurchaseSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const updatePurchaseListThunkAction = createAsyncThunk("purchaseList/updatePurchaseList", async (updatePurchaseListBody: ProductItemApiType) => {
	const response = await http.put<SuccessResponseApi<PurchaseSuccessResponse>>(updatePurchasePathURL, updatePurchaseListBody);
	return response.data;
});
export default updatePurchaseListThunkAction;
