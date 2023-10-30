// constants:
import { paths } from "src/constants";
// react router dom:
import { useLocation } from "react-router-dom";
// i18n
import { useTranslation } from "react-i18next";
// types
import { PurchaseItemPropsType } from "src/types";
// currency format methods:
import { formatCurrency } from "src/utils";
// private components:
import {
	PurchaseItemTotalPrice,
	PurchaseItemDeleteButton,
	ShippingDiscount,
	PurchaseItemUniPrice,
	PurchaseItemOverview,
	CheckItem,
	ShopName,
} from "./components";
// common components:
import { ProductItemQuantityController } from "src/components";

export default function PurchaseItem({
	extendPurchaseItem,
	extendPurchaseItemIndex,
	handleCheck,
	handleUpdateQuantityPurchaseItem,
	handleTypeQuantity,
	// purchaseItem = purchase Nguyên bản
	handleDeletePurchaseItem,
	purchaseItemBuyCount,
	itemNameId,
}: PurchaseItemPropsType) {
	// method quản lý chức năng tính ra tổng số tiền từng sản phẩm
	const getProductTotalPrice: () => string = () => {
		return formatCurrency((extendPurchaseItem?.buy_count as number) * (extendPurchaseItem?.product.price as number)) as string;
	};
	const isInCartPage: boolean = paths.cart === useLocation().pathname;
	const isInPurchasePage: boolean = paths.purchases === useLocation().pathname;
	const { t } = useTranslation("cart");
	return (
		<div className={`flex flex-col justify-between rounded-md bg-white ${isInPurchasePage ? "pl-2 py-2" : "mb-3 lg:mx-3"}`}>
			{/*  Vùng 1: Checkbox + kho sỉ Hoàng Ngân */}
			{isInCartPage && (
				<ShopName
					isChecked={extendPurchaseItem?.isCheck as boolean}
					handleCheck={handleCheck}
					extendPurchaseItemIndex={extendPurchaseItemIndex}
					productName={extendPurchaseItem?.product.name as string}
				/>
			)}
			{/* Vùng 2: chứa thông tin chính của sản phẩm, QuantityController, Price, Delete Button */}
			<div className='flex py-1 basis-[60%] w-full border-b border-[rgba(0,0,0,.09)] lg:grid lg:grid-cols-1 lg:grid-rows-2'>
				{/* Checkbox + Ảnh + Tên sản phẩm */}
				<div className='flex justify-start items-center flex-1 text-sm text-[#000000CC] h-full'>
					{isInCartPage && (
						<CheckItem
							isChecked={extendPurchaseItem?.isCheck as boolean}
							handleCheck={handleCheck && (handleCheck as (purchaseItemIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => void)}
							extendPurchaseItemIndex={extendPurchaseItemIndex}
						/>
					)}
					{/* Ảnh + Tên sản phẩm */}
					<PurchaseItemOverview
						extendPurchaseItemImageSrc={extendPurchaseItem?.product.image as string}
						extendPurchaseItemName={extendPurchaseItem?.product.name as string}
						extendPurchaseItemProductId={extendPurchaseItem?.product._id as string}
					/>
				</div>
				{/* Vùng Đơn giá + QuantityController + SỐ tiền + Button xoá  */}
				<div className='flex flex-1 justify-around text-sm lg:grid lg:grid-cols1 lg:grid-rows-4 sm:grid-rows-5 lg:justify-start sm:mt-2'>
					{/* Tên sản phẩm: */}
					<div className='hidden sm:ml-6 sm:flex sm:items-center '>
						<p className='lg:block lg:min-w-[40%] capitalize'>{t("cartTitlte.product name")}:</p>
						<p className='sm:text-xs'>{extendPurchaseItem?.product.name as string}</p>
					</div>
					{/* Đơn giá */}
					<div className='basis-[26%] lg:ml-6 lg:flex lg:items-center'>
						<p className='hidden lg:block lg:min-w-[40%] capitalize'>{t("cartTitlte.unit price")}:</p>
						<PurchaseItemUniPrice
							extendPurchaseItemOldPrice={extendPurchaseItem?.product.price_before_discount as number}
							extendPurchaseItemPrice={extendPurchaseItem?.product.price as number}
							isInCartPage={isInCartPage as boolean}
						/>
					</div>
					{/* Quantity controller */}
					<div className='basis-[25%] lg:ml-6 lg:flex lg:items-center'>
						<p className='hidden lg:block lg:min-w-[40%] capitalize'>{t("cartTitlte.quantity")}:</p>
						<div className='h-full basis-[20%] flex items-center justify-center'>
							{/* Component quản lý quantity */}
							{isInCartPage && (
								<ProductItemQuantityController
									itemNameId={itemNameId as string | undefined}
									// số lượng sản phẩm tối đa - 1 Props của ProductItemQuantityController
									maxQuantityAvailable={extendPurchaseItem?.product.quantity as number}
									classNameContainer='m-auto'
									classNameInnerDiv='mr-0'
									// dữ liệu quantity trong giỏ hàng (get from server)
									value={extendPurchaseItem?.buy_count as number}
									// truyền prop onIncreaseQuantity, onDecreaseQuantity
									// giải thích chi tiết cách viết, các loại đối số truyền vào hàm handleUpdateQuantityPurchaseItem:
									// 1. cách viết (buyCountValue) => handleUpdateQuantityPurchaseItem(..., buyCountValue, ... )
									// -> Mục đích của cách viết này: đứng từ ProductItemQuantityController -> gọi tới prop onIncreaseQuantity và truyền trực tiếp
									// giá trị vào prop này -> khi đó giá trị được truyền vào được gán cho biến buyCountValue ( (buyCountValue) => .... )
									// -> đứng từ component ProductItemQuantityController -> gọi tới prop onIncreaseQuantity
									// onIncreaseQuantity && onIncreaseQuantity(_value) -> buyCountValue được gán bằng giá trị của _value truyền sang
									// -> buyCountValue chạy vào hàm sẽ có giá trị === _value
									// -> nguyên nhân chính là vì hàm handleUpdateQuantityPurchaseItem nhận vào tận 3 đối số, nên cần viết kiểu này để
									// chỉ định rõ giá trị truyền từ component ProductItemQuantityController đi vào đối số nào ?
									// 2. đối số purchaseItemIndex === chỉ mục index của CartProductItem khi map ra === purchaseItemIndex.
									// 3. đối số thứ 3: buyCountValue < purchaseItem.product.quantity -> định hình ra giá trị của enabled.
									// -> Tóm lại: đối số của purchaseItemIndex (thứ 2) và enable (thứ 3) được gán giá trị ngay tại component này.
									// đối số thứ 2 buyCountValue được truyền giá trị vào từ component ProductItemQuantityController
									onIncreaseQuantity={
										handleUpdateQuantityPurchaseItem &&
										((buyCountValue) =>
											handleUpdateQuantityPurchaseItem(
												extendPurchaseItemIndex as number,
												buyCountValue,
												// giá trị của đối số enable
												buyCountValue <= (extendPurchaseItem?.product.quantity as number),
											))
									}
									onDecreaseQuantity={
										handleUpdateQuantityPurchaseItem &&
										((buyCountValue) =>
											// đối số thứ 3 = giá trị của enable
											handleUpdateQuantityPurchaseItem(extendPurchaseItemIndex as number, buyCountValue, buyCountValue >= 1))
									}
									//
									disabled={extendPurchaseItem?.disabled as boolean}
									// giải thích cách truyền prop onTypeQuantity:
									// onTypeQuantity = {}
									// -> tương đương: onTypeQuantity = {(value: number) => void}
									// -> tại component QuantityController truyền value -> hàm được return về từ hàm handleTypeQuantity nhận giá trị value
									onTypeQuantity={
										handleTypeQuantity &&
										(handleTypeQuantity(extendPurchaseItemIndex as number) as (purchaseItemIndex: number) => (value: number) => void)
									}
									onFocusOut={
										handleUpdateQuantityPurchaseItem &&
										((buyCountValue) => {
											// buyCountValue = giá trị buyCount nhập tay vào Component QuantityController và xuất ra ngoài
											return handleUpdateQuantityPurchaseItem(
												extendPurchaseItemIndex as number,
												buyCountValue,
												// giá trị của đối số enable
												buyCountValue >= 1 &&
													buyCountValue <= (extendPurchaseItem?.product.quantity as number) &&
													// do buyCountValue và purchaseItem.buy_count luôn luôn bằng nhau: khi ta nhập tay giá trị -> value truyền ra
													// ngoài và set lại vào thuộc tính buy_count của đối tượng trong Array extendPurchaseList, mà trong khi CartProductItem
													// chính ra Component chứa các thuộc tính của các đối tượng trong Array extendPurchaseList.
													// -> sử dụng điều kiện buyCountValue !== purchaseItem.buy_count để handle vấn đề khi nhập tay quantity và out focus
													// thì ngăn chặn việc call API để update Quantity là sai vì gần như ta đang lấy chính giá trị đó so sánh với bản thân
													// nó nên kết quả là chúng luôn giống nhau!
													// -> ta sử dụng buyCountValue (giá trị sau khi tôi nhập tay quantity vào và focus ra ngoài) so sánh với purchaseItemBuyCount
													buyCountValue !== purchaseItemBuyCount,
											);
										})
										// Chú ý: handle vấn đề khi focus vào thanh input -> không nhập tay quantity -> nhưng out focus ra ngoài
										// -> vẫn tiếp tục call API
										// -> handle bằng cách kiểm soát giá trị buyCountValue xuất ra từ component ProductItemQuantityController
										// -> buyCountValue = giá trị nhập tay vào ControllerQuantity và xuất ra ngoài phải !== purchaseItem.buy_count
										// purchaseItem.buy_count === giá trị quantity get về từ Api
									}
								/>
							)}
							{isInPurchasePage && <div>{extendPurchaseItem?.buy_count as number}</div>}
						</div>
					</div>
					{/* Tổng giá sản phẩm */}
					<div className='basis-[25%] lg:ml-6 lg:flex lg:items-center'>
						<p className='hidden lg:block lg:min-w-[40%] capitalize'>{t("cartTitlte.total price")}:</p>
						<PurchaseItemTotalPrice getProductTotalPrice={getProductTotalPrice() as string} />
					</div>
					{/* Button xoá */}
					{isInCartPage && (
						<div className='basis-[24%] lg:ml-6 lg:flex lg:items-center'>
							<p className='hidden lg:block lg:min-w-[40%] capitalize'>{t("cartTitlte.actions")}:</p>
							<PurchaseItemDeleteButton
								handleDeletePurchaseItem={handleDeletePurchaseItem && (handleDeletePurchaseItem as (purchaseItemIndex: number) => () => void)}
								extendPurchaseItemIndex={extendPurchaseItemIndex as number}
								deleteActionTitle={t("cartItem.delete")}
							/>
						</div>
					)}
				</div>
			</div>
			{/* Vùng 3: vùng thông tin giảm chi phí vận chuyển  */}
			{isInCartPage && <ShippingDiscount />}
		</div>
	);
}
