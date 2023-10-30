import { ProductItemSuccessResponse } from "src/types";
interface ProductListSuccessResponse {
	products: ProductItemSuccessResponse[];
	pagination: {
		page: number;
		limit: number;
		page_size: number;
	};
}
export default ProductListSuccessResponse;
