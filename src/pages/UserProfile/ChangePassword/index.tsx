/* eslint-disable @typescript-eslint/no-explicit-any */
// react router dom:
import { useLocation } from "react-router-dom";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// react hook form:
import { FormProvider, useForm, FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// lodash
import omit from "lodash/omit";
// i18n
import { useTranslation } from "react-i18next";
// custome hooks
import { useAppDispatch } from "src/hooks";
// thunk actions
import { updateCurrentUserProfileThunkAction } from "src/thunkActions";
// types:
import { ChangePasswordPickedFormData, ErrorResponseApi, FormRulesSchema, RootState } from "src/types";
// schemas, utils:
import { changePasswordPickedSchema, isUnprocessableEntityError } from "src/utils";
// common components:
import { FormFieldRegister, ProfileTitle, FormInputFields, SubmitFormButton } from "src/components";
import { useSelector } from "react-redux";

export default function ChangePassword() {
	// Sử dụng useFormContext: tình huống Form của ta có xu hướng phình to, phức tạp trong tương lai và chứa nhiều component
	// phức tạp, cụ thể ở đây form của chúng ta đã chứa 2 component MyAccountPropsTypes và UploadAvatar
	// -> chú ý: chấp nhận việc các component con mà sử dụng các thuộc tính của đối tượng trả về từ useForm (dù là qua props hay qua FormContext)
	//  sẽ bị re-render dù có tối ưu bằng memo khi submit form, lý do là vì khi submit form
	// -> toàn bộ form bị re-render đồng thời useForm được chạy lại và trả về 1 đối tượng mới
	// -> dẫn đến các thuộc tính trong useForm như register, control,..v...v.... bản chất đã bị thay đổi
	// -> dù có tối ưu bằng memo nhưng các component con trong form sử dụng đến các thuộc tính trong useForm dù là từ props hay lấy
	// từ useContextForm đều sẽ bị re-render dù có tối ưu bằng memo.
	const useFormMethods = useForm<ChangePasswordPickedFormData>({
		// -> Chú ý: defaultValues chỉ set giá trị cho các thẻ input trong form trong lần đầu tiên và duy nhất khi component
		// (lần đầu tiên thì biến userProfileQueryData = undefined do mất thời gian để call và get Data từ API, trừ khi là lấy 1 giá trị trong Context có sẵn của App)
		defaultValues: {
			password: "",
			new_password: "",
			confirm_password: "",
		},
		resolver: yupResolver<ChangePasswordPickedFormData>(changePasswordPickedSchema),
	});
	// Đặt phần khai bso useFormMethods dưới useForm
	const {
		handleSubmit,
		// setValue -> kết hợp với useEffect -> khi nào nhận được giá trị của dependency userProfileData -> set các giá trị tương ứng với các thẻ input trong form
		// sử dụng watch kết hợp console log errors trong formState để debug
		// watch để get ra ảnh avatar từ API trả về -> điền vào form -> lấy ra từ form
		formState: { errors: formErrors },
		setError,
		reset,
	} = useFormMethods;

	const appDispatch = useAppDispatch();

	// trạng thái loading
	const updateUserProfileLoadingStatus = useSelector((state: RootState) => state.userProfile.updateUserProfileLoadingStatus);

	// Mutation quản lý tác vụ call API -> update form
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onSubmit = handleSubmit(async (requestData) => {
		await appDispatch(updateCurrentUserProfileThunkAction(omit(requestData, ["confirm_password"])))
			.unwrap()
			.then(() => {
				// reset form
				reset();
			})
			.catch((error) => {
				if (isUnprocessableEntityError<ErrorResponseApi<Omit<FormRulesSchema, "confirm_password">>>(error)) {
					// Bắt lỗi 422 bằng typePredicate
					const formError = error.data.data; // form = {email: string, password: string}
					if (formError) {
						Object.keys(formError).forEach((property) => {
							// setError được sử dụng để lưu thông tin lỗi vào biến errors trong formState. Khi bạn gọi setError, React Hook Form sẽ cập
							// nhật biến errors với thông tin lỗi mới, từ đó bạn có thể hiển thị lỗi lên giao diện người dùng.
							setError(property as keyof ChangePasswordPickedFormData, {
								message: formError[property as keyof Omit<FormRulesSchema, "confirm_password">],
								type: "ServerResponse",
							});
						});
					}
				}
			});
	});

	const { t } = useTranslation("user");

	const passwordPathname = useLocation().pathname;

	const myAccountProfileFields = [
		{
			key: "uniqueKey",
			fieldTitle: t("changePasswordContent.current password"),
			formPropertyName: "password",
			placeHolder: t("changePasswordContent.enter your current password"),
			errorObjectContainer: "password",
			errorMessage: "message",
		},
		{
			key: "uniqueKey",
			fieldTitle: t("changePasswordContent.new password"),
			formPropertyName: "new_password",
			placeHolder: t("changePasswordContent.enter your new password"),
			errorObjectContainer: "new_password",
			errorMessage: "message",
		},
		{
			key: "uniqueKey",
			fieldTitle: t("changePasswordContent.confirm new password"),
			formPropertyName: "confirm_password",
			placeHolder: t("changePasswordContent.confirm your new password"),
			errorObjectContainer: "confirm_password",
			errorMessage: "message",
		},
	];

	return (
		<div className='bg-white min-w-[993px] px-8 pb-[10px] rounded-sm myProfileBoxShadow'>
			<Helmet>
				<title>Thay đổi mật khẩu | Shopee clone</title>
				<meta name='description' content='Chức năng thay đổi mật khẩu - Dự án Shopee clone' />
			</Helmet>
			<ProfileTitle />
			{/* 
        - Sử dụng Context API của React Hook Form cung cấp - useFormContext
        -> chuyển toàn bộ methods = {register, hadnleSubmit, ...v...v.. } lên phạm vi toàn bộ form
        -> tất cả các component con nằm trong form đều có thể truy cập và sử dụng thẳng.
      */}
			<FormProvider {...useFormMethods}>
				<form action='' className='flex pt-[33.33px]' onSubmit={onSubmit}>
					<div className='pr-[100px] basis-[66.66%]'>
						<FormInputFields
							// Chú ý: bug khi form bị re-render -> lạc mất focus thẻ input gây ra do đặt key không thống nhất giữa các lần re-render
							// fields props
							fields={[
								...myAccountProfileFields.map((myAccountProfileField) => {
									const { key, fieldTitle, formPropertyName, placeHolder, errorObjectContainer, errorMessage } = myAccountProfileField;
									return (
										<FormFieldRegister
											key={key as string}
											fieldTitle={fieldTitle as string}
											formPropertyName={formPropertyName as string}
											placeHolder={placeHolder as string}
											errorMessage={
												(formErrors as FieldErrors<ChangePasswordPickedFormData>) &&
												(formErrors as any)[errorObjectContainer as string] &&
												(formErrors as any)[errorObjectContainer as string][errorMessage as string] &&
												(formErrors as any)[errorObjectContainer as string][errorMessage as string]
											}
											pathname={`${passwordPathname}` as string}
										/>
									);
								}),
								<SubmitFormButton
									key={"uniqueKey1" as string}
									changeUserPasswordLoading={updateUserProfileLoadingStatus}
									submitFormButtonTitle={t("content.save")}
								/>,
							]}
						/>
					</div>
				</form>
			</FormProvider>
		</div>
	);
}
