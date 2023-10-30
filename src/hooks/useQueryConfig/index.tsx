// lodash:
import omitBy from "lodash/omitBy";
import isUndefined from "lodash/isUndefined";
// react hooks
import { useEffect, useState } from "react";
// types
import { QueryConfigType } from "src/types";
// custome hooks
import { useQueryParams } from "src/hooks";

export default function useQueryConfig() {
	const [queryConfigState, setQueryConfigState] = useState<QueryConfigType>({ page: "1", limit: "20" });
	// custome hook trả về object queryConfig: chứa các cặp thuộc tính/giá trị là các query params lấy được từ url
	// const productListQueryParams: QueryConfigType = useQueryParams();
	// const [searchParams] = useSearchParams();
	const queryParams: QueryConfigType = useQueryParams();
	useEffect(() => {
		const queryConfig: QueryConfigType = omitBy(
			{
				// lấy ra các giá trị query params trong object productListQueryParams
				page: queryParams.page || "1",
				limit: queryParams.limit || "20",
				order: queryParams.order,
				sort_by: queryParams.sort_by,
				category: queryParams.category, // cụ thể là lấy categoryId
				exclude: queryParams.exclude,
				rating_filter: queryParams.rating_filter,
				price_max: queryParams.price_max,
				price_min: queryParams.price_min,
				// ghi đè vào object queryConfig khi thực hiện chức năng tìm kiếm sản phẩm
				name: queryParams.name,
			},
			isUndefined,
		);
		setQueryConfigState(queryConfig);
		// dependency queryParams là kết quả được trả về từ custome hook useQueryParams ta cần cho return về giá trị được lưu trong useState (kết hợp với useEffect)
		// -> để tránh việc queryParams được trả về với 1 tham chiếu khác hoàn toàn dù giá trị bên trong giống hệt giá trị với tham chiếu cũ.
		// -> fix bug useEffect gọi callback vô hạn lần.
	}, [queryParams]);
	// chú ý: type QueryConfigType có phần lớn thuộc tính ?, nên có thể bị undefined -> ta muốn loại bớt các thuộc tính có giá trị  = undefined trong object
	// queryConfig -> dùng omitBy và isUndefined từ thư viện lodash.
	// const queryConfig: QueryConfigType = omitBy(
	// 	{
	// 		// lấy ra các giá trị query params trong object productListQueryParams
	// 		page: productListQueryParams.page || "1",
	// 		limit: productListQueryParams.limit || "20",
	// 		order: productListQueryParams.order,
	// 		sort_by: productListQueryParams.sort_by,
	// 		category: productListQueryParams.category, // cụ thể là lấy categoryId
	// 		exclude: productListQueryParams.exclude,
	// 		rating_filter: productListQueryParams.rating_filter,
	// 		price_max: productListQueryParams.price_max,
	// 		price_min: productListQueryParams.price_min,
	// 		// ghi đè vào object queryConfig khi thực hiện chức năng tìm kiếm sản phẩm
	// 		name: productListQueryParams.name,
	// 	},
	// 	isUndefined,
	// );
	// return queryConfig;
	return queryConfigState;
}

// Tạo 1 state và lưu giá trị queryConfig vào đó
// -> cho custome hook trả về giá trị của state do custome hook đó quản lý
// -> ngăn chặn việc tạo ra 1 tham chiếu khác hoàn toàn với queryConfig trước đó.
// -> useEffect sẽ nhận diện 2 dependency khác nhau về tham chiếu -> gây ra bug gọi callback vô hạn lần
