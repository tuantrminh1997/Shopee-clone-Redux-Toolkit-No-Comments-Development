import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPurchaseListPathURL } from "src/constants";
import { PurchaseSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get Post List
const getPurchaseListInCartThunkAction = createAsyncThunk(
	"purchaseList/getPurchaseListInCart",
	async (getPurchaseListQueryParams: { status: -1 }, { signal }) => {
		const response = await http.get<SuccessResponseApi<PurchaseSuccessResponse[]>>(getPurchaseListPathURL, {
			params: getPurchaseListQueryParams,
			signal,
		});
		// return về giá trị gì
		// -> callback này trở thành Promise.resolve(giá trị đó)
		// -> được bắt ở fulFilled của slice
		return response.data;
	},
);
export default getPurchaseListInCartThunkAction;
