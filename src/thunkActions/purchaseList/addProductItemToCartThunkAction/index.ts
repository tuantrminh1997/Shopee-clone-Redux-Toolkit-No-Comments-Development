import { createAsyncThunk } from "@reduxjs/toolkit";
import { addToCartPathURL } from "src/constants";
import { ProductItemApiType, PurchaseSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API add Product Item to Cart
const addProductItemToCartThunkAction = createAsyncThunk(
	"purchaseList/addProductItemToCart",
	async (addProductItemToCartBody: ProductItemApiType, thunkAPI) => {
		const response = await http.post<SuccessResponseApi<PurchaseSuccessResponse>>(addToCartPathURL, addProductItemToCartBody, {
			signal: thunkAPI.signal,
		});
		// return về giá trị gì
		// -> callback này trở thành Promise.resolve(giá trị đó)
		// -> được bắt ở fulFilled của slice
		return response.data;
	},
);
export default addProductItemToCartThunkAction;
