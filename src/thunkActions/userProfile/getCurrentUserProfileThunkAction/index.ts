import { createAsyncThunk } from "@reduxjs/toolkit";
import { userProfileBasePathURL } from "src/constants";
import { SuccessResponseApi, User } from "src/types";
import { httpInstance as http } from "src/utils";

const getCurrentUserPropfileThunkAction = createAsyncThunk("userProfile/getCurrentUserProfile", async (_, thunkAPI) => {
	const response = await http.get<SuccessResponseApi<User>>(userProfileBasePathURL, {
		signal: thunkAPI.signal,
	});
	return response.data;
});
export default getCurrentUserPropfileThunkAction;
