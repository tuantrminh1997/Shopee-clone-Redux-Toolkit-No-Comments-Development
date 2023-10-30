/* eslint-disable react-hooks/exhaustive-deps */
// react toastify:
import { ToastContainer } from "react-toastify";
// react hooks:
import { useEffect } from "react";
// react redux
import { useDispatch } from "react-redux";
// custome hooks:
import { useRouteElements } from "src/hooks";
// event target:
import { clearLocalStorageEventTarget, clearAccessTokenUserProfileEventMessage } from "src/utils";
import "react-toastify/dist/ReactToastify.css";
// actions:
import { setIsLoggedInAction } from "src/slices/authenticationSlice";
import { setCurrentUserProfileAction } from "src/slices/userProfileSlice";
import { updateExtendPurchaseListAction } from "src/slices/purchaseListSlice";

function App() {
	const routeElements = useRouteElements();
	const dispatch = useDispatch();
	useEffect(() => {
		const resetIsLoggedInUserProfile = () => {
			dispatch(setCurrentUserProfileAction(null));
			dispatch(setIsLoggedInAction(false));
			dispatch(updateExtendPurchaseListAction([]));
		};
		clearLocalStorageEventTarget.addEventListener(clearAccessTokenUserProfileEventMessage, resetIsLoggedInUserProfile);
		return () => clearLocalStorageEventTarget.removeEventListener(clearAccessTokenUserProfileEventMessage, resetIsLoggedInUserProfile);
	}, []);
	return (
		<div>
			{routeElements}
			<ToastContainer />
		</div>
	);
}
export default App;
