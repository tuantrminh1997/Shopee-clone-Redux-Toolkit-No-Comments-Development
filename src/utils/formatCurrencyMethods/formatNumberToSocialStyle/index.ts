export default function formatNumberToSocialStyle(value: number) {
	return new Intl.NumberFormat("en", {
		notation: "compact",
		maximumFractionDigits: 1,
	})
		.format(value)
		.replace(".", ",")
		.toLowerCase();
}
