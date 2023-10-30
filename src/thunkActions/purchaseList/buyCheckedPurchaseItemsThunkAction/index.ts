import { createAsyncThunk } from "@reduxjs/toolkit";
import { buyProductsPathURL } from "src/constants";
import { BuyProductsApiPropsType, ProductItemApiType, PurchaseSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const buyCheckedPurchaseItemsThunkAction = createAsyncThunk(
	"purchaseList/buyCheckedPurchaseItems",
	async (buyCheckedPurchaseItemsBody: BuyProductsApiPropsType<ProductItemApiType>) => {
		const response = await http.post<SuccessResponseApi<PurchaseSuccessResponse[]>>(buyProductsPathURL, buyCheckedPurchaseItemsBody);
		return response.data;
	},
);
export default buyCheckedPurchaseItemsThunkAction;
