import { createAsyncThunk } from "@reduxjs/toolkit";
import { productsBasePathURL } from "src/constants";
import { ProductListQueryParamsType, ProductListSuccessResponse, SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get Post List
const getSimilarSoldByProductListThunkAction = createAsyncThunk(
	"productItemDetail/getSimilarSoldByProductList",
	async (getProductListQueryParams: ProductListQueryParamsType, { signal }) => {
		const response = await http.get<SuccessResponseApi<ProductListSuccessResponse>>(productsBasePathURL, {
			params: getProductListQueryParams,
			signal,
		});
		// return về giá trị gì
		// -> callback này trở thành Promise.resolve(giá trị đó)
		// -> được bắt ở fulFilled của slice
		return response.data;
	},
);
export default getSimilarSoldByProductListThunkAction;