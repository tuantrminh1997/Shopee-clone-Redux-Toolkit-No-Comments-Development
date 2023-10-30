/* eslint-disable @typescript-eslint/no-explicit-any */
// redux toolkit
import { AsyncThunk, createSlice } from "@reduxjs/toolkit";
// utils
import { getAccessTokenFromLocalStorage } from "src/utils";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;

interface AuthenticationInitialStateType {
	isLoggedIn: boolean;
	authenticationLoading: boolean;
	// state currentRequestId được gán bằng requestId (sinh ra bởi createAsyncThunk)
	currentRequestId: string | undefined;
}

const initialState: AuthenticationInitialStateType = {
	isLoggedIn: Boolean(getAccessTokenFromLocalStorage()),
	authenticationLoading: false,
	// state currentRequestId được gán bằng requestId (sinh ra bởi createAsyncThunk)
	currentRequestId: undefined,
};

const authenticationSlice = createSlice({
	name: "authentication",
	initialState,
	reducers: {
		setIsLoggedInAction(state, action) {
			state.isLoggedIn = action.payload;
		},
	},
	extraReducers(builder) {
		builder
			// handle trạng thái loading của Login/Register
			.addMatcher<PendingAction>(
				(action) => action.type === "authentication/login/pending" || action.type === "authentication/register/pending",
				(state, action) => {
					// thunk action quản lý tác vụ call API lần đầu được thực thi
					// -> set state isLoading thành true -> bật trạng thái loading
					// -> gán currentRequestId cho requestId đầu tiên được sinh ra.
					// -> lần thứ 2 call API được thi do strict Mode, curentRequestId được gán tiếp cho requestId thứ 2
					state.authenticationLoading = true;
					state.currentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) =>
					action.type === "authentication/login/rejected" ||
					action.type === "authentication/login/fulfilled" ||
					action.type === "authentication/register/rejected" ||
					action.type === "authentication/register/fulfilled",
				(state, action) => {
					// Nếu như isLoading đang = true đồng thời currentRequestId phải trùng với currentRequestId
					// của tác vụ call API sau cùng thì mới set ngược lại isLoading = false và currentRequestId = undefined
					if (state.authenticationLoading && state.currentRequestId === action.meta.requestId) {
						state.authenticationLoading = false;
						state.currentRequestId = undefined;
					}
				},
			);
	},
});
export const { setIsLoggedInAction } = authenticationSlice.actions;
const authenticationReducer = authenticationSlice.reducer;
export default authenticationReducer;
