// redux toolkit
import { configureStore } from "@reduxjs/toolkit";
// reducers
import { userProfileReducer, productItemDetailReducer, authenticationReducer, purchaseListReducer, productListReducer } from "src/slices";

const store = configureStore({
	reducer: {
		purchaseList: purchaseListReducer,
		productList: productListReducer,
		authentication: authenticationReducer,
		productItemDetail: productItemDetailReducer,
		userProfile: userProfileReducer,
	},
});
export default store;
