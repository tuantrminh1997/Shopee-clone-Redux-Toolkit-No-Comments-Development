/* eslint-disable @typescript-eslint/no-explicit-any */
// redux toolkit
import { AsyncThunk, createSlice } from "@reduxjs/toolkit";
// types
import { User } from "src/types";
// react toastify
import { toast } from "react-toastify";
// utils
import { getUserProfileFromLocalStorage } from "src/utils";
// thunk actions
import { getCurrentUserPropfileThunkAction, updateCurrentUserProfileThunkAction } from "src/thunkActions";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;

interface UserProfileInitialStateType {
	currentUserProfile: User | null;
	updateUserProfileLoadingStatus: boolean;
	updateUserProfileCurrentRequestId: undefined | string;
	getUserProfileLoadingStatus: boolean;
	getUserProfileCurrentRequestId: undefined | string;
	updateUserAvatarLoadingStatus: boolean;
	updateUserAvatarCurrentRequestId: undefined | string;
}

const initialState: UserProfileInitialStateType = {
	currentUserProfile:
		getUserProfileFromLocalStorage() !== null && getUserProfileFromLocalStorage().data
			? getUserProfileFromLocalStorage().data.user
			: getUserProfileFromLocalStorage(),
	updateUserProfileLoadingStatus: false,
	updateUserProfileCurrentRequestId: undefined,
	getUserProfileLoadingStatus: false,
	getUserProfileCurrentRequestId: undefined,
	updateUserAvatarLoadingStatus: false,
	updateUserAvatarCurrentRequestId: undefined,
};

const userProfileSlice = createSlice({
	name: "userProfile",
	initialState,
	reducers: {
		setCurrentUserProfileAction(state, action) {
			state.currentUserProfile = action.payload;
		},
	},
	extraReducers(builder) {
		builder
			.addCase(getCurrentUserPropfileThunkAction.fulfilled, (state, action) => {
				const currentUserProfile = action.payload.data;
				state.currentUserProfile = currentUserProfile;
			})
			.addCase(updateCurrentUserProfileThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 2000,
				});
			})
			.addMatcher<PendingAction>(
				(action) => action.type === "userProfile/updateCurrentUserProfile/pending",
				(state, action) => {
					state.updateUserProfileLoadingStatus = true;
					state.updateUserProfileCurrentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) =>
					action.type === "userProfile/updateCurrentUserProfile/rejected" || action.type === "userProfile/updateCurrentUserProfile/fulfilled",
				(state, action) => {
					if (state.updateUserProfileLoadingStatus && state.updateUserProfileCurrentRequestId === action.meta.requestId) {
						state.updateUserProfileLoadingStatus = false;
						state.updateUserProfileCurrentRequestId = undefined;
					}
				},
			)
			.addMatcher<PendingAction>(
				(action) => action.type === "userProfile/getCurrentUserProfile/pending",
				(state, action) => {
					state.getUserProfileLoadingStatus = true;
					state.getUserProfileCurrentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) => action.type === "userProfile/getCurrentUserProfile/rejected" || action.type === "userProfile/getCurrentUserProfile/fulfilled",
				(state, action) => {
					if (state.getUserProfileLoadingStatus && state.getUserProfileCurrentRequestId === action.meta.requestId) {
						state.getUserProfileLoadingStatus = false;
						state.getUserProfileCurrentRequestId = undefined;
					}
				},
			)
			.addMatcher<PendingAction>(
				(action) => action.type === "userProfile/updateCurrentUserAvatar/pending",
				(state, action) => {
					state.updateUserAvatarLoadingStatus = true;
					state.updateUserAvatarCurrentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) => action.type === "userProfile/updateCurrentUserAvatar/rejected" || action.type === "userProfile/updateCurrentUserAvatar/fulfilled",
				(state, action) => {
					if (state.updateUserAvatarLoadingStatus && state.updateUserAvatarCurrentRequestId === action.meta.requestId) {
						state.updateUserAvatarLoadingStatus = false;
						state.updateUserAvatarCurrentRequestId = undefined;
					}
				},
			);
	},
});
export const { setCurrentUserProfileAction } = userProfileSlice.actions;
const userProfileReducer = userProfileSlice.reducer;
export default userProfileReducer;
