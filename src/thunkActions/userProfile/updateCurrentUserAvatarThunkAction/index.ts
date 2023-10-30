import { createAsyncThunk } from "@reduxjs/toolkit";
import { uploadUserAvatarPathURL } from "src/constants";
import { SuccessResponseApi } from "src/types";
import { httpInstance as http } from "src/utils";

const updateCurrentUserAvatarThunkAction = createAsyncThunk("userProfile/updateCurrentUserAvatar", async (updateCurrentUserAvatarBody: FormData) => {
	const response = await http.post<SuccessResponseApi<string>>(uploadUserAvatarPathURL, updateCurrentUserAvatarBody, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return response.data;
});
export default updateCurrentUserAvatarThunkAction;
