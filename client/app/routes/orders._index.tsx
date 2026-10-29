import { useEffect,useState } from "react";
import { Link,Navigate } from "react-router";

import { getMyOrders,type OrderListItem } from "~/lib/api";
import { formatZAR,orderStatusLabels } from "~/lib/format";
import { useAuthStore } from "~/store/authStore";

export default function MyOrdersPage() {
	const user=useAuthStore((state) => state.user);
	const isAuthLoading=useAuthStore((state) => state.isLoading);
	const userId=user?.id;

	const [orders,setOrders]=useState<OrderListItem[]>([]);
	const [isLoading,setIsLoading]=useState(true);
	const [error,setError]=useState<string|null>(null);

	useEffect(() => {
		if(!userId) {
			return;
		}

		let isCurrent=true;

		async function loadOrders() {
			try {
				setIsLoading(true);
				setError(null);

				const data=await getMyOrders();

				if(isCurrent) {
					setOrders(data);
				}
			} catch(error) {
				if(isCurrent) {
					setError(
						error instanceof Error? error.message:"Unable to load orders."
					);
				}
			} finally {
				if(isCurrent) {
					setIsLoading(false);
				}
			}
		}

		void loadOrders();

		return () => {
			isCurrent=false;
		};
	},[userId]);

	if(isAuthLoading) {
		return (
			<main className="mx-auto max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Loading...</p>
			</main>
		);
	}

	if(!user) {
		return (
			<Navigate
				to="/auth/signin"
				replace
				state={{ from: { pathname: "/orders" } }}
			/>
		);
	}

	return (
		<main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
			<p className="text-sm font-semibold uppercase tracking-widest text-primary">
				Your account
			</p>

			<h1 className="mt-2 text-3xl font-bold tracking-tight">My orders</h1>

			{isLoading? (
				<p className="mt-8 text-sm text-muted-foreground">
					Loading your orders...
				</p>
			):error? (
				<div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm">
					{error}
				</div>
			):orders.length===0? (
				<div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
					<p className="text-sm text-muted-foreground">
						You have not placed an order yet.
					</p>

					<Link
						to="/steaks"
						className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
					>
						Browse the menu
					</Link>
				</div>
			):(
				<ul className="mt-8 space-y-4">
					{orders.map((order) => {
						const shown=order.items
							.slice(0,3)
							.map((item) => `${item.quantity} × ${item.name}`)
							.join(", ");
						const extra=order.items.length-3;

						return (
							<li key={order.id}>
								<Link
									to={`/orders/${order.id}`}
									className="block rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
								>
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<h2 className="font-bold">Order #{order.orderNumber}</h2>

											<p className="mt-1 text-xs text-muted-foreground">
												{new Date(order.createdAt).toLocaleString("en-ZA")} ·{" "}
												{order.fulfilmentType==="delivery"
													? "Delivery"
													:"Collection"}
											</p>
										</div>

										<span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
											{orderStatusLabels[order.status]??order.status}
										</span>
									</div>

									<p className="mt-3 text-sm text-muted-foreground">
										{shown}
										{extra>0? ` and ${extra} more`:""}
									</p>

									<div className="mt-3 flex items-center justify-between">
										<span className="font-bold text-primary">
											{formatZAR(order.totalCents)}
										</span>

										<span className="text-sm font-semibold">
											{order.status==="pending_payment"
												? "Pay now →"
												:"View order →"}
										</span>
									</div>
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}