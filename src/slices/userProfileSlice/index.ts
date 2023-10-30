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
	// update user profile loading status
	updateUserProfileLoadingStatus: boolean;
	updateUserProfileCurrentRequestId: undefined | string;
	// get user profile loading status
	getUserProfileLoadingStatus: boolean;
	getUserProfileCurrentRequestId: undefined | string;
	// handle trạng thái loading của tác vụ update User Avatar
	updateUserAvatarLoadingStatus: boolean;
	updateUserAvatarCurrentRequestId: undefined | string;
}

const initialState: UserProfileInitialStateType = {
	// state quản lý user Profile
	currentUserProfile:
		getUserProfileFromLocalStorage() !== null && getUserProfileFromLocalStorage().data
			? getUserProfileFromLocalStorage().data.user
			: getUserProfileFromLocalStorage(),
	// handle trạng thái loading của tác vụ update user profile
	updateUserProfileLoadingStatus: false,
	updateUserProfileCurrentRequestId: undefined,
	// handle trạng thái loading của tác vụ get User Profile
	getUserProfileLoadingStatus: false,
	getUserProfileCurrentRequestId: undefined,
	// handle trạng thái loading của tác vụ update User Avatar
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
		// 1. Thunk Action quản lý tác vụ call API -> get current User Profile
		builder
			.addCase(getCurrentUserPropfileThunkAction.fulfilled, (state, action) => {
				const currentUserProfile = action.payload.data;
				state.currentUserProfile = currentUserProfile;
			})
			// 2. Thunk Action quản lý tác vụ update User Profile
			.addCase(updateCurrentUserProfileThunkAction.fulfilled, (_, action) => {
				const successMessage = action.payload.message;
				toast.success(successMessage, {
					position: "top-center",
					autoClose: 2000,
				});
			})
			// 1. handle trạng thái loading của tác vụ Update User Profile
			.addMatcher<PendingAction>(
				(action) => action.type === "userProfile/updateCurrentUserProfile/pending",
				(state, action) => {
					// thunk action quản lý tác vụ call API lần đầu được thực thi
					// -> set state isLoading thành true -> bật trạng thái loading
					// -> gán currentRequestId cho requestId đầu tiên được sinh ra.
					// -> lần thứ 2 call API được thi do strict Mode, curentRequestId được gán tiếp cho requestId thứ 2
					state.updateUserProfileLoadingStatus = true;
					state.updateUserProfileCurrentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) =>
					action.type === "userProfile/updateCurrentUserProfile/rejected" || action.type === "userProfile/updateCurrentUserProfile/fulfilled",
				(state, action) => {
					// Nếu như isLoading đang = true đồng thời currentRequestId phải trùng với currentRequestId
					// của tác vụ call API sau cùng thì mới set ngược lại isLoading = false và currentRequestId = undefined
					if (state.updateUserProfileLoadingStatus && state.updateUserProfileCurrentRequestId === action.meta.requestId) {
						state.updateUserProfileLoadingStatus = false;
						state.updateUserProfileCurrentRequestId = undefined;
					}
				},
			)
			// 2. handle trạng thái loading của tác vụ get User Profile
			.addMatcher<PendingAction>(
				(action) => action.type === "userProfile/getCurrentUserProfile/pending",
				(state, action) => {
					// thunk action quản lý tác vụ call API lần đầu được thực thi
					// -> set state isLoading thành true -> bật trạng thái loading
					// -> gán currentRequestId cho requestId đầu tiên được sinh ra.
					// -> lần thứ 2 call API được thi do strict Mode, curentRequestId được gán tiếp cho requestId thứ 2
					state.getUserProfileLoadingStatus = true;
					state.getUserProfileCurrentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) => action.type === "userProfile/getCurrentUserProfile/rejected" || action.type === "userProfile/getCurrentUserProfile/fulfilled",
				(state, action) => {
					// Nếu như isLoading đang = true đồng thời currentRequestId phải trùng với currentRequestId
					// của tác vụ call API sau cùng thì mới set ngược lại isLoading = false và currentRequestId = undefined
					if (state.getUserProfileLoadingStatus && state.getUserProfileCurrentRequestId === action.meta.requestId) {
						state.getUserProfileLoadingStatus = false;
						state.getUserProfileCurrentRequestId = undefined;
					}
				},
			)
			// 3. handle trạng thái loading của tác vụ update User Avatar
			.addMatcher<PendingAction>(
				(action) => action.type === "userProfile/updateCurrentUserAvatar/pending",
				(state, action) => {
					// thunk action quản lý tác vụ call API lần đầu được thực thi
					// -> set state isLoading thành true -> bật trạng thái loading
					// -> gán currentRequestId cho requestId đầu tiên được sinh ra.
					// -> lần thứ 2 call API được thi do strict Mode, curentRequestId được gán tiếp cho requestId thứ 2
					state.updateUserAvatarLoadingStatus = true;
					state.updateUserAvatarCurrentRequestId = action.meta.requestId;
				},
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) => action.type === "userProfile/updateCurrentUserAvatar/rejected" || action.type === "userProfile/updateCurrentUserAvatar/fulfilled",
				(state, action) => {
					// Nếu như isLoading đang = true đồng thời currentRequestId phải trùng với currentRequestId
					// của tác vụ call API sau cùng thì mới set ngược lại isLoading = false và currentRequestId = undefined
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
