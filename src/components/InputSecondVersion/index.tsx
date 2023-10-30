import { forwardRef, useState } from "react";
import { InputNumberPropsType } from "src/types";
import { FieldValues } from "react-hook-form";

const InputSecondVersion = forwardRef<HTMLInputElement, InputNumberPropsType<FieldValues>>(function InputNumberInner(
	{
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
		// ref,
		value = "",
		...restProps
	},
	ref,
) {
	const [localValueState, setLocalValueState] = useState<string | number>(value);

	const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		if (/^\d+$/.test(value) || value === "") {
			onChange && onChange(event);
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
				value={value || localValueState}
				{...restProps}
			/>
			<div className={classNameError}>{errorMessage}</div>
		</div>
	);
});
export default InputSecondVersion;
