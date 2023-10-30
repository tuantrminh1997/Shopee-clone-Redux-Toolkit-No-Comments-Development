import { createAsyncThunk } from "@reduxjs/toolkit";
import { updatePurchasePathURL } from "src/constants";
import { ProductItemApiType, PurchaseSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get Post List
const updatePurchaseListThunkAction = createAsyncThunk("purchaseList/updatePurchaseList", async (updatePurchaseListBody: ProductItemApiType) => {
	const response = await http.put<SuccessResponseApi<PurchaseSuccessResponse>>(updatePurchasePathURL, updatePurchaseListBody);
	// return về giá trị gì
	// -> callback này trở thành Promise.resolve(giá trị đó)
	// -> được bắt ở fulFilled của slice
	return response.data;
});
export default updatePurchaseListThunkAction;
