import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function useQueryParams() {
	const [queryParams, setQueryParams] = useState({});
	const [urlSearchParams] = useSearchParams();
	useEffect(() => {
		const result = Object.fromEntries([...urlSearchParams]);
		setQueryParams(result);
	}, [urlSearchParams]);
	// giả sử ta truyền các query params: page =2 và limit = 15 lên url:
	// -> biến urlSearchParams gồm: [["page", "2"], ["limit", "15"]]
	// -> Object.fromEntries([...urlSearchParams]) tương đương Object.fromEntries([ ["page", "2"], ["limit", "15"] ])
	// -> Object.fromEntries([ ["page", "2"], ["limit", "15"] ]) trả về { page: 2, limit: 15 }
	return queryParams;
	// return Object.fromEntries([
	// 	["page", 2],
	// 	["limit", 15],
	// ]);
}
