/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateUserProfileBasePathURL } from "src/constants";
import { ChangeUserPasswordBodyType, SuccessResponseApi, UpdateUserProfileBodyType, User } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API -> update User Profile
const updateCurrentUserProfileThunkAction = createAsyncThunk(
	"userProfile/updateCurrentUserProfile",
	async (updateCurrentUserProfileBody: UpdateUserProfileBodyType | ChangeUserPasswordBodyType, { rejectWithValue }) => {
		try {
			const response = await http.put<SuccessResponseApi<User>>(updateUserProfileBasePathURL, updateCurrentUserProfileBody);
			// return về giá trị gì
			// -> callback này trở thành Promise.resolve(giá trị đó)
			// -> được bắt ở fulFilled của slice
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.response);
		}
	},
);
export default updateCurrentUserProfileThunkAction;
