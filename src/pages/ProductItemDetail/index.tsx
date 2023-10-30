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
	// chú ý: handle bug gây ra do ta cố tình thêm ký tự . lên thanh url, đó là lỗi do vitejs gây ra (enter page ProductItem
	// bình thường, nhưng khi reload -> page bị lỗi)
	// -> handle bằng cách rất đơn giản: shopee sử dụng -i. ta thay bằng -i, hoặc -i;
	// Khai báo query thực hiện tác vụ callApi và lưu vào cached khi Component ProductItemDetail được mounted:
	const appDispatch = useAppDispatch();

	// thực hiện tác vụ call API -> Lấy thông tin chi tiết sản phẩm khi Component Mounted
	useEffect(() => {
		const getProductItemDetailPromise = appDispatch(getProductItemDetailThunkAction(idFromNameId));
		// sau khi cố tình reject đi lần gọi API đầu tiên -> chỉ fulfilled 1 lần goi API sau cùng
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
			// gán giá trị productItemDetail.image cho biến previousProductItemImage.current để lưu giữ lại giá trị này, sử dụng nó để
			// tiếp tục so sánh sau khi component re-render thêm mới
			previousProductItemImage.current = productItemDetail.image;
			return productItemDetail.image;
		}
	}, [productItemDetail]);
	// forwardProductImage là giá trị ảnh thật sự được truyền sang cho component ProductItemImages
	// Giải thích: lần đầu component được mounted -> productItemImage được gán giá trị đúng bằng productItemDetail.image, nhưng do component bị re-render do đăng ký useSelector
	// với reducer -> previousProductItemImage.current lúc này được lưu bằng giá trị ảnh trước đó, dẫn đến không thoả mãn điều kiện productItemDetail.image !== previousProductItemImage.current
	// -> productItemImage không được trả về giá trị và bị undefined
	// -> handle bằng cách tạo thêm 1 biến forwardProductImage (biến thật sự được truyền sang cho ProductItemImages), biến này sẽ kiểm tra nếu productItemImage bị undefined
	// đồng thời previousProductItemImage.current đang có giá trị truthy (giá trị truthy vì nó đã được gán giá trị từ lần mounted của compopnent trước đó)
	// -> return về previousProductItemImage.current
	const forwardProductImage = useMemo(() => {
		if (!productItemImage && previousProductItemImage.current) return previousProductItemImage.current;
		// trong trường hợp cố tình reload lại page Product Item Detail, do lúc này previousProductItemImage được set về giá trị ban đầu là null
		// -> ta return về productItemDetail?.image vì yên tâm rằng lúc này productItemDetail?.image đã là đúng ảnh ta cần
		// return productItemDetail?.image;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productItemImage, productItemDetail]);

	// trạng thái loading của get product item detail
	const productItemDetailLoading = useSelector((state: RootState) => state.productItemDetail.productItemDetailLoading);

	// const productItemDetailData: ProductItemSuccessResponse | undefined = useMemo(() => productItemDetailQueryData?.data, [productItemDetailQueryData]);
	// Handle chức năng hiển thị các sản phẩm liên quan
	// -> get ProductItem Response API -> trong khối dữ liệu thu được có category._id -> filter theo category._id đó
	// -> navigate của chức năng filter theo category:
	// {{
	//   Muốn filter theo category -> ghi đè thuộc tính catergory trong object queryConfig bằng category id
	//   Nhắc lại về nguyên lý hoạt động chỗ này: khi click -> bắn đoạn url có dạng pathname?[Lấy các cặp key/value trong object nhận vào và trả về các cặp
	//   queryParams và giá trị của chúng.
	//   pathname: paths.defaultPath,
	//   search: createSearchParams({
	//     ...queryConfig,
	//     category: categoryItem._id,
	//   }).toString(),
	// }}

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

	// Querry quản lý chức năng get Items cùng CategoryId
	// -> gọi tới API getProductListApi
	// const { data: similarProductListQueryData } = useQuery({
	// Nhắc lại kiến thức về staleTime, query Data:
	// - Một data mà đã `stale` thì khi gọi lại query của data đó, nó sẽ fetch lại api. Nếu không `stale` thì không fetch lại api (đối với trường hợp `staleTime` giữa các
	// lần giống nhau)
	// > Còn đối với trường hợp `staleTime` giữa 2 lần khác nhau thì nếu data của lần query thứ 1 xuất hiện lâu hơn thời gian `staleTime` của lần query thứ 2 thì nó sẽ bị \
	// gọi lại ở lần thứ 2, dù cho có stale hay chưa.
	// > Ví dụ: `useQuery({ queryKey: ['todos'], queryFn: fetchTodos, staleTime: 10*1000 })` xuất hiện 5s trước, bây giờ chúng ta gọi lại `useQuery({ queryKey: ['todos'],
	// queryFn: fetchTodos, staleTime: 2*1000 })` thì rõ ràng cái data của lần 1 dù nó chưa được cho là stale nhưng nó xuất hiện 5s trước và lâu hơn thời gian staleTime là
	// 2s nên nó sẽ bị gọi lại ở lần 2.
	// - Một data mà bị xóa khỏi bộ nhớ (tức là quá thời gian `cacheTime`) thì khi gọi lại query của data đó, nó sẽ fetch lại api. Nếu còn chưa bị xóa khỏi bộ nhớ nhưng đã `stale` thì nó sẽ trả về data cached và fetch api ngầm, sau khi fetch xong nó sẽ update lại data cached và trả về data mới cho bạn.
	// Caching là một vòng đời của:
	// + Query Instance có hoặc không cache data
	// + Fetch ngầm (background fetching)
	// + Các inactive query
	// + Xóa cache khỏi bộ nhớ (Garbage Collection)

	// ta set query key trùng với queryKey của query Get Produtc List Default, đồng thời set stale time cho 2 bên bằng nhau (tại queryKey của ProductList và queryKey
	// của similarProductListQueryData, mục đích để:
	// 1. truy cập vào cùng 1 khối dữ liệu trong bộ nhớ cached.
	// 2. sau khi mounted component ProductList -> truy cập vào khối dữ liệu ProductList, data được get về và bắt đầu tính staleTime
	// -> sau khi ta truy cập vào ProductItem Detail, component RelatedInformations được mounted -> SimilarProductList được mounted -> data của lần get trước có thời gian
	// xuất hiện vẫn < stale time của lần query thứ 2 -> không bị gọi lại API để cập nhật ProductList
	// queryKey: ["product_list_same_category", queryConfigOverrideCategory],
	// queryFn: () => getProductListApi(queryConfigOverrideCategory),
	// -> ta sẽ thấy fetching API 2 lần, lý do vì khi component được mounted lần 1 -> productItemQueryData được bị undefined
	// và productItemCategoryId bị undefined
	// -> lần sau productItemCategoryId được cập nhật -> queryConfig được cập nhật -> query được gọi lần 2
	// -> fix bằng cách thêm enabled = Boolean(productItemCategoryId) -> query chỉ được gọi khi productItemCategoryId có data
	// staleTime: 3 * 60 * 1000,
	// enabled: Boolean(productItemCategoryId),
	// -> ta set chung stale Time ở 2 chỗ = 3 phút  = 3 x 60 x 1000
	// });
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
		// Cần phải cập nhật lại dữ liệu trong cached, cụ thể là khối dữ liệu quản lý các sản phẩm trong Cart lấy về từ server, lý do là vì:
		// React Query không tự động nhận ra và cập nhật dữ liệu trong cached khi dữ liệu thay đổi. Có một số cách để đảm bảo rằng dữ liệu được cập nhật đúng lúc:
		// 1. Sử dụng staleTime: Bằng cách thiết lập staleTime trong useQuery, bạn có thể chỉ định thời gian sau khi mà dữ liệu sẽ được xem là stale (không còn hợp lệ). Khi thời gian
		// này kết thúc, React Query sẽ thực hiện một request mới để cập nhật dữ liệu.
		// 2. Thông báo cập nhật bằng cách thủ công: Bạn có thể sử dụng hàm queryClient.invalidateQueries để thông báo cho React Query cập nhật dữ liệu một cách thủ công. Điều này
		// đặc biệt hữu ích khi bạn biết rằng dữ liệu đã thay đổi (như trong trường hợp thêm sản phẩm vào giỏ hàng như bạn đã nêu).
		// 3. Khi component được mounted lại: Khi một component bị unmounted và sau đó được mounted lại, React Query sẽ thực hiện một request mới để cập nhật dữ liệu (tùy thuộc vào
		// các điều kiện như staleTime, cacheTime,...). (Đồng thời staleTime sẽ được reset và tính lại từ đầu)
		// -> sử dụng cách 2 để cập nhật lại dữ liệu.
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
	// -> Bài toán Chia sẻ State giữa 2 Route khác nhau: sử dụng useNavigate tại ProductItemDetail để định nghĩa state
	// -> tại Cart sử dụng useLocation để nhận state đó.
	const handleBuyNow = async () => {
		// const response = await addProductItemToCartMutation({
		// 	product_id: productItemDetail?._id as string,
		// 	buy_count: numberOfProducts,
		// });

		// - ProductItem = hàng hóa trước khi được add vào giỏ hàng
		// - PurchaseProductItem = Hàng hóa sau khi được add vào giỏ hàng, có thuộc tính _id mới, dữ liệu nguyên bản được đóng gói trong
		// thuộc tính product
		// -> Chia sẻ id của PurchaseItemDetail sang Route Cart

		appDispatch(
			addProductItemToCartThunkAction({
				product_id: productItemDetail?._id as string,
				buy_count: numberOfProducts,
			}),
		)
			.unwrap()
			.then((data) => {
				const purchaseProductItemId = data.data._id;
				// lập tức navigate sang trang Cart
				// -> truyền id của purchase Item (thuộc tính _id mới được sinh và nằm ngoài cùng, _id của product item nằm trong thuộc tính product) sang trang Cart
				// -> tại component Cart nhận id này bằng location = useLocation()
				// -> nhận được id và xử lý tự động check sẵn sản phẩm cần mua ngay
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
					{/*
		      - Đối với các dự án thực tế được quan tâm về SEO -> ta sẽ được cấp 1 description riêng cho chỗ này
		      - ta sử dụng description nằm trong API mô tả sản phẩm luôn, tuy nhiên thì nó đang là 1 read text -> nếu đưa thẳng vào productItemDetailData?.description
		      -> sẽ sinh ra 1 đoạn text lẫn lộn các thẻ p vào nhìn rất xấu -> ta handle bằng cách sử dụng package html to text -> google search html to text npm
		      -> yarn add html-to-text
		      -> yarn add -D @types/html-to-text
		      -> convert 1 chuỗi '<div>Hello World</div>' -> Hello World

		      - còn 1 vấn đề đang phát sinh ở console đang báo lỗi do react-helmet gây ra: Using UNSAFE_componentWillMount ...v...v.....
		      -> sử dụng import { Helmet } from "react-helmet-async"
		      -> đồng thời cho { HelmetProvider } bao bọc quanh App, ngay bên dưới ReactRouter
		    */}
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
			{productItemDetail && forwardProductImage && !productItemDetailLoading && (
				<div className='flex justify-between w-full bg-white rounded-sm lg:flex-col'>
					<ProductItemImages
						productItemDetailDatasImage={forwardProductImage}
						productItemDetailDatasImages={productItemDetail.images}
						productItemName={productItemDetail.name as string}
					/>
					<ProductItemInformation
						// số lượng sản phẩm
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
