export function formatZAR(priceCents: number) {
	return new Intl.NumberFormat("en-ZA",{
		style: "currency",
		currency: "ZAR",
		minimumFractionDigits: 2,
	}).format(priceCents/100);
}

export const orderStatusLabels: Record<string,string>={
	pending_payment: "Waiting for payment",
	paid: "Paid",
	preparing: "Being prepared",
	out_for_delivery: "Out for delivery",
	ready_for_collection: "Ready for collection",
	completed: "Completed",
	cancelled: "Cancelled",
};