/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginPathURL } from "src/constants";
import { AuthenticationResponse, RegisterAccountBodyType } from "src/types";
import { httpInstance as http } from "src/utils";

// Thunk action quản lý tác vụ call API get Post List
const loginThunkAction = createAsyncThunk("authentication/login", async (loginThunkActionBody: RegisterAccountBodyType, { rejectWithValue }) => {
	try {
		const response = await http.post<AuthenticationResponse>(loginPathURL, loginThunkActionBody);
		return Promise.resolve(response.data);
	} catch (error: any) {
		return rejectWithValue(error.response);
	}
});
export default loginThunkAction;
