/* eslint-disable @typescript-eslint/no-explicit-any */
// redux toolkit
import { AsyncThunk, PayloadAction, createSlice } from "@reduxjs/toolkit";
// react toastify
import { toast } from "react-toastify";
// thunk actions
import {
	addProductItemToCartThunkAction,
	buyCheckedPurchaseItemsThunkAction,
	deletePurchaseItemThunkAction,
	getPurchaseListThunkAction,
	getPurchaseListInCartThunkAction,
	updatePurchaseListThunkAction,
} from "src/thunkActions";
// types
import { ExtendPurchaseSuccessResponse, PurchaseSliceInitialStateType } from "src/types";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;

const initialState: PurchaseSliceInitialStateType = {
	purchaseListInCart: [],
	purchaseList: [],
	extendPurchaseList: [],
	purchaseListLoading: false,
	currentRequestId: undefined,
};

const purchaseListSlice = createSlice({
	name: "purchaseList",
	initialState,
	reducers: {
		updateExtendPurchaseListAction: (state, action: PayloadAction<ExtendPurchaseSuccessResponse[]>) => {
			state.extendPurchaseList = action.payload;
		},
		setPurchaseItemDisableStatusAction: (state, action: PayloadAction<number>) => {
			const newExtendPurchaseList = state.extendPurchaseList.map((extendPurchaseItem, index) => {
				if (index === action.payload) {
					extendPurchaseItem.disabled = true;
				}
				return extendPurchaseItem;
			});
			state.extendPurchaseList = newExtendPurchaseList;
		},
		setPurchaseItemQuantityOnTypeAction: (state, action: PayloadAction<{ purchaseItemIndex: number; buyCountValue: number }>) => {
			const newExtendPurchaseList = state.extendPurchaseList.map((extendPurchaseItem, index) => {
				if (index === action.payload.purchaseItemIndex) {
					extendPurchaseItem.buy_count = action.payload.buyCountValue;
				}
				return extendPurchaseItem;
			});
			state.extendPurchaseList = newExtendPurchaseList;
		},
		setPurchaseItemCheckStatusAction: (state, action: PayloadAction<{ purchaseItemIndex: number; purchaseItemCheckStatus: boolean }>) => {
			const newExtendPurchaseList = state.extendPurchaseList.map((extendPurchaseItem, index) => {
				if (index === action.payload.purchaseItemIndex) {
					extendPurchaseItem.isCheck = action.payload.purchaseItemCheckStatus;
				}
				return extendPurchaseItem;
			});
			state.extendPurchaseList = newExtendPurchaseList;
		},
		setAllPurchaseItemCheckStatusAction: (state, action: PayloadAction<ExtendPurchaseSuccessResponse[]>) => {
			const newExtendPurchaseList = action.payload;
			state.extendPurchaseList = newExtendPurchaseList;
		},
		setPurchaseList: (state, action: PayloadAction<[]>) => {
			state.purchaseListInCart = action.payload;
		},
	},
	extraReducers(builder) {
		builder
			.addCase(getPurchaseListInCartThunkAction.fulfilled, (state, action) => {
				const purchaseListInCart = action.payload.data;
				state.purchaseListInCart = purchaseListInCart;
			})
			.addCase(getPurchaseListThunkAction.fulfilled, (state, action) => {
				const purchaseList = action.payload.data;
				state.purchaseList = purchaseList;
			})
			.addCase(addProductItemToCartThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 2000,
				});
			})
			.addCase(updatePurchaseListThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 1000,
				});
			})
			.addCase(buyCheckedPurchaseItemsThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 1000,
				});
			})
			.addCase(deletePurchaseItemThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 1000,
				});
			})
			.addMatcher<PendingAction>(
				(action) => action.type === "purchaseList/buyCheckedPurchaseItems/pending",
				(state, action) => {
					state.purchaseListLoading = true;
					state.currentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) =>
					action.type === "purchaseList/buyCheckedPurchaseItems/rejected" || action.type === "purchaseList/buyCheckedPurchaseItems/fulfilled",
				(state, action) => {
					if (state.purchaseListLoading && state.currentRequestId === action.meta.requestId) {
						state.purchaseListLoading = false;
						state.currentRequestId = undefined;
					}
				},
			);
	},
});
export const {
	setPurchaseList,
	setPurchaseItemCheckStatusAction,
	updateExtendPurchaseListAction,
	setPurchaseItemDisableStatusAction,
	setPurchaseItemQuantityOnTypeAction,
	setAllPurchaseItemCheckStatusAction,
} = purchaseListSlice.actions;
const purchaseListReducer = purchaseListSlice.reducer;
export default purchaseListReducer;
