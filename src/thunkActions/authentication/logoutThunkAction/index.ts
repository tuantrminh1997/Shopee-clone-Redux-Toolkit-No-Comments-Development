/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { logoutPathURL } from "src/constants";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get Post List
const logoutThunkAction = createAsyncThunk("authentication/logout", async (_, { rejectWithValue }) => {
	try {
		const response = await http.post(logoutPathURL);
		// return về giá trị gì
		// -> callback này trở thành Promise.resolve(giá trị đó)
		// -> được bắt ở fulFilled của slice
		return Promise.resolve(response.data);
	} catch (error: any) {
		// bắt ở reject của slice
		return rejectWithValue(error.response);
	}
});
export default logoutThunkAction;
