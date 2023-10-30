import { createAsyncThunk } from "@reduxjs/toolkit";
import { categoriesBasePathURL } from "src/constants";
import { Category, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const getCategoriesThunkAction = createAsyncThunk("productList/getCategories", async (_, { signal }) => {
	const response = await http.get<SuccessResponseApi<Category[]>>(categoriesBasePathURL, {
		signal,
	});
	return response.data;
});
export default getCategoriesThunkAction;
