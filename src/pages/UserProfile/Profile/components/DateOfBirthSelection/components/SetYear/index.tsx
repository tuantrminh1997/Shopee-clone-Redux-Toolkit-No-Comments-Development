/* eslint-disable @typescript-eslint/no-explicit-any */
// lodash
import range from "lodash/range";
// react hooks
import { memo, useRef, useState, useEffect } from "react";
// types:
import { SetDatePropsType } from "src/types";
// constants:
import { myAccountFormConstants } from "src/constants";
// icons
import { ArrowDownIcon } from "src/icons";

function SetYearInner({ handleChangeDateSelection, year }: SetDatePropsType) {
	const { maxYearSelection } = myAccountFormConstants;
	const divRef = useRef(null);
	const [toggleSelectYear, setToggleSelectYear] = useState<boolean>(false);

	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (
				divRef.current &&
				typeof (divRef.current as HTMLElement).contains === "function" &&
				!(divRef.current as HTMLElement).contains(event.target)
			) {
				setToggleSelectYear(false);
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	return (
		<div
			className={`flex justify-between relative py-[11px] items-center border basis-[32%] rounded-sm px-[15px] cursor-pointer hover:border-[#ee4d2d]
    ${toggleSelectYear ? "border-[#ee4d2d]" : "border-[rgba(0,0,0,.09)]"} lowMobile:min-w-[70px]`}
			ref={divRef}
			aria-hidden='true'
			// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
			tabIndex={0}
			onClick={() => setToggleSelectYear(!toggleSelectYear)}
		>
			<p className='text-xs text-[#000000CC]'>{year}</p>
			<ArrowDownIcon isRotate={toggleSelectYear && true} />
			<div
				className={`absolute top-[110%] left-0 w-full max-h-[144px] flex flex-col bg-white shadow-2xl overflow-y-auto ${
					!toggleSelectYear && "hidden"
				}`}
			>
				{range(maxYearSelection, 1910).map((item) => (
					<span
						key={item}
						aria-hidden='true'
						className='px-[15px] py-[5px] text-sm text-[#000000CC] hover:text-[#ee4d2d]'
						onClick={() => handleChangeDateSelection(item, "year")}
					>
						{item}
					</span>
				))}
			</div>
		</div>
	);
}
const SetYear = memo(SetYearInner);
export default SetYear;
