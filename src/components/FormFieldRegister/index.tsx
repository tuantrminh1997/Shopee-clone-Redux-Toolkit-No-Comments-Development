// rect hooks:
import { memo, useMemo, useState } from "react";
// constants:
import { paths } from "src/constants";
// react hook forms:
import { UseFormRegister, useFormContext } from "react-hook-form";
// types:
import { FormFieldRegisterPropsType, UserProfilePickedFormData } from "src/types";
// common components
import { Input } from "src/components";

export default memo(function FormFieldRegister({
	type,
	fieldTitle,
	formPropertyName,
	placeHolder,
	errorMessage,
	pathname,
}: FormFieldRegisterPropsType) {
	// constants:
	const { changePassword } = paths;

	// state quản lý trạng thái show/hive icon Eye:
	const [openEyeIconMode, setOpenEyeIconMode] = useState<boolean>(false);
	const handleToggleShowPassword: (openEyeIconMode: boolean) => void = (openEyeIconMode: boolean) => {
		setOpenEyeIconMode(openEyeIconMode);
	};
	const inputType = useMemo(() => (openEyeIconMode ? "text" : "password"), [openEyeIconMode]);

	// form context
	const { register } = useFormContext<UserProfilePickedFormData>();

	return (
		<div className='flex'>
			<div className='flex items-center justify-end basis-[33.33%] pb-[30px] xl:justify-start xl:basis-[8%] lg:min-w-[71px]'>
				<p className='text-xs text-[#555555CC] capitalize'>{fieldTitle}</p>
			</div>
			<div className='pb-[10px] pl-[20px] flex-1'>
				<Input
					key={"inputUniqueKey"}
					// Nếu như pathname === changePassword thì type ăn theo giá trị của inputType còn không thì ăn theo type ta truyền trực tiếp vào
					type={(pathname === changePassword ? inputType : type) as string}
					// Khi error trong form xuất hiện ở input nào -> input đó đỏ rực lên
					placeholder={placeHolder}
					// elements:
					ContainerElement={"div" as React.ElementType}
					ErrorContainerElement={"p" as React.ElementType}
					// messae error
					errorMessage={errorMessage as string}
					// classNames
					classNameError='text-sm text-[#ff424f] min-h-[20px] mt-1'
					classNameInput={
						`w-full p-3 rounded-sm outline-none profileInputBoxShadow ${
							errorMessage ? "border border-[#ff424f] bg-[#fff9fa]" : " border border-[rgba(0,0,0,.14)] "
						}` as string
					}
					// register + formName
					register={register as UseFormRegister<UserProfilePickedFormData>}
					formPropertyName={formPropertyName as "address" | "name" | "phone" | "avatar" | "date_of_birth"}
					handleToggleShowPassword={handleToggleShowPassword as (openEyeIconMode: boolean) => void}
					pathname={pathname}
				/>
			</div>
		</div>
	);
});
