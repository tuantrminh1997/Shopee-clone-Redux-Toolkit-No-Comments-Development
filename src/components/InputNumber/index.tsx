import { forwardRef, useState } from "react";
import { InputNumberPropsType } from "src/types";
import { FieldValues } from "react-hook-form";

// Tham khảo cách rút ngắn code khi sử dụng Component Controller từ react-hook-form -> sử dụng useController từ ReachookForm (Lưu ý là chỉ sử dụng useController khi sử dụng
// react-hook-form)
const InputNumber = forwardRef<HTMLInputElement, InputNumberPropsType<FieldValues>>(function InputNumberInner(
	{
		// className cho thẻ div bao bọc
		// Chú ý: với className nếu set giá trị default, khi truyền prop thì className default sẽ bị ghi đè toàn bộ
		classNameContainer, // ?
		// className cho ther input
		classNameInput, // ?
		// className cho thẻ div error
		classNameError, // ?
		type, // ?
		errorMessage, // ?
		placeholder, // ?
		autoComplete, // ?
		onChange, // ?
		value = "",
		...restProps
	},
	ref,
) {
	const [localValueState, setLocalValueState] = useState<string | number>(value);

	// Method handle việc nhập ký tự text -> không ăn, yêu cầu cần nhập chữ số
	const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		if (/^\d+$/.test(value) || value === "") {
			// Nếu có truyền onChange -> truyền event cho onChange và thực thi hàm onChange từ bên ngoài
			onChange && onChange(event);
			// cập nhật lại localValueState -> vì value không truyền từ ngoài vào -> value tại thẻ input = localValueState
			setLocalValueState(value);
		}
	};

	return (
		<div className={classNameContainer}>
			<input
				type={type}
				// className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm'
				className={classNameInput}
				placeholder={placeholder}
				autoComplete={autoComplete}
				onChange={handleChangeInput}
				ref={ref}
				// 1. Nếu prop value có giá trị thì ô input sẽ hiển thị giá trị của value.
				// 2. Nếu prop value không có giá trị (falsy), như là chuỗi rỗng, null, hoặc undefined, thì ô input sẽ hiển thị giá trị của localValueState.
				// -> Điều này cho phép bạn điều chỉnh cách dữ liệu hiển thị trong ô input dựa trên giá trị của value, và nếu value không được cung cấp hoặc có giá trị falsy, bạn có thể sử
				// dụng localValueState để duy trì một trạng thái dữ liệu tạm thời.

				// -> Liên hệ đến 1 toán tử ?? gần giống ||
				// 1. Toán tử ?? là "Nullish Coalescing Operator" trong JavaScript. Nó được sử dụng để xác định giá trị mặc định cho một biến trong trường hợp biến đó là null hoặc
				// undefined. Toán tử ?? hoạt động khá giống với toán tử ||, nhưng có một số khác biệt quan trọng.
				// 2. Khi sử dụng toán tử ??, giá trị sẽ được trả về nếu nó là một giá trị không null hoặc không undefined. Nếu giá trị là null hoặc undefined, thì giá trị bên phải của toán
				// tử ?? sẽ được trả về.
				// 3. So sánh với toán tử ||, toán tử ?? sẽ xem xét chính xác giá trị null hoặc undefined, trong khi toán tử || sẽ trả về giá trị bên phải nếu giá trị bên trái là "falsy"
				// (các giá trị được coi là sai trong ngữ cảnh boolean).

				// -> nếu value là falsy thì mặc định value bị lấy bằng localValueState -> như thế sẽ gây ra vấn đề, nếu như reset lại
				// form -> value nhận vào là 1 chuỗi rỗng -> falsy
				// -> value === localValueState, trong khi localValueState đang được set bằng Value.
				// -> sẽ gây ra bug khi ấn xoá tất cả ở form filter, khoảng giá nhập vào không bị clear đi dù đã resetform
				value={value === undefined ? localValueState : value}
				{...restProps}
			/>
			{/* Nếu không set min-h -> khi xuất hiện lỗi hoặc không -> UI bị đẩy lên đẩy xuống gây xấu. */}
			<div className={classNameError}>{errorMessage}</div>
		</div>
	);
});
export default InputNumber;

// export default function InputNumber({
// 	// className cho thẻ div bao bọc
// 	// Chú ý: với className nếu set giá trị default, khi truyền prop thì className default sẽ bị ghi đè toàn bộ
// 	classNameContainer, // ?
// 	// className cho ther input
// 	classNameInput, // ?
// 	// className cho thẻ div error
// 	classNameError, // ?
// 	type, // ?
// 	errorMessage, // ?
// 	placeholder, // ?
// 	autoComplete, // ?
// 	onChange, // ?
// 	ref,
// 	...restProps
// }: InputPropsType) {
// 	// Method quản lý chức năng nhập giá trị thanh Input:
// 	// khi cố tình nhập ký tự text -> onChange ko chạy
// 	// khi nhập ký tự number -> hoạt động bình thường
// 	// Lưu ý: xem type event = cách: tại element có sự kiện onChange onChange = {e => }, hover chuột
// 	const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
// 		const { value } = event.target;
// 		if ((/^\d+$/.test(value) || value === "") && onChange) {
// 			onChange(event);
// 		}
// 	};

// 	return (
// 		<div className={classNameContainer}>
// 			<input
// 				type={type}
// 				// className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm'
// 				className={classNameInput}
// 				placeholder={placeholder}
// 				autoComplete={autoComplete}
// 				onChange={handleChangeInput}
// 				ref={ref}
// 				{...restProps}
// 			/>
// 			{/* Nếu không set min-h -> khi xuất hiện lỗi hoặc không -> UI bị đẩy lên đẩy xuống gây xấu. */}
// 			<div className={classNameError}>{errorMessage}</div>
// 		</div>
// 	);
// }
