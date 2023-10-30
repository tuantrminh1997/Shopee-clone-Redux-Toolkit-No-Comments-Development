import { createAsyncThunk } from "@reduxjs/toolkit";
import { addToCartPathURL } from "src/constants";
import { ProductItemApiType, PurchaseSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const addProductItemToCartThunkAction = createAsyncThunk(
	"purchaseList/addProductItemToCart",
	async (addProductItemToCartBody: ProductItemApiType, thunkAPI) => {
		const response = await http.post<SuccessResponseApi<PurchaseSuccessResponse>>(addToCartPathURL, addProductItemToCartBody, {
			signal: thunkAPI.signal,
		});
		return response.data;
	},
);
export default addProductItemToCartThunkAction;
