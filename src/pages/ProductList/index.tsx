// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// types
import { RootState } from "src/types";
// react hooks
import { useEffect, useMemo } from "react";
// react redux
import { useSelector } from "react-redux";
// custome hooks
import { useQueryConfig, useAppDispatch } from "src/hooks";
// thunk actions
import { getCategoriesThunkAction, getProductListThunkAction } from "src/thunkActions";
// common components:
import { ProductItem } from "src/components";
// private components:
import { SkeletonLoadingProductItem, Pagination, Sort, AsideFilter } from "./components";
import { createSearchParams, useNavigate } from "react-router-dom";
import { paths } from "src/constants";

export default function ProductList() {
	const queryConfig = useQueryConfig();
	const navigate = useNavigate();

	// app dispatch để dispatch thunk actions
	const appDispatch = useAppDispatch();

	// lấy dữ liệu product list từ Slice
	const productListFromSlice = useSelector((state: RootState) => state.productList.productList);
	const categoriesFromSlice = useSelector((state: RootState) => state.productList.categories);
	const pagination = useSelector((state: RootState) => state.productList.pagination);
	const productListLoadingStatus = useSelector((state: RootState) => state.productList.isLoading);

	// tổng số trang:
	const totalPage: number = pagination.page_size;

	// Biến quản lý trạng thái quay về trang đầu tiên khi currentPage > totalPage
	const toFirstPage = useMemo(() => Number(queryConfig.page) > (totalPage as number), [queryConfig.page, totalPage]);

	// Handle bug: khi số trang hiện tại > total Page -> vẫn ở trang hiện tại
	useEffect(() => {
		if (toFirstPage) {
			const newSearchParams = createSearchParams({
				...queryConfig,
				page: "1",
			}).toString();
			navigate(`${paths.defaultPath}?${newSearchParams}`);
		}
	}, [navigate, toFirstPage, queryConfig]);

	// Product List và Categories lấy từ Slice
	const productList = useMemo(() => productListFromSlice, [productListFromSlice]);
	const categories = useMemo(() => categoriesFromSlice, [categoriesFromSlice]);

	// Side effect quản lý tác vụ dispatch Thunk Action -> call API get Product List
	useEffect(() => {
		const getProductListPromise = appDispatch(getProductListThunkAction(queryConfig));
		return () => getProductListPromise.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appDispatch, queryConfig]);

	// Side effect quản lý tác vụ dispatch Thunk Action -> call API get Categories
	useEffect(() => {
		const getCategoriesPromise = appDispatch(getCategoriesThunkAction());
		return () => getCategoriesPromise.abort();
	}, [appDispatch]);

	return (
		<div className={`flex w-[1200px] ${!productList ? "min-h-1000px" : ""}`}>
			<Helmet>
				<title>Trang chủ | Shopee clone</title>
				<meta name='description' content='Trang chủ - Dự án Shopee clone' />
			</Helmet>
			<AsideFilter categoriesData={categories} queryConfig={queryConfig} />
			<div className={`flex flex-col justify-start ${!productList ? "h-full" : ""}`}>
				{productListLoadingStatus && (
					<div className='flex flex-wrap mt-2 w-[1000px] min-h-[800px] pb-10'>
						{Array(Number(queryConfig.limit))
							.fill(undefined)
							.map((_, index) => (
								<SkeletonLoadingProductItem key={index} />
							))}
					</div>
				)}
				{!productList && (
					<div className='flex flex-wrap mt-2 w-[1000px] min-h-[800px] pb-10'>
						{Array(Number(queryConfig.limit))
							.fill(undefined)
							.map((_, index) => (
								<SkeletonLoadingProductItem key={index} />
							))}
					</div>
				)}
				{productList && !productListLoadingStatus && (
					<>
						<Sort queryConfig={queryConfig} totalPage={totalPage} categoriesData={categories} />
						<div className='grid grid-cols-5 gap-2 xl:grid-cols-4 lg:grid-cols-2 sm:grid-cols-2 mt-2 pb-10 lowMobile:grid-cols-1'>
							{productList.map((product) => (
								<ProductItem key={product._id} product={product} />
							))}
						</div>
						<Pagination queryConfig={queryConfig} totalPage={totalPage} />
					</>
				)}
			</div>
		</div>
	);
}
