// redux toolkit
// types
import { ProductItemSuccessResponse } from "src/types";

interface ProductItemDetailInitialStateType {
	productItemDetail: ProductItemSuccessResponse | null;
	productItemDetailLoading: boolean;
	currentRequestId: undefined | string;
	similarSoldByProductList: ProductItemSuccessResponse[] | [];
	similarProductList: ProductItemSuccessResponse[] | [];
}
export default ProductItemDetailInitialStateType;
