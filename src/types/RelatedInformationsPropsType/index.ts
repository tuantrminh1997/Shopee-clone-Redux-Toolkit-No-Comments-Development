import { ProductItemSuccessResponse } from "src/types";

interface RelatedInformationsPropsType {
	similarProductList: ProductItemSuccessResponse[];
	productItemDescription: string;
	similarSoldByProductList: ProductItemSuccessResponse[];
}
export default RelatedInformationsPropsType;
