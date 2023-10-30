import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPurchaseListPathURL } from "src/constants";
import { PurchaseListStatus, PurchaseSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const getPurchaseListThunkAction = createAsyncThunk(
	"purchaseList/getPurchaseList",
	async (getPurchaseListQueryParams: { status: PurchaseListStatus }, { signal }) => {
		const response = await http.get<SuccessResponseApi<PurchaseSuccessResponse[]>>(getPurchaseListPathURL, {
			params: getPurchaseListQueryParams,
			signal,
		});
		return response.data;
	},
);
export default getPurchaseListThunkAction;
