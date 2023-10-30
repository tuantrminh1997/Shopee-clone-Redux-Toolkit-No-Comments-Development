// imports:
// rect hook:
import { useRef, memo } from "react";
// types
import { InputFileSelectionPropsType } from "src/types";

export default memo(function InputFileSelection({ selectTitle, onChange }: InputFileSelectionPropsType) {
	// Chú ý: 2 flow phổ biến khi upload ảnh:
	// Flow 1: khi nhận upload ảnh -> upload thẳng lên server -> server trả về url ảnh
	//        Nhấn Submit -> gửi url ảnh kèm theo data lên server.
	// Ưu điểm của flow 1: khi nhấn upload ảnh thì có hiệu quả ngay lập tức (nhanh hơn flow 2 1 chút)
	// Nhược điểm của flow 1: do user upload thẳng ảnh lên server được trong khi chưa nhấn lưu (submit) -> dễ gây ra tình trạng spam và để lại rác trên server.

	// Flow 2: khi nhận upload ảnh -> chưa upload thẳng lên server, mới chỉ ở local
	//        Nhấn Submit và thành công -> upload thẳng lên server và tiến hành gọi API updateUserProfileMutateAsync
	//        ->  server trả về success data là có chứa tên bức ảnh (đã được mã hoá)
	// Ưu điểm của flow 2: dù chậm hơn flow 1 1 chút nhưng các thao tác được thực hiện tuần tự, người dùng upload ảnh lên preview mới chỉ ở local, nếu muốn đổi ảnh có thể đổi thoải mái
	//                    vì vẫn chỉ ở local, sau khi thật sự ưng ảnh nào thì mới nhấn submit và đẩy lên server (tránh được cả tình trạng spam và rác trên server).
	// Nhược điểm của flow 2: khi upload lên local xong, nhấn submit -> 2 api được thực thi theo tuần tự: updateUserAvatarApi sau đó submit

	// -> quyết định chọn flow 2, các bước chính:
	// 1. Khai báo mutation quản lý tác vụ call API để update user avatar
	// ref for Input type = file

	// Handle chức năng upload ảnh:
	// local state quản lý file ảnh tải lên từ local
	// const [userAvatar, setUserAvatar] = useState<File>();
	//

	// -> quyết định chọn flow 2, các bước chính:
	// 1. Khai báo mutation quản lý tác vụ call API để update user avatar
	// ref for Input type = file
	const inputTypeFileReference = useRef<HTMLInputElement>(null);

	// Method quản lý chức năng Upload Avatar
	const handleFocusUploadUserAvatarButton = () => {
		inputTypeFileReference.current?.click();
	};

	// Chú ý: method handleSelectFile được kích hoạt từ sự kiện onChange của thẻ input type = file
	const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
		// Do chỉ lấy 1 file duy nhất và event.target.files có thể bị null -> ?.[0]
		const fileFromLocal = event.target.files?.[0];
		// -> Tạo 1 state local quản lý file tải lên:

		onChange && fileFromLocal && onChange(fileFromLocal);
	};

	// Component này cần xuất ra ngoài giá trị của userAvatar -> truyền vào props onChange và truyền
	// giá trị của userAvatar vào.

	// Về vấn đề: giả sử không truyền onChange vào, liệu có thể sử dụng được input type = "file" hay không ?
	// ta vẫn có thể sử dụng bình thường, lý do là vì: inputFile khá đặc biệt, ta thậm chí không cần sử dụng tới
	// useState để quản lý giá trị của local state userAvatar vẫn có thể click vào button tham chiếu tới input file,
	// và sử dụng bình thường.
	return (
		<>
			<button
				className='capitalize border border-[rgba(0,0,0,.09)] text-sm text-[#555555] px-5 rounded-sm py-[9px] profileUploadAvatarButtonBoxShadow'
				type='button'
				// Sự kiện click được kích hoạt -> gọi tới ref fileInputRef.current và click ()
				onClick={handleFocusUploadUserAvatarButton}
			>
				{selectTitle}
			</button>
			<input
				type='file'
				className='hidden'
				ref={inputTypeFileReference}
				// Chú ý: handleSelectFile được kích hoạt tại sự kiện onChange, tức là phải thật sự chọn 2 file ảnh khác nhau hoàn toàn ở 2 thời điểm liền kề nhau thì hàm handleSelectFile
				// mới được sự kiện onChange kích hoạt, nếu không sẽ không kích hoạt method handleSelectFile.
				// -> cách fix để có thể chọn cùng 1 file ảnh ở 2 thời điểm liền kề nhau là thêm onClick => set ngược lại event.target.value = null, không vấn đề gì vì ở đây ta sử dụng
				// event.target.files.
				onChange={(event) => handleSelectFile(event)}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				onClick={(event) => ((event.target as any).value = null)}
			/>
		</>
	);
});
