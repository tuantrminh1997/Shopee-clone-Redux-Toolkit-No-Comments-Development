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
	// handle trạng thái loading
	productItemDetailLoading: false,
	// state lưu giữ giá trị request Id của lần request sau cùng, nếu như current request Id trùng với requestId của lần request sau cùng thì mới tắt trạng thái loading
	currentRequestId: undefined,
	// top các sản phẩm cùng thể loại được bán chạy (hiển thị dọc theo gốc bên phải màn hình UI)
	similarSoldByProductList: [],
	// các sản phẩm cùng thể loại (hiển thị ở cuối UI phần Product Item Detail)
	similarProductList: [],
};

const productItemDetailSlice = createSlice({
	name: "productItemDetail",
	initialState,
	reducers: {},
	extraReducers(builder) {
		builder
			// 1. Thunk Action quản lý tác vụ lấy thông tin chi tiết sản phẩm
			.addCase(getProductItemDetailThunkAction.fulfilled, (state, action) => {
				// 1.2. lưu thông tin Product Item Detail vào Reducer
				// -> lấy về component = useSelector và đổ ra UI
				const productItemDetail = action.payload.data;
				state.productItemDetail = productItemDetail;
			})
			// 2. Thunk Action quản lý tác vụ getSimilarProductListThunkAction
			.addCase(getSimilarProductListThunkAction.fulfilled, (state, action) => {
				const similarProductList = action.payload.data.products;
				state.similarProductList = similarProductList;
			})
			// 3. Thunk Action quản lý tác vụ getSimilarSoldByProductListThunkAction
			.addCase(getSimilarSoldByProductListThunkAction.fulfilled, (state, action) => {
				const similarSoldByProductList = action.payload.data.products;
				state.similarSoldByProductList = similarSoldByProductList;
			})
			.addMatcher<PendingAction>(
				(action) => action.type === "productItemDetail/getProductItemDetail/pending",
				(state, action) => {
					// thunk action quản lý tác vụ call API lần đầu được thực thi
					// -> set state isLoading thành true -> bật trạng thái loading
					// -> gán currentRequestId cho requestId đầu tiên được sinh ra.
					// -> lần thứ 2 call API được thi do strict Mode, curentRequestId được gán tiếp cho requestId thứ 2
					state.productItemDetailLoading = true;
					state.currentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) =>
					action.type === "productItemDetail/getProductItemDetail/rejected" || action.type === "productItemDetail/getProductItemDetail/fulfilled",
				(state, action) => {
					// Nếu như isLoading đang = true đồng thời currentRequestId phải trùng với currentRequestId
					// của tác vụ call API sau cùng thì mới set ngược lại isLoading = false và currentRequestId = undefined
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
