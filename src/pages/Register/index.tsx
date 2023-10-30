// libraries
// react hooks:
import { useMemo, useState } from "react";
// react redux
import { useDispatch, useSelector } from "react-redux";
// yup:
import { yupResolver } from "@hookform/resolvers/yup";
// react toastify
import { toast } from "react-toastify";
// react hook form:
import { useForm } from "react-hook-form";
// react-router-dom:
import { Link, useLocation, useNavigate } from "react-router-dom";
// lodash:
import omit from "lodash/omit";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// i18n
import { useTranslation } from "react-i18next";
// types:
import { ErrorResponseApi, FormRulesSchema, RootState } from "src/types";
// constants
import { paths } from "src/constants";
// form rules:
import { formRulesSchema, isUnprocessableEntityError } from "src/utils";
// actions
import { setIsLoggedInAction } from "src/slices/authenticationSlice";
import { setCurrentUserProfileAction } from "src/slices/userProfileSlice";
// thunk actions:
import { registerThunkAction } from "src/thunkActions";
// RTK Query hooks
// common components:
import { Input, Button } from "src/components";
import { useAppDispatch } from "src/hooks";

export default function Register() {
	// App Context:
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const appDispatch = useAppDispatch();
	// data trong callback của handleSubmit sẽ có type = FormData
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<FormRulesSchema>({
		resolver: yupResolver(formRulesSchema),
	});
	/**
	 * Sử dụng hàm getFormRules return về kiểu FormRules ta đã định nghĩa
	 * -> mục đích để có thể truyền hàm getValues vào, thay vì phải sử dụng spread operator
	 */
	// const formRules = getFormRules(getValues);
	/**
	 * -> Chuyển sang dùng Schema
	 */

	// React Query + Apis: Quản lý chức năng call API
	// Mutation quản lý chức năng Register
	// trạng thái loading khi register
	const authenticationLoading = useSelector((state: RootState) => state.authentication.authenticationLoading);

	// Method quản lý chức năng submit form
	// handleSubmit: (onValid: SubmitHandler<FormData>, onInvalid?: SubmitErrorHandler<FormData> | undefined)
	const onsubmit = handleSubmit(
		// const {mutate} = registerAccountMutation;
		// callback được truyền vào tham số thứ 1 của handleSubmit được gọi khi form đúng (nhập đầy đủ input, đúng định dạng từng
		// input, ko có errors)
		async (requestData) => {
			/**
			 * Chú ý: đối với tác vụ submit form, gửi data form lên server, nên đặt tên biến kiểu snake_case, vì đã số server sẽ sử dụng tên biến
			 * kiểu snake_case -> ta đặt tên biến trong form data kiểu snake_case luôn cho tiện.
			 */
			// Ngắt thuộc tính confirm_password của data bằng lodash:
			const registerData = omit(requestData, ["confirm_password"]);
			/**
       * Nếu dữ liệu hợp lệ theo schema validation (do Yup thực hiện), callback trong handleSubmit được gọi với đối số là data, chứa 
       * dữ liệu đã nhập từ form.
        -> Biến registerData được tạo để lưu trữ dữ liệu form (loại bỏ confirm_password).
        -> Hàm mutate của registerAccountMutation được gọi với registerData như là tham số đầu tiên.
       */

			// Chú ý: nếu không unwrap -> không thể chạy xuống hàm catch()
			await appDispatch(registerThunkAction(registerData))
				.unwrap()
				.then((data) => {
					// sau khi register thành công
					// 1. set isLogeedIn thành true
					dispatch(setIsLoggedInAction(true));
					// 2. trích xuất user profile từ then data và lưu vào userProfileSlice
					const currentUserProfile = data.data?.user;
					dispatch(setCurrentUserProfileAction(currentUserProfile));
					// 3. toast thông báo lên
					const successMessage = data.message;
					toast.success(successMessage, {
						position: "top-center",
						autoClose: 2000,
					});
					// 4. điều hướng sang trang Product List
					navigate("/");
				})
				.catch((error) => {
					if (isUnprocessableEntityError<ErrorResponseApi<Omit<FormRulesSchema, "confirm_password">>>(error)) {
						// Bắt lỗi 422 bằng typePredicate
						const formError = error.data.data; // form = {email: string, password: string}
						if (formError) {
							Object.keys(formError).forEach((property) => {
								// setError được sử dụng để lưu thông tin lỗi vào biến errors trong formState. Khi bạn gọi setError, React Hook Form sẽ cập
								// nhật biến errors với thông tin lỗi mới, từ đó bạn có thể hiển thị lỗi lên giao diện người dùng.
								setError(property as keyof Omit<FormRulesSchema, "confirm_password">, {
									message: formError[property as keyof Omit<FormRulesSchema, "confirm_password">],
									type: "ServerResponse",
								});
							});
						}
					}
				});
		},
	);

	const { t } = useTranslation("loginRegister");
	const { register: registerPath } = paths;
	const pathname = useLocation().pathname;
	const { changePassword } = paths;

	// state quản lý trạng thái show/hive icon Eye:
	const [openEyeIconMode, setOpenEyeIconMode] = useState<boolean>(false);
	const handleToggleShowPassword: (openEyeIconMode: boolean) => void = (openEyeIconMode: boolean) => {
		setOpenEyeIconMode(openEyeIconMode);
	};
	const inputType = useMemo(() => (openEyeIconMode ? "text" : "password"), [openEyeIconMode]);

	return (
		<div className='bg-orange'>
			<Helmet>
				<title>Đăng ký tài khoản | Shopee clone</title>
				<meta name='description' content='Chức năng đăng ký tài khoản - Dự án Shopee clone' />
			</Helmet>
			<div className='container'>
				<div className='grid grid-cols-5 pr-10 lg:pl-10 py-32 lg:py-12 lowMobile:px-[2px]'>
					<div className='col-start-4 col-span-2 lg:col-start-1 lg:col-span-5 '>
						<form className='p-10 rouned bg-white shadow-sm' onSubmit={onsubmit} noValidate>
							<div className='text-2xl capitalize'>{t("register.register")}</div>
							{/* 
                * Chú ý: register("email") sẽ trả về thuộc tính name
                -> cụ thể: ctrl + click chuột register -> để xem chi tiết cách định nghĩa thuộc tính register trong object trả về 
                của useForm().
                -> thuộc tính register có type UseFormRegister<TFieldValues>
                -> type UseFormRegister<TFieldValues> được định nghĩa là 1 function, return về dữ liệu có type
                là UseFormRegisterReturn<TFieldName>;
                -> kiểu UseFormRegister<TFieldValues> được định nghĩa gồm các thuộc tính:
                */
							/**
                 * onChange: ChangeHandler;
                  onBlur: ChangeHandler;
                  ref: RefCallBack;
                  name: TFieldName;
                  min?: string | number;
                  max?: string | number;
                  maxLength?: number;
                  minLength?: number;
                  pattern?: string;
                  required?: boolean;
                  disabled?: boolean;
                */
							/**
                -> register() trả về 1 object có các thuộc tính email, giá trị = value thanh input.
                function register() nhận vào tham số thứ 2 là 1 object, handle việc validate form
                Sử dụng Register with validation and error message, xem thêm tại trang chủ React Hook Form
                pattern email:

                Chú ý: việc validate các rules trực tiếp sẽ gây rườm rà, trường hợp tổng quát khi ta có nhiều rules, sẽ càng rườm
                rà
                -> ý tưởng là khai báo 1 biến để kế thừa các rules lại.
                Định nghĩa type cho formRules, formRules được truyền vào dưới dạng đối số thứ 2 của hàm register -> tra cứu type của tham
                số thứ 2 của hàm register -> ctrl + click chuột
              */}
							<Input
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"}
								type='email'
								placeholder={t("register.email")}
								register={register}
								formPropertyName='email'
								/**
								 * Sử dụng rule từ schema -> ko cần truyền formRules nữa
								 */
								errorMessage={errors.email?.message}
							/>
							<Input
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"}
								// type='password'
								autoComplete='on'
								placeholder={t("register.password")}
								register={register}
								formPropertyName='password'
								errorMessage={errors.password?.message}
								handleToggleShowPassword={handleToggleShowPassword as (openEyeIconMode: boolean) => void}
								type={(pathname === registerPath ? inputType : "password") as string}
								pathname={changePassword}
							/>
							<Input
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"}
								// type=
								autoComplete='on'
								placeholder={t("register.confirm password")}
								register={register}
								formPropertyName='confirm_password'
								errorMessage={errors.confirm_password?.message}
								handleToggleShowPassword={handleToggleShowPassword}
								type={pathname === registerPath ? inputType : "password"}
								pathname={changePassword}
							/>
							<div className='mt-3'>
								<Button
									className='w-full text-center py-4 px-2 uppercase bg-red-500 text-white text-sm hover:bg-red-600 flex items-center justify-center'
									// prop isLoading, disabled được truyền khi mutation đang loading và đợi server trả response về.
									isLoading={authenticationLoading}
									disabled={authenticationLoading}
								>
									{t("register.submit")}
								</Button>
							</div>
							<div className='flex items-center justify-center mt-8 lowerMobile:flex-col'>
								<span className='text-gray-500 lowerMobile:mb-3'>{t("register.do you already have an account ?")}</span>
								<Link className='text-red-700 ml-1 capitalize' to='/login'>
									{t("register.login")}
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
