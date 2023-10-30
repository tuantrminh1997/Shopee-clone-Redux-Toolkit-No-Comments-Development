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
	currentRequestId: undefined,
};

const productListSlice = createSlice({
	name: "productList",
	initialState,
	reducers: {},
	extraReducers(builder) {
		builder
			.addCase(getProductListThunkAction.fulfilled, (state, action) => {
				const productList = action.payload.data.products;
				const pagination = action.payload.data.pagination;
				state.productList = productList;
				state.pagination = pagination;
			})
			.addCase(getCategoriesThunkAction.fulfilled, (state, action) => {
				const categories = action.payload.data;
				state.categories = categories;
			})
			.addMatcher<PendingAction>(
				(action) => action.type.endsWith("/pending"),
				(state, action) => {
					state.isLoading = true;
					state.currentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) => action.type.endsWith("/rejected") || action.type.endsWith("/fulfilled"),
				(state, action) => {
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
