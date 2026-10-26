import { useEffect,useState } from "react";
import { Link,Navigate,useParams } from "react-router";
import { CheckCircle2 } from "lucide-react";

import { getOrderRequest,type OrderDetail } from "~/lib/api";
import { formatZAR } from "~/lib/format";
import { useAuthStore } from "~/store/authStore";

const statusLabels: Record<string,string>={
	pending_payment: "Waiting for payment",
	paid: "Paid",
	preparing: "Being prepared",
	out_for_delivery: "Out for delivery",
	ready_for_collection: "Ready for collection",
	completed: "Completed",
	cancelled: "Cancelled",
};

export default function OrderPage() {
	const { orderId }=useParams();

	const user=useAuthStore((state) => state.user);
	const isAuthLoading=useAuthStore((state) => state.isLoading);
	const userId=user?.id;

	const [order,setOrder]=useState<OrderDetail|null>(null);
	const [error,setError]=useState<string|null>(null);
	const [isLoading,setIsLoading]=useState(true);

	useEffect(() => {
		if(!orderId||!userId) {
			return;
		}

		let isCurrent=true;

		async function loadOrder(id: string) {
			try {
				setIsLoading(true);
				setError(null);

				const data=await getOrderRequest(id);

				if(isCurrent) {
					setOrder(data);
				}
			} catch(error) {
				if(isCurrent) {
					setError(
						error instanceof Error
							? error.message
							:"Unable to load this order."
					);
				}
			} finally {
				if(isCurrent) {
					setIsLoading(false);
				}
			}
		}

		void loadOrder(orderId);

		return () => {
			isCurrent=false;
		};
	},[orderId,userId]);

	if(isAuthLoading||(user&&isLoading)) {
		return (
			<main className="mx-auto max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Loading your order...</p>
			</main>
		);
	}

	if(!user) {
		return (
			<Navigate
				to="/auth/signin"
				replace
				state={{ from: { pathname: `/orders/${orderId}` } }}
			/>
		);
	}

	if(error||!order) {
		return (
			<main className="mx-auto max-w-xl px-4 py-16 text-center">
				<h1 className="text-2xl font-bold">We could not find that order</h1>

				<p className="mt-3 text-sm text-muted-foreground">
					{error??"It may not exist, or it belongs to another account."}
				</p>

				<Link
					to="/"
					className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
				>
					Back to home
				</Link>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="flex items-start gap-4">
				<CheckCircle2 className="mt-1 size-8 shrink-0 text-primary" />

				<div>
					<p className="text-sm font-semibold uppercase tracking-widest text-primary">
						Order received
					</p>

					<h1 className="mt-1 text-3xl font-bold tracking-tight">
						Order #{order.orderNumber}
					</h1>

					<p className="mt-2 text-sm text-muted-foreground">
						Placed {new Date(order.createdAt).toLocaleString("en-ZA")}
					</p>

					<span className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-sm font-medium">
						{statusLabels[order.status]??order.status}
					</span>
				</div>
			</div>

			<section className="mt-8 rounded-2xl border border-border bg-card p-6">
				<h2 className="font-bold">Your dishes</h2>

				<ul className="mt-4 space-y-4">
					{order.items.map((item,index) => (
						<li key={index} className="flex justify-between gap-4 text-sm">
							<div className="min-w-0">
								<p className="font-medium">
									{item.quantity} × {item.name}
								</p>

								{item.selectedOptions.length? (
									<p className="mt-0.5 text-xs text-muted-foreground">
										{item.selectedOptions
											.map((option) => option.choiceName)
											.join(" · ")}
									</p>
								):null}

								{item.specialInstructions? (
									<p className="mt-0.5 text-xs text-muted-foreground">
										Note: {item.specialInstructions}
									</p>
								):null}
							</div>

							<span className="shrink-0 font-medium">
								{formatZAR(item.lineTotalCents)}
							</span>
						</li>
					))}
				</ul>

				<dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
					<div className="flex justify-between">
						<dt className="text-muted-foreground">Subtotal</dt>
						<dd>{formatZAR(order.subtotalCents)}</dd>
					</div>

					<div className="flex justify-between">
						<dt className="text-muted-foreground">
							{order.fulfilmentType==="delivery"
								? "Delivery fee"
								:"Collection"}
						</dt>
						<dd>
							{order.deliveryFeeCents>0
								? formatZAR(order.deliveryFeeCents)
								:"Free"}
						</dd>
					</div>

					<div className="flex justify-between border-t border-border pt-3 text-base font-bold">
						<dt>Total</dt>
						<dd className="text-primary">{formatZAR(order.totalCents)}</dd>
					</div>
				</dl>
			</section>

			<section className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm">
				<h2 className="font-bold">
					{order.fulfilmentType==="delivery"? "Delivery details":"Collection"}
				</h2>

				<p className="mt-3">
					{order.contactName} · {order.contactPhone}
				</p>

				{order.fulfilmentType==="delivery"? (
					<p className="mt-1 text-muted-foreground">
						{order.deliveryAddress}, {order.deliverySuburb},{" "}
						{order.deliveryCity}
					</p>
				):(
					<p className="mt-1 text-muted-foreground">
						We will call you when your order is ready.
					</p>
				)}

				{order.deliveryNotes? (
					<p className="mt-1 text-muted-foreground">
						Notes: {order.deliveryNotes}
					</p>
				):null}
			</section>

			<Link
				to="/"
				className="mt-8 inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
			>
				Back to the menu
			</Link>
		</main>
	);
}