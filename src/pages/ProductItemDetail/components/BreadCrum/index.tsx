// react router dom
import { useNavigate, Link, createSearchParams } from "react-router-dom";
// lodash
import omit from "lodash/omit";
// custome hooks
import { useQueryConfig } from "src/hooks";
// icons:
import { RightArrowBreadCrumIcon } from "src/icons";
// constants
import { paths, productItemAttributes } from "src/constants";
// types
import { BreadCrumPropsType } from "src/types";

export default function BreadCrum({ productItemName, productItemCategory, categoryId }: BreadCrumPropsType) {
	const { shopeeTitle } = productItemAttributes;
	const { productList } = paths;
	const navigate = useNavigate();
	const queryConfig = useQueryConfig();

	// Method quản lý sắp xếp theo Phổ biến, Mới nhất, Bán chạy
	const handleSortCategorySold: () => void = () => {
		navigate({
			pathname: paths.defaultPath,
			search: createSearchParams(
				omit(
					{
						...queryConfig,
						sort_by: "view",
						category: categoryId,
					},
					["order"],
				),
			).toString(),
		});
	};
	return (
		<div className='w-full h-5 border pb-7 flex items-center justify-start text-[13px] text-[#0055AA] self-start lg:pl-4 lg:mt-3 lowerMobile:mb-3'>
			<Link to={productList} className='mr-2 capitalize'>
				{shopeeTitle}
			</Link>
			<span className='mr-2'>
				<RightArrowBreadCrumIcon />
			</span>
			<span onClick={handleSortCategorySold} className='mr-2 capitalize cursor-pointer lg:min-w-[50px]' aria-hidden='true'>
				{productItemCategory}
			</span>
			<span className='mr-2'>
				<RightArrowBreadCrumIcon />
			</span>
			<p className='text-sm text-[#000000CC] capitalize'>{productItemName}</p>
		</div>
	);
}
