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
	const queryParams: QueryConfigType = useQueryParams();
	useEffect(() => {
		const queryConfig: QueryConfigType = omitBy(
			{
				page: queryParams.page || "1",
				limit: queryParams.limit || "20",
				order: queryParams.order,
				sort_by: queryParams.sort_by,
				category: queryParams.category, // cụ thể là lấy categoryId
				exclude: queryParams.exclude,
				rating_filter: queryParams.rating_filter,
				price_max: queryParams.price_max,
				price_min: queryParams.price_min,
				name: queryParams.name,
			},
			isUndefined,
		);
		setQueryConfigState(queryConfig);
	}, [queryParams]);
	return queryConfigState;
}
