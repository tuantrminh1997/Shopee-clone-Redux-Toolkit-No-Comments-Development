import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPurchaseListPathURL } from "src/constants";
import { PurchaseSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const getPurchaseListInCartThunkAction = createAsyncThunk(
	"purchaseList/getPurchaseListInCart",
	async (getPurchaseListQueryParams: { status: -1 }, { signal }) => {
		const response = await http.get<SuccessResponseApi<PurchaseSuccessResponse[]>>(getPurchaseListPathURL, {
			params: getPurchaseListQueryParams,
			signal,
		});
		return response.data;
	},
);
export default getPurchaseListInCartThunkAction;
