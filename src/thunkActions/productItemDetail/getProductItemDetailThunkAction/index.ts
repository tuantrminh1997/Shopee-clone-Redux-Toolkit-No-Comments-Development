import { createAsyncThunk } from "@reduxjs/toolkit";
import { productsBasePathURL } from "src/constants";
import { ProductItemSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get Post List
const getProductItemDetailThunkAction = createAsyncThunk("productItemDetail/getProductItemDetail", async (productItemId: string, { signal }) => {
	const response = await http.get<SuccessResponseApi<ProductItemSuccessResponse>>(`${productsBasePathURL}/${productItemId}`, {
		signal,
	});
	// return về giá trị gì
	// -> callback này trở thành Promise.resolve(giá trị đó)
	// -> được bắt ở fulFilled của slice
	return response.data;
});
export default getProductItemDetailThunkAction;
