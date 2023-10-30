import { Category, ProductItemSuccessResponse } from "src/types";

interface ProductListInitialStateType {
	productList: ProductItemSuccessResponse[];
	pagination: { limit: number; page: number; page_size: number };
	categories: Category[];
	isLoading: boolean;
	currentRequestId: undefined | string;
}
export default ProductListInitialStateType;
