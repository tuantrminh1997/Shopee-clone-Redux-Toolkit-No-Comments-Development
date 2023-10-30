import { createAsyncThunk } from "@reduxjs/toolkit";
import { categoriesBasePathURL } from "src/constants";
import { Category, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get Post List
const getCategoriesThunkAction = createAsyncThunk("productList/getCategories", async (_, { signal }) => {
	const response = await http.get<SuccessResponseApi<Category[]>>(categoriesBasePathURL, {
		signal,
	});
	// return về giá trị gì
	// -> callback này trở thành Promise.resolve(giá trị đó)
	// -> được bắt ở fulFilled của slice
	return response.data;
});
export default getCategoriesThunkAction;
