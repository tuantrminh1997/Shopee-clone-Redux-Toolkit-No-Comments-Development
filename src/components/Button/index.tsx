// icon progressing material UI
import { Link } from "react-router-dom";
import { SpinnerFlowBite } from "src/icons";
// types:
import { ButtonComponentProps, PopoverOptionPropsType } from "src/types";

export default function Button({
	className,
	disabled,
	isLoading,
	children,
	childrenClassName,
	ContainerElement = "button",
	to,
	href,
	Element,
	...restProps
}: ButtonComponentProps) {
	// const { className, disabled, isLoading, children, childrenClassName, to, ...restProps } = props;
	// className = "cursor-not-allowed" của tailwind + attribute disable -> Button bị ngăn chặn click
	// khi button được truyền prop disabled -> className cộng thêm cursor-not-allowed.
	// chú ý thêm khoảng trắng đằng trước cursor-not-allowed, nếu không sẽ bị bug UI.
	const newClassName = disabled ? `${className} cursor-not-allowed` : `${className}`;
	// -> truyền vào element
	// -> nếu có disabled, lấy disabled

	const redirectOptionProps: Omit<PopoverOptionPropsType, "ContainerElement" | "InnerElement" | "containerClassName" | "innerClassName" | "title"> =
		{};

	if (to) {
		redirectOptionProps.to = to;
		ContainerElement = Link;
	} else if (href) {
		redirectOptionProps.href = href;
		ContainerElement = "a";
	} else if (Element) {
		// handle trường hợp không truyền to, href nhưng ta muốn nó trở thành 1 thẻ span chẳng hạn
		ContainerElement = Element;
	}

	return (
		<ContainerElement className={newClassName} disabled={disabled} {...restProps} {...redirectOptionProps}>
			{isLoading && <SpinnerFlowBite />}
			<span className={childrenClassName}>{children}</span>
		</ContainerElement>
	);
}
