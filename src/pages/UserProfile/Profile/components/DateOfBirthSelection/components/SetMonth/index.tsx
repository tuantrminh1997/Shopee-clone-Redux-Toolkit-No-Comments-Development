/* eslint-disable @typescript-eslint/no-explicit-any */
// lodash
import range from "lodash/range";
// types:
import { SetDatePropsType } from "src/types";
// react hooks
import { memo, useRef, useEffect, useState } from "react";
// icons
import { ArrowDownIcon } from "src/icons";

export default memo(function SetMonth({ handleChangeDateSelection, month }: SetDatePropsType) {
	const divRef = useRef(null);
	const [toggleSelectMonth, setToggleSelectMonth] = useState<boolean>(false);
	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (divRef.current && (!divRef.current as any).contains(event.target)) {
				setToggleSelectMonth(false);
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className={`flex justify-between relative py-[11px] items-center border basis-[32%] rounded-sm px-[15px] cursor-pointer hover:border-[#ee4d2d]
    ${toggleSelectMonth ? "border-[#ee4d2d]" : "border-[rgba(0,0,0,.09)]"} lowMobile:min-w-[91.19px]`}
			ref={divRef}
			aria-hidden='true'
			// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
			tabIndex={0}
			onClick={() => setToggleSelectMonth(!toggleSelectMonth)}
		>
			<p className='text-xs text-[#000000CC]'>Tháng {month}</p>
			<ArrowDownIcon isRotate={toggleSelectMonth && true} />
			<div
				className={`absolute top-[110%] left-0 w-full max-h-[144px] flex flex-col bg-white shadow-2xl overflow-y-auto ${
					!toggleSelectMonth && "hidden"
				}`}
			>
				{range(1, 13).map((item) => (
					<span
						key={item}
						aria-hidden='true'
						className='px-[15px] py-[5px] text-sm text-[#000000CC] hover:text-[#ee4d2d]'
						onClick={() => handleChangeDateSelection(item - 1, "month")}
					>
						{item}
					</span>
				))}
			</div>
		</div>
	);
});
