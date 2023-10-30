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
	// purchase List in cart: status = -1
	purchaseListInCart: [],
	purchaseList: [],
	// purchase list mà các đối tượng được gắn thêm 2 thuộc tính isCheck, disabled
	extendPurchaseList: [],
	// handle state loading
	purchaseListLoading: false,
	currentRequestId: undefined,
};

const purchaseListSlice = createSlice({
	name: "purchaseList",
	initialState,
	reducers: {
		// 1. action quản lý chức năng thay đổi trạng thái đăng nhập ứng dụng
		updateExtendPurchaseListAction: (state, action: PayloadAction<ExtendPurchaseSuccessResponse[]>) => {
			state.extendPurchaseList = action.payload;
		},
		// 2. action quản lý chức năng thay đổi trạng thái disable của Purchase Item
		setPurchaseItemDisableStatusAction: (state, action: PayloadAction<number>) => {
			const newExtendPurchaseList = state.extendPurchaseList.map((extendPurchaseItem, index) => {
				if (index === action.payload) {
					extendPurchaseItem.disabled = true;
				}
				return extendPurchaseItem;
			});
			state.extendPurchaseList = newExtendPurchaseList;
		},
		// 3. action quản lý chức năng thay đổi Quantity Purchase Item bằng cách nhập tay từ bàn phím
		setPurchaseItemQuantityOnTypeAction: (state, action: PayloadAction<{ purchaseItemIndex: number; buyCountValue: number }>) => {
			const newExtendPurchaseList = state.extendPurchaseList.map((extendPurchaseItem, index) => {
				if (index === action.payload.purchaseItemIndex) {
					extendPurchaseItem.buy_count = action.payload.buyCountValue;
				}
				return extendPurchaseItem;
			});
			state.extendPurchaseList = newExtendPurchaseList;
		},
		// 4. action quản lý chức năng thay đổi trạng thái check của Purchase Item
		setPurchaseItemCheckStatusAction: (state, action: PayloadAction<{ purchaseItemIndex: number; purchaseItemCheckStatus: boolean }>) => {
			const newExtendPurchaseList = state.extendPurchaseList.map((extendPurchaseItem, index) => {
				if (index === action.payload.purchaseItemIndex) {
					extendPurchaseItem.isCheck = action.payload.purchaseItemCheckStatus;
				}
				return extendPurchaseItem;
			});
			state.extendPurchaseList = newExtendPurchaseList;
		},
		// 5. action quản lý chức năng tích chọn toàn bộ Purchase Item trong List.
		// -> thay đổi toàn bộ trạng thái isCheck của các phần tử trong list extendPurchaseList
		setAllPurchaseItemCheckStatusAction: (state, action: PayloadAction<ExtendPurchaseSuccessResponse[]>) => {
			const newExtendPurchaseList = action.payload;
			state.extendPurchaseList = newExtendPurchaseList;
		},
		// 6. action quản lý tác vụ set Purchase List -> set ngược về array [] khi logout thành công
		setPurchaseList: (state, action: PayloadAction<[]>) => {
			state.purchaseListInCart = action.payload;
		},
	},
	extraReducers(builder) {
		builder
			// 1. Thunk Action quản lý tác vụ get Purchase List In Cart (status = -1)
			// method: GET
			// url: getPurchaseListPathURL === /purchases
			// params: { status: PurchaseListStatus }
			.addCase(getPurchaseListInCartThunkAction.fulfilled, (state, action) => {
				// duyệt qua mảng đó, cứ 1 đối tượng có status = -1 thì tăng biến đếm thêm 1, nếu biến đếm cuối cùng có giá trị = length của mảng đầu vào
				// -> thoả mãn tất cả các đối tượng có status = -1
				const purchaseListInCart = action.payload.data;
				state.purchaseListInCart = purchaseListInCart;
			})
			// 2. Thunk Action quản lý tác vụ get Purchase List
			.addCase(getPurchaseListThunkAction.fulfilled, (state, action) => {
				// duyệt qua mảng đó, cứ 1 đối tượng có status = -1 thì tăng biến đếm thêm 1, nếu biến đếm cuối cùng có giá trị = length của mảng đầu vào
				// -> thoả mãn tất cả các đối tượng có status = -1
				const purchaseList = action.payload.data;
				state.purchaseList = purchaseList;
			})
			// 2. Thunk Action quản lý tác vụ add to cart
			// method: POST
			.addCase(addProductItemToCartThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 2000,
				});
			})
			// 3. Thunk Action quản lý tác vụ update Purchase List (tăng, giảm số lượng Purchase Item trong Cart)
			.addCase(updatePurchaseListThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 1000,
				});
			})
			// 4. Thunk Action quản lý tác vụ Thanh toán các Purchase Items đã được check
			.addCase(buyCheckedPurchaseItemsThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 1000,
				});
			})
			// 5. Thunk Action quản lý tác vụ Delete Purchase Items
			.addCase(deletePurchaseItemThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 1000,
				});
			})
			// Handle trạng thái loading khi tiến hành mua hàng
			.addMatcher<PendingAction>(
				(action) => action.type === "purchaseList/buyCheckedPurchaseItems/pending",
				(state, action) => {
					// thunk action quản lý tác vụ call API lần đầu được thực thi
					// -> set state isLoading thành true -> bật trạng thái loading
					// -> gán currentRequestId cho requestId đầu tiên được sinh ra.
					// -> lần thứ 2 call API được thi do strict Mode, curentRequestId được gán tiếp cho requestId thứ 2
					state.purchaseListLoading = true;
					state.currentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) =>
					action.type === "purchaseList/buyCheckedPurchaseItems/rejected" || action.type === "purchaseList/buyCheckedPurchaseItems/fulfilled",
				(state, action) => {
					// Nếu như isLoading đang = true đồng thời currentRequestId phải trùng với currentRequestId
					// của tác vụ call API sau cùng thì mới set ngược lại isLoading = false và currentRequestId = undefined
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
