import { createAsyncThunk } from "@reduxjs/toolkit";
import { productsBasePathURL } from "src/constants";
import { ProductListQueryParamsType, ProductListSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const getSimilarProductListThunkAction = createAsyncThunk(
	"productItemDetail/getSimilarProductList",
	async (getProductListQueryParams: ProductListQueryParamsType, thunkAPI) => {
		const response = await http.get<SuccessResponseApi<ProductListSuccessResponse>>(productsBasePathURL, {
			params: getProductListQueryParams,
			signal: thunkAPI.signal,
		});
		return response.data;
	},
);
export default getSimilarProductListThunkAction;
