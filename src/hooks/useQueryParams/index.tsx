import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function useQueryParams() {
	const [queryParams, setQueryParams] = useState({});
	const [urlSearchParams] = useSearchParams();
	useEffect(() => {
		const result = Object.fromEntries([...urlSearchParams]);
		setQueryParams(result);
	}, [urlSearchParams]);
	return queryParams;
}
