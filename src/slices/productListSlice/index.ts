/* eslint-disable @typescript-eslint/no-explicit-any */
// redux toolkit
import { AsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ProductListInitialStateType } from "src/types";
// thunk actions
import { getCategoriesThunkAction, getProductListThunkAction } from "src/thunkActions";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;

const initialState: ProductListInitialStateType = {
	productList: [],
	pagination: { page: 1, limit: 20, page_size: 3 },
	categories: [],
	isLoading: false,
	// state currentRequestId được gán bằng requestId (sinh ra bởi createAsyncThunk)
	currentRequestId: undefined,
};

const productListSlice = createSlice({
	name: "productList",
	initialState,
	reducers: {},
	extraReducers(builder) {
		builder
			// 1. Thunk action quản lý tác vụ call API -> get product list
			.addCase(getProductListThunkAction.fulfilled, (state, action) => {
				const productList = action.payload.data.products;
				const pagination = action.payload.data.pagination;
				state.productList = productList;
				state.pagination = pagination;
			})
			// 2. thunk action quản lý tác vụ call API -> get categories
			.addCase(getCategoriesThunkAction.fulfilled, (state, action) => {
				const categories = action.payload.data;
				state.categories = categories;
			})
			.addMatcher<PendingAction>(
				(action) => action.type.endsWith("/pending"),
				(state, action) => {
					// thunk action quản lý tác vụ call API lần đầu được thực thi
					// -> set state isLoading thành true -> bật trạng thái loading
					// -> gán currentRequestId cho requestId đầu tiên được sinh ra.
					// -> lần thứ 2 call API được thi do strict Mode, curentRequestId được gán tiếp cho requestId thứ 2
					state.isLoading = true;
					state.currentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) => action.type.endsWith("/rejected") || action.type.endsWith("/fulfilled"),
				(state, action) => {
					// Nếu như isLoading đang = true đồng thời currentRequestId phải trùng với currentRequestId
					// của tác vụ call API sau cùng thì mới set ngược lại isLoading = false và currentRequestId = undefined
					if (state.isLoading && state.currentRequestId === action.meta.requestId) {
						state.isLoading = false;
						state.currentRequestId = undefined;
					}
				},
			);
	},
});
const productListReducer = productListSlice.reducer;
export default productListReducer;
