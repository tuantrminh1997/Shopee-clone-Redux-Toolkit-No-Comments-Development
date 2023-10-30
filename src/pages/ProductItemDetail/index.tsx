/* eslint-disable @typescript-eslint/no-explicit-any */
// react hooks:
import { useRef, useEffect, useState, useMemo } from "react";
// react redux
import { useSelector } from "react-redux";
// react-router-dom
import { useParams, useNavigate } from "react-router-dom";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// constants:
import { paths, purchaseStatus } from "src/constants";
// html to text:
import { convert } from "html-to-text";
// utils:
import { getIdFromNameId } from "src/utils";
// types:
import { QueryConfigType, RootState } from "src/types";
// private components:
import {
	ProductItemInformation,
	ProductItemImages,
	BreadCrum,
	RelatedInformations,
	SkeletonLoadingProductInformation,
	SkeletonLoadingRelatedInformations,
} from "./components";
// custome hooks
import { useAppDispatch } from "src/hooks";
// thunk actions
import {
	getSimilarSoldByProductListThunkAction,
	getSimilarProductListThunkAction,
	getProductItemDetailThunkAction,
	addProductItemToCartThunkAction,
	getPurchaseListInCartThunkAction,
} from "src/thunkActions";

export default function ProductItemDetail() {
	// constants:
	const { cart: cartUrl } = paths;
	// navigate
	const navigate = useNavigate();

	const { itemNameId } = useParams();

	// Dùng function getIdFromNameId ta khai báo tại src/utils -> lấy ra chuỗi Id nằm trong đoạn mã tổng hợp của cả name và id
	const idFromNameId = getIdFromNameId(itemNameId as string);
	const appDispatch = useAppDispatch();

	// thực hiện tác vụ call API -> Lấy thông tin chi tiết sản phẩm khi Component Mounted
	useEffect(() => {
		const getProductItemDetailPromise = appDispatch(getProductItemDetailThunkAction(idFromNameId));
		return () => getProductItemDetailPromise.abort();
	}, [appDispatch, idFromNameId]);
	const productItemDetailFromReducer = useSelector((state: RootState) => state.productItemDetail.productItemDetail);
	const productItemDetail = useMemo(() => {
		if (productItemDetailFromReducer) return productItemDetailFromReducer;
	}, [productItemDetailFromReducer]);

	// lưu giữ giá trị trước đó của ảnh đại diện sản phẩm
	const previousProductItemImage = useRef<string | null>(null);

	// previousProductItemImage.current = trỏ đến giá trị trước đó sau khi component được re-render và trả về tham chiếu mới
	const productItemImage = useMemo(() => {
		if (productItemDetail && productItemDetail.image !== previousProductItemImage.current) {
			previousProductItemImage.current = productItemDetail.image;
			return productItemDetail.image;
		}
	}, [productItemDetail]);
	const forwardProductImage = useMemo(() => {
		if (!productItemImage && previousProductItemImage.current) return previousProductItemImage.current;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productItemImage, productItemDetail]);

	// trạng thái loading của get product item detail
	const productItemDetailLoading = useSelector((state: RootState) => state.productItemDetail.productItemDetailLoading);

	// Handle chức năng get Item theo CategoryId === Items cùng thể loại
	const productItemCategoryId: string | undefined = useMemo(() => productItemDetail?.category._id, [productItemDetail]);

	// Handle chức năng get Item theo CategoryId === Items cùng thể loại
	const queryConfigOverrideCategory: QueryConfigType = useMemo(
		() => ({ page: "1", limit: "20", category: productItemCategoryId }),
		[productItemCategoryId],
	);

	// Handle chức năng get Item theo CategoryId và bán chạy === Items cùng thể loại
	const queryConfigOverrideCategorySoldBy: QueryConfigType = useMemo(
		() => ({ page: "1", limit: "20", category: productItemCategoryId, sort_by: "sold" }),
		[productItemCategoryId],
	);

	useEffect(() => {
		const getSimilarProductListPromise = appDispatch(getSimilarProductListThunkAction(queryConfigOverrideCategory));
		return () => getSimilarProductListPromise.abort();
	}, [appDispatch, queryConfigOverrideCategory]);
	const similarProductListFromReducer = useSelector((state: RootState) => state.productItemDetail.similarProductList);
	const similarProductList = useMemo(() => {
		if (similarProductListFromReducer) return similarProductListFromReducer;
	}, [similarProductListFromReducer]);

	// Query quản lý chức năng getItems cùng CategoryId, sold_by = sold (bán chạy)
	useEffect(() => {
		const getSimilarSoldByProductListPromise = appDispatch(getSimilarSoldByProductListThunkAction(queryConfigOverrideCategorySoldBy));
		return () => getSimilarSoldByProductListPromise.abort();
	}, [appDispatch, queryConfigOverrideCategorySoldBy]);
	const similarSoldByProductListFromReducer = useSelector((state: RootState) => state.productItemDetail.similarSoldByProductList);
	const similarSoldByProductList = useMemo(() => {
		if (similarSoldByProductListFromReducer) return similarSoldByProductListFromReducer;
	}, [similarSoldByProductListFromReducer]);

	// quản lý số lượng mua tại component này, thông qua state buyCount
	const [numberOfProducts, setNumberOfProducts] = useState<number>(1);
	const handleSetNumberOfProducts: (value: number) => void = (value: number) => {
		setNumberOfProducts(value);
	};
	// constants:
	const { inCart } = purchaseStatus;
	// Method quản lý chức năng thêm sản phẩm vào giỏ hàng:
	const handleAddToCart = async () => {
		await appDispatch(
			addProductItemToCartThunkAction({
				product_id: productItemDetail?._id as string,
				buy_count: numberOfProducts,
			}),
		).then(() => {
			appDispatch(getPurchaseListInCartThunkAction({ status: inCart }));
		});
	};

	// Method handle chức năng Mua Ngay
	const handleBuyNow = async () => {
		appDispatch(
			addProductItemToCartThunkAction({
				product_id: productItemDetail?._id as string,
				buy_count: numberOfProducts,
			}),
		)
			.unwrap()
			.then((data) => {
				const purchaseProductItemId = data.data._id;
				navigate(cartUrl, {
					state: {
						purchaseProductItemId,
					},
				});
			});
	};

	return (
		<div className={`flex flex-col items-center justify-between my-5 w-[1200px] ${!productItemDetail ? "min-h-[1000px]" : ""} lg:h-fit xl:w-screen`}>
			{productItemDetail && (
				<Helmet>
					<title>{productItemDetail.name as string} | Shopee clone</title>
					<meta
						name='description'
						content={
							`${convert(productItemDetail.description as string, {
								wordwrap: 120,
							})}` as string
						}
					/>
				</Helmet>
			)}
			{productItemDetail && (
				<BreadCrum
					productItemName={productItemDetail.name as string}
					productItemCategory={productItemDetail.category.name as string}
					categoryId={productItemDetail.category._id as string}
				/>
			)}
			{productItemDetailLoading && <SkeletonLoadingProductInformation />}
			{productItemDetail && !productItemDetailLoading && (
				<div className='flex justify-between w-full bg-white rounded-sm lg:flex-col'>
					<ProductItemImages
						productItemDetailDatasImage={forwardProductImage as string}
						productItemDetailDatasImages={productItemDetail.images}
						productItemName={productItemDetail.name as string}
					/>
					<ProductItemInformation
						productItemDetailData={productItemDetail}
						setNumberOfProducts={setNumberOfProducts}
						handleSetNumberOfProducts={handleSetNumberOfProducts}
						numberOfProducts={numberOfProducts}
						handleAddToCart={handleAddToCart}
						handleBuyNow={handleBuyNow}
						itemNameId={itemNameId as string}
					/>
				</div>
			)}
			{!similarProductList && <SkeletonLoadingRelatedInformations />}
			{similarProductList && similarSoldByProductList && productItemDetail && (
				<RelatedInformations
					similarProductList={similarProductList}
					productItemDescription={productItemDetail.description}
					similarSoldByProductList={similarSoldByProductList}
				/>
			)}
		</div>
	);
}
