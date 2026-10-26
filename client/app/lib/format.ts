export function formatZAR(priceCents: number) {
	return new Intl.NumberFormat("en-ZA",{
		style: "currency",
		currency: "ZAR",
		minimumFractionDigits: 2,
	}).format(priceCents/100);
}