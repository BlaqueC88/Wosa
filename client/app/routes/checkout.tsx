import { useEffect,useState } from "react";
import { Link,Navigate,useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import {
	createOrderRequest,
	getDeliveryFee,
	type FulfilmentType,
} from "~/lib/api";
import { formatZAR } from "~/lib/format";
import { useAuthStore } from "~/store/authStore";
import { useCartStore } from "~/store/cartStore";

export default function CheckoutPage() {
	const navigate=useNavigate();

	const user=useAuthStore((state) => state.user);
	const isAuthLoading=useAuthStore((state) => state.isLoading);

	const items=useCartStore((state) => state.items);
	const clearCart=useCartStore((state) => state.clearCart);

	const [fulfilmentType,setFulfilmentType]=
		useState<FulfilmentType>("delivery");
	const [deliveryFeeCents,setDeliveryFeeCents]=useState<number|null>(
		null
	);
	const [error,setError]=useState<string|null>(null);
	const [isSubmitting,setIsSubmitting]=useState(false);

	useEffect(() => {
		let isCurrent=true;

		getDeliveryFee()
			.then((fee) => {
				if(isCurrent) {
					setDeliveryFeeCents(fee);
				}
			})
			.catch(() => {
				// The server works out the real fee when the order is placed.
			});

		return () => {
			isCurrent=false;
		};
	},[]);

	const subtotalCents=items.reduce(
		(total,item) => total+item.price*item.quantity,
		0
	);
	const appliedFeeCents=
		fulfilmentType==="delivery"? (deliveryFeeCents??0):0;
	const totalCents=subtotalCents+appliedFeeCents;

	if(isAuthLoading) {
		return (
			<main className="mx-auto max-w-3xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Loading checkout...</p>
			</main>
		);
	}

	if(!user) {
		return (
			<Navigate
				to="/auth/signin"
				replace
				state={{ from: { pathname: "/checkout" } }}
			/>
		);
	}

	if(items.length===0) {
		return (
			<main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
				<section className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
					<h1 className="text-2xl font-bold">Your cart is empty</h1>

					<p className="mt-3 text-sm text-muted-foreground">
						Add a dish from the menu before checking out.
					</p>

					<Link
						to="/steaks"
						className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
					>
						Browse the menu
					</Link>
				</section>
			</main>
		);
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		const formData=new FormData(event.currentTarget);
		const text=(name: string) => String(formData.get(name)||"").trim();

		const contactName=text("contactName");
		const contactPhone=text("contactPhone");

		if(!contactName||!contactPhone) {
			setError("Please enter your name and phone number.");
			return;
		}

		if(
			fulfilmentType==="delivery"&&
			(!text("deliveryAddress")||
				!text("deliverySuburb")||
				!text("deliveryCity"))
		) {
			setError("Please complete your delivery address, suburb and city.");
			return;
		}

		const orderItems=items.flatMap((item) =>
			item.productId
				? [
					{
						productId: item.productId,
						quantity: item.quantity,
						selectedOptions: (item.selectedOptions??[]).map((option) => ({
							groupId: option.groupId,
							choiceId: option.choiceId,
						})),
						specialInstructions: item.specialInstructions??"",
					},
				]
				:[]
		);

		if(orderItems.length!==items.length) {
			setError(
				"Some items in your cart are out of date. Please clear your cart and add them again."
			);
			return;
		}

		try {
			setIsSubmitting(true);

			const order=await createOrderRequest({
				fulfilmentType,
				contactName,
				contactPhone,
				...(fulfilmentType==="delivery"
					? {
						deliveryAddress: text("deliveryAddress"),
						deliverySuburb: text("deliverySuburb"),
						deliveryCity: text("deliveryCity"),
						deliveryNotes: text("deliveryNotes"),
					}
					:{}),
				items: orderItems,
			});

			navigate(`/orders/${order.id}`,{ replace: true });
			clearCart();
		} catch(error) {
			setError(
				error instanceof Error
					? error.message
					:"Unable to place your order. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<p className="text-sm font-semibold uppercase tracking-widest text-primary">
				Checkout
			</p>

			<h1 className="mt-2 text-3xl font-bold tracking-tight">
				Place your order
			</h1>

			<div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
				<form onSubmit={handleSubmit} className="space-y-6">
					<fieldset>
						<legend className="font-bold">How would you like your order?</legend>

						<div className="mt-3 grid gap-3 sm:grid-cols-2">
							{(["delivery","collection"] as const).map((type) => (
								<label
									key={type}
									className={[
										"flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
										fulfilmentType===type
											? "border-primary bg-primary/10"
											:"border-border hover:border-primary/50",
									].join(" ")}
								>
									<input
										type="radio"
										name="fulfilmentType"
										value={type}
										checked={fulfilmentType===type}
										onChange={() => setFulfilmentType(type)}
										className="mt-1 size-4 accent-primary"
									/>

									<span>
										<span className="block font-semibold">
											{type==="delivery"? "Delivery":"Collection"}
										</span>

										<span className="block text-xs text-muted-foreground">
											{type==="delivery"
												? deliveryFeeCents!==null
													? `${formatZAR(deliveryFeeCents)} delivery fee`
													:"Delivered to your door"
												:"Pick up your order, no delivery fee"}
										</span>
									</span>
								</label>
							))}
						</div>
					</fieldset>

					<div className="grid gap-5 sm:grid-cols-2">
						<Field
							id="contactName"
							label="Your name"
							defaultValue={user.name}
							autoComplete="name"
						/>

						<Field
							id="contactPhone"
							label="Phone number"
							type="tel"
							autoComplete="tel"
							placeholder="082 123 4567"
						/>
					</div>

					{fulfilmentType==="delivery"? (
						<div className="space-y-5">
							<Field
								id="deliveryAddress"
								label="Street address"
								autoComplete="street-address"
							/>

							<div className="grid gap-5 sm:grid-cols-2">
								<Field id="deliverySuburb" label="Suburb" />
								<Field id="deliveryCity" label="City" />
							</div>

							<Field
								id="deliveryNotes"
								label="Delivery notes (optional)"
								placeholder="Gate code, landmarks, anything that helps"
								maxLength={300}
							/>
						</div>
					):null}

					{error? (
						<div
							role="alert"
							className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
						>
							{error}
						</div>
					):null}

					<Button
						type="submit"
						size="lg"
						disabled={isSubmitting}
						className="w-full"
					>
						{isSubmitting
							? "Placing your order..."
							:`Place order · ${formatZAR(totalCents)}`}
					</Button>

					<p className="text-center text-xs leading-5 text-muted-foreground">
						Online payment is added in the next step. For now your order is
						saved as waiting for payment.
					</p>
				</form>

				<aside className="h-fit rounded-2xl border border-border bg-card p-6">
					<h2 className="font-bold">Order summary</h2>

					<ul className="mt-4 space-y-4">
						{items.map((item) => (
							<li key={item.id} className="flex justify-between gap-4 text-sm">
								<div className="min-w-0">
									<p className="font-medium">
										{item.quantity} × {item.name}
									</p>

									{item.selectedOptions?.length? (
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
									{formatZAR(item.price*item.quantity)}
								</span>
							</li>
						))}
					</ul>

					<dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
						<div className="flex justify-between">
							<dt className="text-muted-foreground">Subtotal</dt>
							<dd>{formatZAR(subtotalCents)}</dd>
						</div>

						<div className="flex justify-between">
							<dt className="text-muted-foreground">
								{fulfilmentType==="delivery"? "Delivery fee":"Collection"}
							</dt>
							<dd>
								{fulfilmentType==="delivery"
									? deliveryFeeCents!==null
										? formatZAR(deliveryFeeCents)
										:"Calculated when you order"
									:"Free"}
							</dd>
						</div>

						<div className="flex justify-between border-t border-border pt-3 text-base font-bold">
							<dt>Total</dt>
							<dd className="text-primary">{formatZAR(totalCents)}</dd>
						</div>
					</dl>

					<p className="mt-4 text-xs leading-5 text-muted-foreground">
						The final prices are confirmed by our server when you place the
						order.
					</p>
				</aside>
			</div>
		</main>
	);
}

function Field({
	id,
	label,
	...props
}: { id: string; label: string }&React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<div className="space-y-2">
			<label htmlFor={id} className="text-sm font-medium">
				{label}
			</label>

			<input
				id={id}
				name={id}
				{...props}
				className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
			/>
		</div>
	);
}