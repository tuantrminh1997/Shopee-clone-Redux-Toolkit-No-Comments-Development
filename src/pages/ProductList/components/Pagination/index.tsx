// classNames:
import classNames from "classnames";
// react - router - dom:
import { createSearchParams } from "react-router-dom";
// constants
import { paths } from "src/constants";
// icons:
import { NextIcon, PreviousIcon } from "src/icons";
// common components:
import { Button } from "src/components";
// types:
import { PaginationPropsType } from "src/types";

export default function Pagination({ totalPage, queryConfig }: PaginationPropsType) {
	const currentPage = Number(queryConfig.page);
	const renderPaginationPages: () => React.ReactNode = () => {
		const range: number = 2;
		let dotAfter: boolean = false;
		let dotBefore: boolean = false;
		const renderDotAfter = (index: number) => {
			if (!dotAfter) {
				dotAfter = true;
				return (
					<Button
						Element={"span"}
						key={index}
						className='w-10 md:w-3 h-[30px] mx-4 flex items-center justify-center rounded-sm border-none outline-none'
						childrenClassName={"m-auto text-[#00000066] text-[25px]"}
					>
						...
					</Button>
				);
			}
			return null;
		};
		const renderDotBefore = (index: number) => {
			if (!dotBefore) {
				dotBefore = true;
				return (
					<Button
						Element={"span"}
						key={index}
						className='w-10 md:w-3 h-[30px] mx-4 flex items-center justify-center rounded-sm border-none outline-none'
						childrenClassName={"m-auto text-[#00000066] text-[25px]"}
					>
						...
					</Button>
				);
			}
			return null;
		};

		return Array(totalPage)
			.fill(0)
			.map((_, index) => {
				const pageNumber = index + 1;
				if (currentPage <= range * 2 + 1 && pageNumber > currentPage + range && pageNumber < totalPage - range + 1) {
					return renderDotAfter(index);
				}
				if (currentPage > range * 2 + 1 && currentPage < totalPage - range * 2) {
					if (pageNumber < currentPage - range && pageNumber > range) {
						return renderDotBefore(index);
					} else if (pageNumber > currentPage + range && pageNumber < totalPage - range + 1) {
						return renderDotAfter(index);
					}
				}
				if (currentPage >= totalPage - range * 2 && pageNumber > range && pageNumber < currentPage - range) {
					return renderDotBefore(index);
				}
				return (
					<Button
						key={index}
						to={{
							pathname: paths.defaultPath,
							search: createSearchParams({
								...queryConfig,
								page: pageNumber.toString(),
							}).toString(),
						}}
						className={classNames("w-10 md:w-5 h-[30px] mx-4 flex items-center justify-center rounded-sm border-none outline-none", {
							"bg-[#EE4D2D]": pageNumber === currentPage,
						})}
						childrenClassName={classNames("m-auto text-[#00000066] ", {
							"text-white": pageNumber === currentPage,
						})}
					>
						{pageNumber}
					</Button>
				);
			});
	};
	return (
		<div className='mb-10 flex justify-center w-full lg:z-[999]'>
			<div className='flex items-center justify-center flex-wrap md: max-w-[90%]'>
				{currentPage === 1 ? (
					<Button className='w-10 md:w-3 h-[30px] flex mr-4 my-[2px]' childrenClassName={"m-auto"} disabled>
						<PreviousIcon width='14px' height='14px' fill='rgba(0,0,0,.1)' />
					</Button>
				) : (
					<Button
						to={{
							pathname: paths.defaultPath,
							search: createSearchParams({
								...queryConfig,
								page: (currentPage - 1).toString(),
							}).toString(),
						}}
						className='w-10 md:w-3 h-[30px] flex mr-4 my-[2px]'
						childrenClassName={"m-auto"}
					>
						<PreviousIcon width='14px' height='14px' fill='rgba(0,0,0,.4)' />
					</Button>
				)}
				{renderPaginationPages()}
				{currentPage === totalPage ? (
					<Button className='w-10 md:w-3 h-[30px] flex mr-4 my-[2px]' childrenClassName={"m-auto"} disabled>
						<NextIcon width='14px' height='14px' fill='rgba(0,0,0,.1)' />
					</Button>
				) : (
					<Button
						to={{
							pathname: paths.defaultPath,
							search: createSearchParams({
								...queryConfig,
								page: (currentPage + 1).toString(),
							}).toString(),
						}}
						className='w-10 md:w-3 h-[30px] ml-4 flex my-[2px]'
						childrenClassName={"m-auto"}
					>
						<NextIcon width='14px' height='14px' fill='rgba(0,0,0,.4)' />
					</Button>
				)}
			</div>
		</div>
	);
}
