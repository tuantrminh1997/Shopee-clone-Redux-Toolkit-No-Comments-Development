import { Link } from "react-router-dom";
// types
import { PopoverOptionPropsType } from "src/types";

export default function PopoverOption({
	ContainerElement = "button", // ?
	InnerElement = "span", // ?
	containerClassName,
	innerClassName, // ?
	title,
	to, // ?
	href, // ?
	onclick, // ?
}: PopoverOptionPropsType) {
	// Handle: ContainerElement nếu truyền Props to -> trở thành thẻ Link của React-Router-dom
	//        -> truyền href -> trở thành thẻ a
	//        -> không truyền to và href -> mặc định là thẻ button

	const redirectOptionProps: Omit<
		PopoverOptionPropsType,
		"ContainerElement" | "InnerElement" | "containerClassName" | "innerClassName" | "title"
	> = {};

	if (to) {
		redirectOptionProps.to = to;
		ContainerElement = Link;
	} else if (href) {
		redirectOptionProps.href = href;
		ContainerElement = "a";
	}

	return (
		<ContainerElement className={containerClassName} {...redirectOptionProps} onClick={onclick}>
			<InnerElement className={innerClassName}>{title}</InnerElement>
		</ContainerElement>
	);
}
