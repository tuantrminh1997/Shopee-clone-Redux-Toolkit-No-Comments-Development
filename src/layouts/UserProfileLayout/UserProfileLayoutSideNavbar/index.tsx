// react router dom:
import { useLocation } from "react-router-dom";
// react redux
import { useSelector } from "react-redux";
// react hooks:
import { useMemo, memo } from "react";
// utils:
import { isUserAccountPath } from "src/utils";
// types
import { RootState } from "src/types";
// private components:
import { AvatarName, MyAccount, PurchaseList } from "./components";

function UserProfileLayoutSideNavbarInner() {
	// user profile
	const currentUserProfileFromSlice = useSelector((state: RootState) => state.userProfile.currentUserProfile);
	const userProfile = useMemo(() => currentUserProfileFromSlice, [currentUserProfileFromSlice]); // Từ server trả về thông tin user trong đó có avatar user đã upload, đang ở dạng tên bức ảnh .....jpg/....png
	// -> cần xử lý tiếp để hiển thị hình ảnh lên
	// Biến quản lý path url
	const currentUrlPathName = useLocation().pathname;
	// Biến quản lý trạng thái route: Tài khoản của tôi ???
	const isOpenMyAccountNavbar = useMemo(() => isUserAccountPath(currentUrlPathName), [currentUrlPathName]);
	return (
		<div className='max-w-[180px] min-w-[168px] flex flex-col border xl:mx-3'>
			{/* Vùng avatar - my account */}
			<AvatarName userProfile={userProfile} />
			<div className='pt-7'>
				<MyAccount isOpenMyAccountNavbar={isOpenMyAccountNavbar} />
				<PurchaseList />
			</div>
		</div>
	);
}
const UserProfileLayoutSideNavbar = memo(UserProfileLayoutSideNavbarInner);
export default UserProfileLayoutSideNavbar;
