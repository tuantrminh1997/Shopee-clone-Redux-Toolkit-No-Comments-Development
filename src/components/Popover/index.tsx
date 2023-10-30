// imports;
// react:
import { useState, useRef } from "react";
// floating - UI:
import { useFloating, FloatingPortal, arrow, offset } from "@floating-ui/react";
import { shift } from "@floating-ui/dom";
// framer-motion:
import { AnimatePresence, motion } from "framer-motion";
// types:
// Chú ý: để tăng tính custome cho Component tái sử dụng, ta có thể tạo 1 props quản lý việc chuyển đổi giữa 1 vài thẻ html
import { PopoverPropsType } from "src/types";

export default function Popover({
	hoverTarget,
	hoverTargetclassName,
	popoverArrowClassName,
	popoverContent,
	as: Element = "div",
	initialOpenPopover,
	offsetValue = -1,
	placementValue = "bottom-end",
	isCartComponent,
}: PopoverPropsType) {
	const arrowRef = useRef(null);

	// object trả về của useFloating có property: reference -> truyền vào attribute ref của item mà khi hover vào đó sẽ showw tooltip
	const [isOpenPopover, setIsOpenPopover] = useState<boolean>(initialOpenPopover || false);
	const { refs, middlewareData, x, y, strategy } = useFloating({
		open: isOpenPopover,
		onOpenChange: setIsOpenPopover,
		middleware: [
			arrow({
				element: arrowRef,
			}),
			offset(offsetValue),
			shift(),
		],
		placement: placementValue,
	});

	const handleShowPopover = () => {
		setIsOpenPopover(true);
	};

	const handleHidePopover = () => {
		setIsOpenPopover(false);
	};

	return (
		<Element className={hoverTargetclassName} ref={refs.setReference} onMouseEnter={handleShowPopover} onMouseLeave={handleHidePopover}>
			{hoverTarget}
			<FloatingPortal>
				<AnimatePresence>
					{isOpenPopover && (
						<motion.div
							className='relative z-[1000]'
							ref={refs.setFloating}
							style={{
								// thuộc tính của useFloating()
								position: strategy,
								left: x ?? 0,
								top: y ?? 0,
								width: "max-content",
								transformOrigin: `${middlewareData.arrow?.x}px top`,
							}}
							initial={{ opacity: 0, transform: "scale(0)" }}
							animate={{ opacity: 1, transform: "scale(1)" }}
							exit={{ opacity: 0, transform: "scale(0)" }}
							transition={{ duration: 0.2 }}
						>
							<span
								ref={arrowRef}
								className={`border-x-transparent border-t-transparent border-b-white border-[11px] ${popoverArrowClassName} xl:hidden`}
								style={{
									left: middlewareData.arrow?.x,
									top: middlewareData.arrow?.y,
									zIndex: 1,
								}}
							/>
							{popoverContent}
							<button
								onClick={handleHidePopover}
								className={`hidden xl:block xl:absolute rounded-sm bg-[#ee4d2d] w-[25%] h-[25px] text-white ${
									isCartComponent ? "top-[10px] right-[10px]" : "bottom-[10px] right-[10px]"
								} `}
							>
								x
							</button>
						</motion.div>
					)}
				</AnimatePresence>
			</FloatingPortal>
		</Element>
	);
}
