import { createAsyncThunk } from "@reduxjs/toolkit";
import { productsBasePathURL } from "src/constants";
import { ProductListQueryParamsType, ProductListSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const getSimilarSoldByProductListThunkAction = createAsyncThunk(
	"productItemDetail/getSimilarSoldByProductList",
	async (getProductListQueryParams: ProductListQueryParamsType, { signal }) => {
		const response = await http.get<SuccessResponseApi<ProductListSuccessResponse>>(productsBasePathURL, {
			params: getProductListQueryParams,
			signal,
		});
		return response.data;
	},
);
export default getSimilarSoldByProductListThunkAction;
