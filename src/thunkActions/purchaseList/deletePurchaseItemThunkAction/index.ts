import { createAsyncThunk } from "@reduxjs/toolkit";
import { cartBasePathURL } from "src/constants";
import { SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const deletePurchaseItemThunkAction = createAsyncThunk("purchaseList/deletePurchaseItem", async (purchaseId: string[]) => {
	const response = await http.delete<SuccessResponseApi<{ deleted_count: number }>>(cartBasePathURL, { data: purchaseId });
	return response.data;
});
export default deletePurchaseItemThunkAction;
