import { useEffect,useState } from "react";
import { Link,Navigate } from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
	getAdminOrders,
	updateOrderStatusRequest,
	type AdminOrder,
} from "~/lib/api";
import { formatZAR,orderStatusLabels } from "~/lib/format";
import { useAuthStore } from "~/store/authStore";

const actionLabels: Record<string,string>={
	paid: "Mark as paid",
	preparing: "Start preparing",
	out_for_delivery: "Send out for delivery",
	ready_for_collection: "Ready for collection",
	completed: "Mark completed",
	cancelled: "Cancel order",
};

export default function AdminOrdersPage() {
	const user=useAuthStore((state) => state.user);
	const isAuthLoading=useAuthStore((state) => state.isLoading);
	const isAdmin=user?.role==="admin";

	const [orders,setOrders]=useState<AdminOrder[]>([]);
	const [isLoading,setIsLoading]=useState(true);
	const [error,setError]=useState<string|null>(null);
	const [showAll,setShowAll]=useState(false);
	const [updatingId,setUpdatingId]=useState<string|null>(null);
	const [reloadKey,setReloadKey]=useState(0);

	useEffect(() => {
		if(!isAdmin) {
			return;
		}

		let isCurrent=true;

		async function loadOrders() {
			try {
				setIsLoading(true);
				setError(null);

				const data=await getAdminOrders();

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
	},[isAdmin,reloadKey]);

	async function changeStatus(orderId: string,status: string) {
		try {
			setUpdatingId(orderId);

			const updated=await updateOrderStatusRequest(orderId,status);

			setOrders((current) =>
				current.map((order) =>
					order.id===orderId
						? {
							...order,
							status: updated.status,
							nextStatuses: updated.nextStatuses,
						}
						:order
				)
			);

			toast.success(
				`Order marked as ${orderStatusLabels[updated.status]??updated.status}`
			);
		} catch(error) {
			toast.error(
				error instanceof Error? error.message:"Unable to update this order."
			);
		} finally {
			setUpdatingId(null);
		}
	}

	if(isAuthLoading) {
		return (
			<main className="mx-auto max-w-5xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Loading...</p>
			</main>
		);
	}

	if(!user) {
		return <Navigate to="/auth/signin" replace />;
	}

	if(!isAdmin) {
		return <Navigate to="/account" replace />;
	}

	const visibleOrders=showAll
		? orders
		:orders.filter(
			(order) => order.status!=="completed"&&order.status!=="cancelled"
		);

	return (
		<main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<Link
				to="/admin"
				className="text-sm font-semibold text-muted-foreground hover:text-primary"
			>
				← Admin dashboard
			</Link>

			<div className="mt-4 flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-sm font-semibold uppercase tracking-widest text-primary">
						Administration
					</p>

					<h1 className="mt-2 text-3xl font-bold tracking-tight">Orders</h1>
				</div>

				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						onClick={() => setShowAll((current) => !current)}
					>
						{showAll? "Show active only":"Show all orders"}
					</Button>

					<Button onClick={() => setReloadKey((current) => current+1)}>
						Refresh
					</Button>
				</div>
			</div>

			{isLoading? (
				<p className="mt-8 text-sm text-muted-foreground">Loading orders...</p>
			):error? (
				<div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm">
					{error}
				</div>
			):visibleOrders.length===0? (
				<div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
					{showAll? "No orders yet.":"No active orders right now."}
				</div>
			):(
				<div className="mt-8 space-y-5">
					{visibleOrders.map((order) => (
						<article
							key={order.id}
							className="rounded-2xl border border-border bg-card p-5"
						>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h2 className="text-lg font-bold">
										Order #{order.orderNumber}
									</h2>

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

							<div className="mt-4 text-sm">
								<p className="font-medium">
									{order.contactName} · {order.contactPhone}
								</p>

								<p className="text-xs text-muted-foreground">
									{order.customerEmail}
								</p>

								{order.fulfilmentType==="delivery"? (
									<p className="mt-1 text-muted-foreground">
										{order.deliveryAddress}, {order.deliverySuburb},{" "}
										{order.deliveryCity}
									</p>
								):null}

								{order.deliveryNotes? (
									<p className="mt-1 text-muted-foreground">
										Notes: {order.deliveryNotes}
									</p>
								):null}
							</div>

							<ul className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
								{order.items.map((item,index) => (
									<li key={index} className="flex justify-between gap-4">
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

										<span className="shrink-0">
											{formatZAR(item.lineTotalCents)}
										</span>
									</li>
								))}
							</ul>

							<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
								<p className="font-bold">
									Total{" "}
									<span className="text-primary">
										{formatZAR(order.totalCents)}
									</span>
								</p>

								<div className="flex flex-wrap gap-2">
									{order.nextStatuses.map((status) => (
										<Button
											key={status}
											size="sm"
											variant={status==="cancelled"? "destructive":"default"}
											disabled={updatingId===order.id}
											onClick={() => void changeStatus(order.id,status)}
										>
											{actionLabels[status]??status}
										</Button>
									))}
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</main>
	);
}