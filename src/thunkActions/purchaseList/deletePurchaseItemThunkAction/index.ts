import { createAsyncThunk } from "@reduxjs/toolkit";
import { cartBasePathURL } from "src/constants";
import { SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get Post List
const deletePurchaseItemThunkAction = createAsyncThunk("purchaseList/deletePurchaseItem", async (purchaseId: string[]) => {
	const response = await http.delete<SuccessResponseApi<{ deleted_count: number }>>(cartBasePathURL, { data: purchaseId });
	// return về giá trị gì
	// -> callback này trở thành Promise.resolve(giá trị đó)
	// -> được bắt ở fulFilled của slice
	return response.data;
});
export default deletePurchaseItemThunkAction;
