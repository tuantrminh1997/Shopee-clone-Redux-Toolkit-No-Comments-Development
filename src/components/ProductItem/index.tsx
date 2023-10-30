// react-router-dom
import { Link } from "react-router-dom";
// i18n
import { useTranslation } from "react-i18next";
// types
import { ProductItemType } from "src/types";
// utils:
import { formatCurrency, formatNumberToSocialStyle, generateNameIdStringUrl } from "src/utils";
// constants:
import { paths, productItemAttributes } from "src/constants";
// components
import { StarRating } from "src/components";

export default function ProductItem({
	product,
	classProductItemWSizeMainAxis = "basis-[calc(100%/5)]",
}: ProductItemType) {
	const { image, name, price_before_discount, price, sold, rating, _id } = product;
	const { currencyUnit } = productItemAttributes;
	const { t } = useTranslation("productItemDetail");
	return (
		<Link
			className={`flex flex-col my-[5px] lg:px-3 rounded-sm shadow-md outline-none hover:shadow-xl hover:mt-[2px] hover:mb-[8px] cursor-pointer overflow-hidden sm:overflow-auto ${classProductItemWSizeMainAxis} justify-between transition-all lowMobile:place-self-center lowMobile:max-w-[90%] lowMobile:max-h-[450px]`}
			// Click vào component Link -> bắn path url lên thanh url /[ProductItemId]
			// -> render ra Element: <MainLayout><ProductItemDetail/></MainLayout>

			// -> handle cho giống với thanh url trên shopee khi truy cập vào page ProductItem
			// -> path url của page ProductItemDetail sẽ có dạng /[ProductName]-i.[ProductId]
			// -> url thân thiện và dễ nhận biết hơn so với việc chỉ có /[id]
			// -> sử dụng function src/utils/removeSpecialCharacter xóa hết các ký tự đặc biệt bị lẫn vào trong chuỗi string ta truyền vào
			// -> khai báo function src/utils/generateNameIdStringUrl (sử dụng function removeSpecialCharacter)
			// -> function nhận vào name, id của productItem -> trả ra định dạng url ta cần.
			// -> trả về chuỗi ký tự dạng a-b-c-x-z-y-i.[ProductItemId]
			to={`${paths.productList}${generateNameIdStringUrl({ name, id: _id })}`}
			// -> params từ url nhận vào khi mounted component
		>
			<img src={image} alt={name} className='aspect-square basis-[60%] lowMobile:basis-[70%]  overflow-hidden' />
			<div className='p-2 sm:pl-4 w-full basis-[30%]'>
				<span className='text-xs text-[#000000DE] break-words line-clamp-2 lg:text-base lg:pt-0 sm:line-clamp-3 sm:text-base'>
					{name}
				</span>
				<div className='mt-1 border border-[#ee4d2d] text-[10px] px-1 py-[2px] max-w-[90px] max-h-4'>
					Mua để nhận quà
				</div>
				<div className='text-[#ee4d2d] mt-2 flex items-center lowMobile:items-start'>
					{price_before_discount > price ? (
						<span className='text-[13px] lg:text-xl line-through text-[#0000008A] inline-flex items-center mr-[8px]'>
							<span className='text-[9px] lg:text-sm underline mr-[2px]'>{currencyUnit}</span>
							{formatCurrency(price_before_discount)}
						</span>
					) : (
						<>
							<span className='inline-flex items-center'>
								<span className='text-[9px] underline mr-[2px]'>{currencyUnit}</span>
								{formatCurrency(price_before_discount)}
							</span>
							<span className='mx-[4px] flex items-center bg-[#ee4d2d] w-[6px] h-[1px]'></span>
						</>
					)}
					<span className='text-[14px] lg:text-xl inline-flex items-center'>
						<span className='text-[9px] lg:text-sm underline mr-[2px]'>{currencyUnit}</span>
						{formatCurrency(price)}
					</span>
				</div>
				<div className='flex mt-3 items-center'>
					<StarRating className='lowMobile:mr-2' rating={rating} />
					<span className='text-[12px] lg:text-lg ml-2 text-[#000000DE] lowMobile:ml-0 capitalize'>
						{t("productTitleArea.sold")} {formatNumberToSocialStyle(sold)}
					</span>
				</div>
				<div className='mt-2'>
					<span className='text-[12px] lg:text-sm text-[#000000A6] capitalize'>{t("productTitleArea.ha noi")}</span>
				</div>
			</div>
		</Link>
	);
}
