/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// react hooks:
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// react hook form:
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// react toastify:
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// i18n
import { useTranslation } from "react-i18next";
// react redux
import { useSelector } from "react-redux";
// lodash
import isEqual from "lodash/isEqual";
// types:
import { UserProfilePickedFormData, SuccessResponseApi, RootState, UpdateUserProfileBodyType, ChangeUserPasswordBodyType } from "src/types";
// custome hooks
import { useAppDispatch } from "src/hooks";
// schemas, utils:
import {
	// Phương thức lấy ra file ảnh phù hợp
	getTruthyImageFileSize,
	getTruthyImageFileExtension,
	getTruthyImageFileType,
	getCurrentFileSizeAsMB,
	userProfilePickedSchema,
	saveUserProfileToLocalStorage,
	getFileExtension,
	getUserAvatarUrl,
} from "src/utils";
// constants:
import { myAccountUploadUserAvatarConstants } from "src/constants";
// private components:
import {
	UploadAvatar,
	// fields
	DateOfBirthSelection,
	UpdateAddress,
	UpdateEmail,
	UpdatePhoneNumber,
} from "./components";
// common components:
import { SubmitFormButton, FormFieldRegister, ProfileTitle, FormInputFields } from "src/components";
import { getCurrentUserPropfileThunkAction, updateCurrentUserAvatarThunkAction, updateCurrentUserProfileThunkAction } from "src/thunkActions";

