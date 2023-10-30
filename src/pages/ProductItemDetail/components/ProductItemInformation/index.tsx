// types:
import { ProductItemInformationPropsType } from "src/types";
// i18
import { useTranslation } from "react-i18next";
// common components:
import { ProductItemQuantityController } from "src/components";
// private components:
import { ProductItemTitle, ProductItemPrices, TransportationCost, ShopingButtons, GuaranteePolicy } from "./components";

export default function ProductItemInformation({
	productItemDetailData,
	handleAddToCart,
	handleSetNumberOfProducts,
	numberOfProducts,
	handleBuyNow,
	itemNameId,
}: ProductItemInformationPropsType) {
	const { t } = useTranslation("productItemDetail");
	return (
		<div className='flex flex-col basis-[55%] relative lg:px-6 lg:min-h-[500px] lg:w-full'>
			{/* Tên sản phẩm */}
			<ProductItemTitle
				productItemName={productItemDetailData.name}
				productItemRating={productItemDetailData.rating}
				productItemView={productItemDetailData.view}
				productItemSold={productItemDetailData.sold}
				viewTitle={t("productTitleArea.views")}
				soldTitle={t("productTitleArea.sold")}
			/>
			<ProductItemPrices productItemOldPrice={productItemDetailData.price_before_discount} productItemNewPrice={productItemDetailData.price} />
			<TransportationCost
				protectionTitle={t("productInformations.protection")}
				shippingTitle={t("productInformations.shipping")}
				freeShippingTitle={t("productInformations.free shipping")}
			/>
			<ProductItemQuantityController
				onIncreaseQuantity={handleSetNumberOfProducts as (value: number) => void}
				onDecreaseQuantity={handleSetNumberOfProducts as (value: number) => void}
				onTypeQuantity={handleSetNumberOfProducts as (value: number) => void}
				value={numberOfProducts as number}
				maxQuantityAvailable={productItemDetailData.quantity as number}
				itemNameId={itemNameId as string}
				piecesAvailableTitlte={t("productInformations.pieces available") as string}
				quantityControllerTitle={t("productInformations.quantity") as string}
			/>
			<ShopingButtons
				handleAddToCart={handleAddToCart as () => void}
				handleBuyNow={handleBuyNow as () => Promise<void>}
				addToCartTitle={t("productInformations.add to cart")}
				buyNowTitle={t("productInformations.buy now")}
			/>
			<GuaranteePolicy />
		</div>
	);
}
