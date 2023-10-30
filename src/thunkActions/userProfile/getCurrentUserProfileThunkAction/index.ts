import { createAsyncThunk } from "@reduxjs/toolkit";
import { userProfileBasePathURL } from "src/constants";
import { SuccessResponseApi, User } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get User Profile
const getCurrentUserPropfileThunkAction = createAsyncThunk("userProfile/getCurrentUserProfile", async (_, thunkAPI) => {
	const response = await http.get<SuccessResponseApi<User>>(userProfileBasePathURL, {
		signal: thunkAPI.signal,
	});
	// return về giá trị gì
	// -> callback này trở thành Promise.resolve(giá trị đó)
	// -> được bắt ở fulFilled của slice
	return response.data;
});
export default getCurrentUserPropfileThunkAction;