export default function Profile() {
	// App Context
	// Sau khi submit form
	// -> cập nhật thông tin User thành công  bằng phương thức PUT
	// -> refetch lại user profile bằng userProfileQueryRefetch (phương thức GET)
	const userProfile = useSelector((state: RootState) => state.userProfile.currentUserProfile);
	const appDispatch = useAppDispatch();

	// constants:
	const { userAvatarMaxSizeAsBytes, fileExtension01, fileExtension02 } = myAccountUploadUserAvatarConstants;

	// mutations quản lý bất đồng bộ
	// Query quản lý tác vụ call API -> get thông tin User
	// trạng thái loading của tác vụ get user profile:
	const getUserProfileLoadingStatus = useSelector((state: RootState) => state.userProfile.getUserProfileLoadingStatus);

	// Side Effect quản lý tác vụ call API get user Profile khi component User Profile Mounted
	useEffect(() => {
		const getCurrentUserProfilePromise = appDispatch(getCurrentUserPropfileThunkAction());
		return () => getCurrentUserProfilePromise.abort();
	}, []);
	// -> lấy user Profile từ Slice
	const currentUserProfileFromSlice = useSelector((state: RootState) => state.userProfile.currentUserProfile);
	const userProfileData = useMemo(() => {
		if (currentUserProfileFromSlice) return currentUserProfileFromSlice;
	}, [currentUserProfileFromSlice]);

	// 2. Mutation quản lý tác vụ call API -> update user Profile
	// const [updateUserProfileMutation, { isLoading: updateUserProfileLoading }] = useUpdateUserProfileMutation();
	const updateUserProfileLoading = useSelector((state: RootState) => state.userProfile.updateUserProfileLoadingStatus);

	// 3. Mutation quản lý tác vụ call API -> update user avatar
	const updateUserAvatarLoadingStatus = useSelector((state: RootState) => state.userProfile.updateUserAvatarLoadingStatus);

	// Sử dụng useFormContext: tình huống Form của ta có xu hướng phình to, phức tạp trong tương lai và chứa nhiều component
	// phức tạp, cụ thể ở đây form của chúng ta đã chứa 2 component MyAccountPropsTypes và UploadAvatar
	// -> chú ý: chấp nhận việc các component con mà sử dụng các thuộc tính của đối tượng trả về từ useForm (dù là qua props hay qua FormContext)
	//  sẽ bị re-render dù có tối ưu bằng memo khi submit form, lý do là vì khi submit form
	// -> toàn bộ form bị re-render đồng thời useForm được chạy lại và trả về 1 đối tượng mới
	// -> dẫn đến các thuộc tính trong useForm như register, control,..v...v.... bản chất đã bị thay đổi
	// -> dù có tối ưu bằng memo nhưng các component con trong form sử dụng đến các thuộc tính trong useForm dù là từ props hay lấy
	// từ useContextForm đều sẽ bị re-render dù có tối ưu bằng memo.
	const useFormMethods = useForm<UserProfilePickedFormData>({
		// -> Chú ý: defaultValues chỉ set giá trị cho các thẻ input trong form trong lần đầu tiên và duy nhất khi component
		// (lần đầu tiên thì biến userProfileQueryData = undefined do mất thời gian để call và get Data từ API, trừ khi là lấy 1 giá trị trong Context có sẵn của App)
		defaultValues: {
			name: "",
			address: "",
			avatar: "",
			phone: "",
			// Default date of birth = ngày 1 tháng 1 năm 1990 (tháng 1 truyền vào số 0), API đã hỗ trợ sẵn date_of_birth là string, ISO8601
			// -> nên ta có thể đặt thẳng giá trị của date_of_birth về API vào new Date()
			// date_of_birth: new Date(1990, 1, 1),
			date_of_birth: new Date(1990, 1, 1),
		},
		resolver: yupResolver<UserProfilePickedFormData>(userProfilePickedSchema),
	});

	// Đặt phần khai bso useFormMethods dưới useForm
	const {
		control,
		handleSubmit,
		// setValue -> kết hợp với useEffect -> khi nào nhận được giá trị của dependency userProfileData -> set các giá trị tương ứng với các thẻ input trong form
		setValue,
		// sử dụng watch kết hợp console log errors trong formState để debug
		// watch để get ra ảnh avatar từ API trả về -> điền vào form -> lấy ra từ form
		watch,
		formState: { errors: formErrors },
	} = useFormMethods;

	// Sau khi nhận được dữ liệu userProfileData từ API -> dùng useEffect + setValue (React Hook Form để map các giá trị tương ứng với các thẻ Input trong Form)
	useEffect(() => {
		if (userProfileData) {
			setValue("name", userProfileData.name);
			setValue("phone", userProfileData.phone);
			setValue("address", userProfileData.address);
			setValue("avatar", userProfileData.avatar);
			// date_of_birth không nhận vào prop register nên ta cần handle bằng Controller
			setValue("date_of_birth", userProfileData.date_of_birth ? new Date(userProfileData.date_of_birth) : new Date(1990, 1, 1));
		}
		// chú ý: chỉ thêm 2 dependency userProfileData, setValue(không bao giờ thay đổi giá trị khiến cho callback của useEffect bị gọi lại), nếu cố tình set giá trị defaultValue
		// nào đó ra bên ngoài sẽ gây ra vòng lặp vô hạn -> treo ứng dụng.
	}, [userProfileData, setValue]);

	// Handle chức năng upload ảnh:
	// local state quản lý file ảnh tải lên từ local
	const [userAvatar, setUserAvatar] = useState<File | null>();
	// state local quản lý preview image - ảnh hiển thị ở form chọn ảnh sau khi ta đã chọn xong ảnh từ local và lưu vào biến userAvatar.
	// Chú ý: giá trị của previewAvatar phụ thuộc vào 1 giá trị khác (cụ thể là userAvatar) -> ta hoàn toàn có thể tạo ra 1 biến thay vì phải khai báo hẳn 1 state.
	// nếu chưa có preview image -> lấy ảnh từ trong form ra (vì mặc định trong form chứa các giá trị được get về từ API)
	// -> chú ý ảnh lấy từ form sử dụng watch(), lý do là vì: khi sử dụng function hoặc trigger 1 cái gì đó thì getValue sẽ hiệu quả, còn bình thường muốn render ra ta cứ việc sử dụng
	// watch() trong react hook form
	// const [previewAvatar, setPreviewAvatar] = useState();
	// -> thay vì khai báo hẳn 1 state, ta tạo 1 biến sử dụng useMemo với dependency userAvatar

	const previewAvatar: string = useMemo(
		() => (userAvatar ? URL.createObjectURL(userAvatar) : getUserAvatarUrl(userProfile?.avatar as string)),
		[userAvatar, userProfile?.avatar],
	);

	// giá trị khởi tạo cho biến userProfileFormDataRef khi vừa mounted component Profile
	const initialUserProfileRef = useMemo(() => {
		if (!userProfileData?.name && !userProfileData?.phone && !userProfileData?.address && !userProfileData?.avatar) {
			return {
				// trường hợp user Profile lấy về từ server là tài khoản vừa đăng kí
				// -> userProfileData sẽ thiếu: name, phone, address, avatar, date_of_birth
				// -> return về trường hợp này
				avatar: undefined,
				date_of_birth: userProfileData?.date_of_birth,
			};
		}
		return {
			// còn không, ta sẽ return thẳng về giá trị được map về từ server
			avatar: undefined,
			name: userProfileData.name ? userProfileData.name : undefined,
			phone: userProfileData.phone ? userProfileData.phone : undefined,
			address: userProfileData.address ? userProfileData.address : undefined,
			date_of_birth: userProfileData?.date_of_birth,
		};
		// trường hợp 2: user đã cập nhật ít nhất 1 thông
	}, [userProfileData]);

	const userProfileFormDataRef = useRef<UpdateUserProfileBodyType | ChangeUserPasswordBodyType>(initialUserProfileRef);

	// Method quản lý submit data form
	// Chú ý: Cần khai báo obSubmit = {....} và tiến hành submit form
	// -> react hook form mới lắng nghe được form và ghi nhận errors, nếu không cố tình nhập form gây ra errors trong schema -> object errors vẫn trống
	const onSubmit = handleSubmit(async (formDataSuccessSchemaRules) => {
		// Handle chức năng upload ảnh:
		// Nếu có userAvatar (được chọn từ local)
		let userAvatarTryBlockScope;
		if (userAvatar) {
			// FormData - API của javascript
			const formData = new FormData();
			formData.append("image", userAvatar);
			// response trả về khi success:
			// { data : "05a2f60f-8881-459e-be3f-33d44d58378c.png", message: "Upload ảnh đại diện thành công" }
			// -> API hỗ trợ trả về thông tin bức ảnh là tên file bức ảnh (nguồn gốc tên bức ảnh hiện chưa rõ)
			// -> lấy ra tên bức ảnh và đồng bộ vào trong form:
			// // gán cho biến userAvatarTryBlockScope để có thể sử dụng giá trị mới sau khi gán trong block scope của khối try {}
			// // sau khi upload và submit thành công user avatar -> lưu vào field.value
			await appDispatch(updateCurrentUserAvatarThunkAction(formData))
				.unwrap()
				.then((data) => {
					const userAvatarFileName = (data as SuccessResponseApi<string>).data;
					userAvatarTryBlockScope = userAvatarFileName;
					setValue("avatar", userAvatarTryBlockScope);
					setUserAvatar(null);

					// toast thông báo -> thay đổi user avatar thành công
					const successMessage = data.message;
					toast.success(successMessage, {
						position: "top-center",
						autoClose: 2000,
					});
				});
		}
		const userProfileFormData = {
			...formDataSuccessSchemaRules,
			name: formDataSuccessSchemaRules.name ? formDataSuccessSchemaRules.name : undefined,
			address: formDataSuccessSchemaRules.address ? formDataSuccessSchemaRules.address : undefined,
			phone: formDataSuccessSchemaRules.phone ? formDataSuccessSchemaRules.phone : undefined,
			// ghi đè lại thuộc tính date_of_birth bằng giá trị từ form
			date_of_birth: formDataSuccessSchemaRules?.date_of_birth?.toISOString(),
			// ghi đè lại giá trị user avatar name lấy về từ server:
			avatar: userAvatarTryBlockScope,
		};

		if (isEqual(userProfileFormData, userProfileFormDataRef.current)) {
			// hàm isEqual từ lodash -> so sánh cấu trúc của 2 object bất kể cùng hay khác về tham chiếu
			toast.error("Thông tin trong form chưa được thay đổi, hãy thay đổi trước khi nhấn Lưu để đồng bộ với server", {
				position: "top-right",
				autoClose: 3000,
			});
			return;
		}
		const userProfileAfterSubmit = {
			...userProfileFormData,
			// cố tình set ngược avatar về undefined
			avatar: undefined,
		};
		if (
			!userProfileAfterSubmit.name &&
			!userProfileAfterSubmit.address &&
			!userProfileAfterSubmit.phone &&
			!userProfileAfterSubmit.avatar &&
			// trường hợp vừa đăng kí tài khoản xong, các thông tin khác đang bỏ trống nhưng chỉ thay đổi mỗi avatar
			!userAvatar
		) {
			toast.error("Thông tin trong form đang bị bỏ trống, hãy cập nhật thông tin và nhấn Lưu để đồng bộ với server", {
				position: "top-right",
				autoClose: 3000,
			});
			return;
		}
		userProfileFormDataRef.current = userProfileAfterSubmit;
		await appDispatch(updateCurrentUserProfileThunkAction(userProfileFormData))
			.unwrap()
			.then(async () => {
				const getCurrentUserProfilePromise = await appDispatch(getCurrentUserPropfileThunkAction()).unwrap();
				return getCurrentUserProfilePromise;
			})
			.then((data) => {
				const newUserProfile = data.data;
				saveUserProfileToLocalStorage(newUserProfile);
			});
	});

	// Khởi tạo biến userAvatarFromForm -> truyền sang Component UploadAvatar để lấy dữ liệu avatar từ Form
	const userAvatarFromForm = watch("avatar");

	// Method quản lý chức năng upload avatar từ local lên preview (vẫn ở local):
	const handleSetUserAvatar: (fileFromLocal: File) => void = useCallback(
		(fileFromLocal: File) => {
			// Dữ liệu về định dạng file ảnh được lưu hết trong biến fileFromLocal (object)
			// Thuộc tính size: đơn vị tính đang theo byte -> đổi ra mb, chia cho 1,048,576 hoặc so sánh thẳng với 1 mb = 1,048,576 byte
			// thuộc tính type: "image/png" chứa thông tin về loại file, định dạng file.
			const currentFileSizeAsMB = getCurrentFileSizeAsMB((fileFromLocal as File).size);
			const truthyImageFileSize = getTruthyImageFileSize((fileFromLocal as File).size as number, userAvatarMaxSizeAsBytes as number);
			const fileExtension = getFileExtension((fileFromLocal as File).type);
			const truthyImageFileExtension = getTruthyImageFileExtension(fileExtension as string);
			const truthyImageFileType = getTruthyImageFileType((fileFromLocal as File).type);
			if ((fileFromLocal as File) && (!truthyImageFileSize || !truthyImageFileType)) {
				currentFileSizeAsMB;
				toast.error(
					`Chọn ảnh thất bại, file bạn vừa chọn có dung lượng ${currentFileSizeAsMB}MB là ${
						truthyImageFileSize ? "phù hợp" : "quá lớn"
					}; định dạng .${fileExtension} là ${truthyImageFileExtension ? "phù hợp" : "không phù hợp"}, ${
						truthyImageFileSize && !truthyImageFileExtension
							? `kích thước file đã phù hợp tuy nhiên hãy chọn 1 file đúng định dạng ${fileExtension01}, ${fileExtension02}.`
							: ""
					} ${
						!truthyImageFileSize && truthyImageFileExtension
							? "định dạng file đã phù hợp tuy nhiên hãy chọn 1 file ảnh khác có kích thước nhỏ hơn 1MB."
							: ""
					} ${
						!truthyImageFileSize && !truthyImageFileExtension
							? "cả kích thước file lẫn định dạng file đều không phù hợp, hãy lựa chọn 1 file ảnh khác phù hợp hơn."
							: ""
					}` as string,
					{
						autoClose: 3000,
					},
				);
			} else {
				// setUserAvatar(fileFromLocal as File);
				// Để xuất giá trị state file chọn được từ local ra bên ngoài
				setUserAvatar(fileFromLocal);
				toast.success("Chọn ảnh thành công, nhấn Lưu để tiến hành đồng bộ với Server" as string, {
					autoClose: 2000,
					position: "top-center",
				});
				// -> SAu khi set link file vào biến userAvatarFile, để có thể handle việc điền url file ảnh vào thuộc tính src của thẻ Img
				// -> sử dụng công thức
				// URL.createObjectURL( Đặt dữ liệu thu được khi upload ảnh từ local lên vào đây )
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const { t } = useTranslation("user");

	return (
		<div className='bg-white min-w-[993px] px-8 pb-[10px] rounded-sm myProfileBoxShadow xl:min-w-full'>
			<Helmet>
				<title>Cập nhật thông tin tài khoản | Shopee clone</title>
				<meta name='description' content='Chức năng cập nhật thông tin tài khoản - Dự án Shopee clone' />
			</Helmet>
			<ProfileTitle />
			{/* 
        - Sử dụng Context API của React Hook Form cung cấp - useFormContext
        -> chuyển toàn bộ methods = {register, hadnleSubmit, ...v...v.. } lên phạm vi toàn bộ form
        -> tất cả các component con nằm trong form đều có thể truy cập và sử dụng thẳng.
      */}
			<FormProvider {...useFormMethods}>
				<form action='' className='flex pt-[33.33px] xl:grid xl:grid-cols-1' onSubmit={onSubmit}>
					<div className='pr-[100px] basis-[66.66%] xl:pr-0'>
						<FormInputFields
							// fields props
							fields={[
								<FormFieldRegister
									type={"text"}
									key={"uniqueKey" as string}
									fieldTitle={t("content.username")}
									formPropertyName={"name"}
									placeHolder={"Nhập tên hiển thị..."}
									errorMessage={formErrors?.name?.message as string}
								/>,
								<UpdateEmail
									emailFieldTitle={t("content.email")}
									key={"uniqueKey" as string}
									userProfileDataEmail={userProfileData?.email as string}
								/>,
								<UpdatePhoneNumber phoneNumberFieldTitle={t("content.phone number")} key={"uniqueKey" as string} />,
								<UpdateAddress addressFieldTitle={t("content.address")} key={"uniqueKey" as string} />,
								<Controller
									key={"uniqueKey" as string}
									control={control}
									name='date_of_birth'
									render={({ field }) => (
										<DateOfBirthSelection
											dateOfBirthSelectionFieldTitle={t("content.date of birth")}
											// Chú ý: nếu như truyền theo kiểu viết tắt {...field} -> ta lại cần chuyển component DateOfBirthSelection thành component forwardRef do {...field} yêu cầu cần phải
											// truyền cả ref vào component con - DateOfBirthSelection, nếu không sẽ báo lỗi.
											// Truyền vào errorMessages = lỗi xuất bởi react hook form khi vi phạm rule trong Schema, được lưu trong object errors của formState: {errors}
											errorMessage={formErrors?.date_of_birth?.message as string}
											// Chú ý: field.value trong <DateOfBirthSelection /> sẽ lấy giá trị từ hai nguồn chính:
											// 1. Ban đầu, nó được thiết lập trong useEffect bằng cách sử dụng setValue để đặt giá trị ban đầu từ userProfileData.date_of_birth hoặc mặc định là new Date(1990, 1, 1).
											// 2. Khi người dùng tương tác với DateOfBirthSelection và thay đổi giá trị, field.value sẽ được cập nhật thông qua field.onChange.
											// value = field.value -> truyền giá trị value được set vào bằng setValue
											dateOfBirthValue={field.value}
											// onChange nhận vào giá trị mới và gán lại cho field.value
											onChange={field.onChange}
										/>
									)}
								/>,
								<SubmitFormButton
									key={"uniqueKey" as string}
									userProfileQueryLoading={getUserProfileLoadingStatus} // đã covert -> redux toolkit
									updateUserProfileLoading={updateUserProfileLoading} // đã covert -> redux toolkit
									updateUserAvatarLoading={updateUserAvatarLoadingStatus}
									submitFormButtonTitle={t("content.save")}
								/>,
							]}
						/>
					</div>
					<UploadAvatar
						userAvatarFromForm={userAvatarFromForm}
						previewAvatar={previewAvatar}
						onSetUserAvatar={handleSetUserAvatar as (fileFromLocal: File) => void}
					/>
				</form>
			</FormProvider>
		</div>
	);
}
