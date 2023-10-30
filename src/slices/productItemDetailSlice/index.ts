/* eslint-disable @typescript-eslint/no-explicit-any */
// redux toolkit
import { AsyncThunk, createSlice } from "@reduxjs/toolkit";
// types
import { ProductItemDetailInitialStateType } from "src/types";
// thunk actions
import { getSimilarSoldByProductListThunkAction, getSimilarProductListThunkAction, getProductItemDetailThunkAction } from "src/thunkActions";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;

const initialState: ProductItemDetailInitialStateType = {
	productItemDetail: null,
	productItemDetailLoading: false,
	currentRequestId: undefined,
	similarSoldByProductList: [],
	similarProductList: [],
};

const productItemDetailSlice = createSlice({
	name: "productItemDetail",
	initialState,
	reducers: {},
	extraReducers(builder) {
		builder
			.addCase(getProductItemDetailThunkAction.fulfilled, (state, action) => {
				const productItemDetail = action.payload.data;
				state.productItemDetail = productItemDetail;
			})
			.addCase(getSimilarProductListThunkAction.fulfilled, (state, action) => {
				const similarProductList = action.payload.data.products;
				state.similarProductList = similarProductList;
			})
			.addCase(getSimilarSoldByProductListThunkAction.fulfilled, (state, action) => {
				const similarSoldByProductList = action.payload.data.products;
				state.similarSoldByProductList = similarSoldByProductList;
			})
			.addMatcher<PendingAction>(
				(action) => action.type === "productItemDetail/getProductItemDetail/pending",
				(state, action) => {
					state.productItemDetailLoading = true;
					state.currentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) =>
					action.type === "productItemDetail/getProductItemDetail/rejected" || action.type === "productItemDetail/getProductItemDetail/fulfilled",
				(state, action) => {
					if (state.productItemDetailLoading && state.currentRequestId === action.meta.requestId) {
						state.productItemDetailLoading = false;
						state.currentRequestId = undefined;
					}
				},
			);
	},
});
const productItemDetailReducer = productItemDetailSlice.reducer;
export default productItemDetailReducer;
