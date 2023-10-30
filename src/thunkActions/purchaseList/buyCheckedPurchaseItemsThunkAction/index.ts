import { createAsyncThunk } from "@reduxjs/toolkit";
import { buyProductsPathURL } from "src/constants";
import { BuyProductsApiPropsType, ProductItemApiType, PurchaseSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get Post List
const buyCheckedPurchaseItemsThunkAction = createAsyncThunk(
	"purchaseList/buyCheckedPurchaseItems",
	async (buyCheckedPurchaseItemsBody: BuyProductsApiPropsType<ProductItemApiType>) => {
		const response = await http.post<SuccessResponseApi<PurchaseSuccessResponse[]>>(buyProductsPathURL, buyCheckedPurchaseItemsBody);
		// return về giá trị gì
		// -> callback này trở thành Promise.resolve(giá trị đó)
		// -> được bắt ở fulFilled của slice
		return response.data;
	},
);
export default buyCheckedPurchaseItemsThunkAction;
