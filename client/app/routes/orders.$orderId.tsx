import { useEffect,useState } from "react";
import { Link,Navigate,useParams,useSearchParams } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
	getOrderRequest,
	startPaymentRequest,
	type OrderDetail,
} from "~/lib/api";
import { formatZAR,orderStatusLabels } from "~/lib/format";
import { submitPayfastForm } from "~/lib/payfast";
import { useAuthStore } from "~/store/authStore";

const MAX_POLLS=20;
const POLL_EVERY_MS=3000;

export default function OrderPage() {
	const { orderId }=useParams();

	const user=useAuthStore((state) => state.user);
	const isAuthLoading=useAuthStore((state) => state.isLoading);

	if(isAuthLoading) {
		return <PageMessage>Loading your order...</PageMessage>;
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

	if(!orderId) {
		return <PageMessage>We could not find that order.</PageMessage>;
	}

	return <OrderView key={orderId} orderId={orderId} />;
}

function OrderView({ orderId }: { orderId: string }) {
	const [searchParams]=useSearchParams();
	const paymentParam=searchParams.get("payment");

	const [order,setOrder]=useState<OrderDetail|null>(null);
	const [error,setError]=useState<string|null>(null);
	const [isLoading,setIsLoading]=useState(true);
	const [reloadKey,setReloadKey]=useState(0);
	const [pollCount,setPollCount]=useState(0);
	const [isPaying,setIsPaying]=useState(false);

	useEffect(() => {
		let isCurrent=true;

		async function loadOrder() {
			try {
				const data=await getOrderRequest(orderId);

				if(isCurrent) {
					setOrder(data);
					setError(null);
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

		void loadOrder();

		return () => {
			isCurrent=false;
		};
	},[orderId,reloadKey]);

	// After coming back from Payfast, keep checking until the payment is confirmed.
	const isConfirming=
		paymentParam==="return"&&
		order?.status==="pending_payment"&&
		pollCount<MAX_POLLS;

	useEffect(() => {
		if(!isConfirming) {
			return;
		}

		const timer=setTimeout(() => {
			setPollCount((count) => count+1);
			setReloadKey((key) => key+1);
		},POLL_EVERY_MS);

		return () => clearTimeout(timer);
	},[isConfirming,pollCount]);

	async function handlePay() {
		if(!order) {
			return;
		}

		try {
			setIsPaying(true);

			const checkout=await startPaymentRequest(order.id);

			submitPayfastForm(checkout.url,checkout.fields);

			setTimeout(() => setIsPaying(false),4000);
		} catch(error) {
			toast.error(
				error instanceof Error
					? error.message
					:"Unable to start the payment."
			);
			setIsPaying(false);
		}
	}

	if(isLoading) {
		return <PageMessage>Loading your order...</PageMessage>;
	}

	if(!order) {
		return (
			<main className="mx-auto max-w-xl px-4 py-16 text-center">
				<h1 className="text-2xl font-bold">We could not find that order</h1>

				<p className="mt-3 text-sm text-muted-foreground">
					{error??"It may not exist, or it belongs to another account."}
				</p>

				<Link
					to="/orders"
					className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
				>
					See my orders
				</Link>
			</main>
		);
	}

	let banner: { warning: boolean; text: string }|null=null;

	if(paymentParam==="cancelled"&&order.status==="pending_payment") {
		banner={
			warning: true,
			text: "The payment was cancelled. Your order is saved, and you can pay whenever you are ready.",
		};
	} else if(paymentParam==="return") {
		if(order.status!=="pending_payment"&&order.status!=="cancelled") {
			banner={ warning: false,text: "Payment received. Thank you!" };
		} else if(order.status==="pending_payment") {
			banner={
				warning: false,
				text: isConfirming
					? "Confirming your payment. This usually takes a few seconds..."
					:"We have not received confirmation from the payment provider yet. Please refresh this page in a minute.",
			};
		}
	}

	return (
		<main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="flex items-start gap-4">
				<CheckCircle2 className="mt-1 size-8 shrink-0 text-primary" />

				<div>
					<p className="text-sm font-semibold uppercase tracking-widest text-primary">
						Your order
					</p>

					<h1 className="mt-1 text-3xl font-bold tracking-tight">
						Order #{order.orderNumber}
					</h1>

					<p className="mt-2 text-sm text-muted-foreground">
						Placed {new Date(order.createdAt).toLocaleString("en-ZA")}
					</p>

					<span className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-sm font-medium">
						{orderStatusLabels[order.status]??order.status}
					</span>
				</div>
			</div>

			{banner? (
				<div
					role="status"
					className={[
						"mt-6 rounded-lg border px-4 py-3 text-sm",
						banner.warning
							? "border-destructive/30 bg-destructive/10 text-destructive"
							:"border-primary/20 bg-primary/10 text-primary",
					].join(" ")}
				>
					{banner.text}
				</div>
			):null}

			{order.status==="pending_payment"? (
				<section className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-6">
					<h2 className="font-bold">Complete your payment</h2>

					<p className="mt-1 text-sm text-muted-foreground">
						You will be taken to Payfast&apos;s secure page to pay{" "}
						{formatZAR(order.totalCents)}.
					</p>

					<Button
						size="lg"
						className="mt-4 w-full"
						disabled={isPaying}
						onClick={() => void handlePay()}
					>
						{isPaying
							? "Opening Payfast..."
							:`Pay ${formatZAR(order.totalCents)} now`}
					</Button>
				</section>
			):null}

			<section className="mt-6 rounded-2xl border border-border bg-card p-6">
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
					{order.fulfilmentType==="delivery"
						? "Delivery details"
						:"Collection"}
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

			<div className="mt-8 flex flex-wrap gap-3">
				<Link
					to="/orders"
					className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
				>
					All my orders
				</Link>

				<Link
					to="/"
					className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
				>
					Back to the menu
				</Link>
			</div>
		</main>
	);
}

function PageMessage({ children }: { children: React.ReactNode }) {
	return (
		<main className="mx-auto max-w-3xl px-4 py-10">
			<p className="text-sm text-muted-foreground">{children}</p>
		</main>
	);
}