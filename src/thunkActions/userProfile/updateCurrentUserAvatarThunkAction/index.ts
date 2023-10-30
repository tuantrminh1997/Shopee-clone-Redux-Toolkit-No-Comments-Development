import { createAsyncThunk } from "@reduxjs/toolkit";
import { uploadUserAvatarPathURL } from "src/constants";
import { SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get User Profile
const updateCurrentUserAvatarThunkAction = createAsyncThunk("userProfile/updateCurrentUserAvatar", async (updateCurrentUserAvatarBody: FormData) => {
	const response = await http.post<SuccessResponseApi<string>>(uploadUserAvatarPathURL, updateCurrentUserAvatarBody, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	// return về giá trị gì		// -> callback này trở thành Promise.resolve(giá trị đó)
	// -> được bắt ở fulFilled của slice
	return response.data;
});
export default updateCurrentUserAvatarThunkAction;
