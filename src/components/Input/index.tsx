// react
import { Fragment } from "react";
// react hook form
import { FieldPath, FieldValues } from "react-hook-form";
// constants:
import { paths } from "src/constants";
// icons:
import { EyeHideIcon, EyeShowIcon } from "src/icons";
// types:
import { ContainerPropsType, InputNumberPropsType } from "src/types";

export default function Input<TFieldValues extends FieldValues = FieldValues>({
	// className cho thẻ div bao bọc
	// Chú ý: với className nếu set giá trị default, khi truyền prop thì className default sẽ bị ghi đè toàn bộ
	classNameContainer, // ?
	// className cho ther input
	classNameInput, // ?
	// className cho thẻ div error
	classNameError, // ?
	type,
	errorMessage, // ?
	placeholder, // ?
	formPropertyName,
	register, // ?
	formPropertyRules, // ?
	autoComplete, // ?
	ContainerElement,
	ErrorContainerElement,
	handleToggleShowPassword,
	pathname,
	...restProps
}: InputNumberPropsType<TFieldValues>) {
	const registerResult = register && formPropertyName ? register(formPropertyName as FieldPath<TFieldValues>, formPropertyRules) : null;

	// constants:
	const { changePassword } = paths;
	// Handle vấn đề: nếu như truyền classNameContainer -> đi vào object containerProps
	// Nếu như ContainerElement được truyền thành Fragment -> xoá các Key trong Object containerProps và ContainerElement không có Props gì -> tránh báo lỗi console.log
	const containerProps: ContainerPropsType = {};
	const errorContainerProps: ContainerPropsType = {};

	// Nếu thẻ cha chứa toàn bộ khối element và thẻ cha chứa error messa là Fragment
	// -> object containerProps và errorContainerProps là 2 object rỗng -> không truyền bất cứ props nào vào 2 element này
	// -> clear hết các props nhận vào 2 loại thẻ này -> tránh lỗi ở console
	if (ContainerElement !== Fragment) {
		containerProps.className = `${classNameContainer} relative`;
	}
	if (ErrorContainerElement !== Fragment) {
		errorContainerProps.className = classNameError;
	}
	const Container = ContainerElement || "div";
	const ErrorContainer = ErrorContainerElement || "div";
	// Khi ở route /user/account/password
	// phân biệt với route khác: /user/account/profile
	// -> thì mới hiển thị icon show/hide password
	return (
		// Nếu như containerProps là 1 object khác rỗng thì rải các thuộc tính trong containerProps ra thành thuộc tính của Container, còn không thì không rải
		<Container {...containerProps}>
			<input
				type={type}
				// className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm'
				className={classNameInput}
				placeholder={placeholder}
				// - Thuộc tính autoComplete trong thẻ <input> là một thuộc tính HTML được sử dụng để kiểm soát việc tự động điền thông tin vào các trường đầu vào (input fields) trên
				// một trình duyệt web. Thuộc tính này đề cập đến việc trình duyệt cung cấp gợi ý hoặc tự động điền các giá trị dựa trên lịch sử hoặc dữ liệu đã nhập trước đó. Mục tiêu
				// của autoComplete là giúp người dùng tiết kiệm thời gian và công sức khi nhập dữ liệu.
				// - Có một số giá trị mà bạn có thể gán cho thuộc tính autoComplete:
				// "on": Cho phép trình duyệt tự động điền các giá trị dựa trên dữ liệu đã nhập trước đó.
				// "off": Tắt chức năng tự động điền thông tin.
				// "username": Điền thông tin tài khoản người dùng (thường là tên đăng nhập).
				// "current-password": Điền thông tin mật khẩu hiện tại.
				// "new-password": Điền thông tin mật khẩu mới.
				// "email": Điền thông tin địa chỉ email.
				// "name": Điền thông tin tên người dùng.
				autoComplete={autoComplete}
				{...registerResult}
				{...restProps}
			/>
			{pathname === changePassword && type === "password" && (
				<span
					className='absolute top-0 right-0 pr-2 cursor-pointer translate-y-[50%]'
					onClick={() => {
						handleToggleShowPassword && handleToggleShowPassword(true);
					}}
					aria-hidden='true'
				>
					<EyeHideIcon />
				</span>
			)}
			{pathname === changePassword && type === "text" && (
				<span
					className='absolute top-0 right-0 pr-2 cursor-pointer translate-y-[50%]'
					onClick={() => {
						handleToggleShowPassword && handleToggleShowPassword(false);
					}}
					aria-hidden='true'
				>
					<EyeShowIcon />
				</span>
			)}
			{/* Nếu không set min-h -> khi xuất hiện lỗi hoặc không -> UI bị đẩy lên đẩy xuống gây xấu. */}
			<ErrorContainer {...errorContainerProps}>{errorMessage}</ErrorContainer>
		</Container>
	);
}
