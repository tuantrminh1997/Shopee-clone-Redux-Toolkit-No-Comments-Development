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
	currentRequestId: string | undefined;
}

const initialState: AuthenticationInitialStateType = {
	isLoggedIn: Boolean(getAccessTokenFromLocalStorage()),
	authenticationLoading: false,
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
