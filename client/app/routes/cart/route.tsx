import { formatZAR } from "~/lib/format";
import { Trash2,Plus,Minus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import { Card,CardContent } from "~/components/ui/card";
import { useCartStore } from "~/store/cartStore";

export default function Cart() {
	const navigate=useNavigate();
	const items=useCartStore((state) => state.items);
	const removeItem=useCartStore((state) => state.removeItem);
	const increaseItemQuantity=useCartStore((state) => state.increaseQuantity);
	const decreaseItemQuantity=useCartStore((state) => state.decreaseQuantity);
	const clearCart=useCartStore((state) => state.clearCart);

	const totalCents=items.reduce(
		(total,item) => total+item.price*item.quantity,
		0
	);

	function decreaseQuantity(itemId: string,quantity: number) {
		if(quantity<=1) {
			removeItem(itemId);
			toast.success("Item removed from cart");
			return;
		}

		decreaseItemQuantity(itemId);
	}

	function handleClearCart() {
		clearCart();
		toast.success("Cart cleared");
	}

	function handleCheckout() {
		navigate("/checkout");
	}

	if(items.length===0) {
		return (
			<main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
				<section className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
					<h1 className="text-2xl font-bold">Your cart is empty</h1>

					<p className="mt-3 text-sm text-muted-foreground">
						Add a dish from the menu to begin your order.
					</p>
				</section>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-sm font-semibold uppercase tracking-widest text-primary">
						Your order
					</p>

					<h1 className="mt-2 text-3xl font-bold">Your Cart</h1>
				</div>

				<Button variant="destructive" onClick={handleClearCart}>
					Clear Cart
				</Button>
			</div>

			<section className="mt-8 space-y-4">
				{items.map((item) => (
					<Card key={item.id}>
						<CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
							{item.image? (
								<img
									src={item.image}
									alt={item.name}
									className="size-24 rounded-xl border border-border object-cover sm:size-28"
								/>
							):null}

							<div className="min-w-0 flex-1">
								<h2 className="truncate text-lg font-semibold">{item.name}</h2>

								<p className="mt-1 text-lg font-bold text-primary">
									{formatZAR(item.price)}
								</p>

								{item.selectedOptions?.length? (
									<p className="mt-2 text-sm text-muted-foreground">
										{item.selectedOptions
											.map((option) => option.choiceName)
											.join(" · ")}
									</p>
								):null}

								{item.specialInstructions? (
									<p className="mt-1 text-sm text-muted-foreground">
										Note: {item.specialInstructions}
									</p>
								):null}
							</div>

							<div className="flex items-center justify-between gap-4 sm:justify-end">
								<div className="flex items-center rounded-lg border border-border">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => decreaseQuantity(item.id,item.quantity)}
										aria-label={`Decrease quantity of ${item.name}`}
									>
										<Minus className="size-4" />
									</Button>

									<span className="flex h-10 min-w-10 items-center justify-center border-x border-border text-sm font-semibold">
										{item.quantity}
									</span>

									<Button
										variant="ghost"
										size="icon"
										onClick={() => increaseItemQuantity(item.id)}
										aria-label={`Increase quantity of ${item.name}`}
									>
										<Plus className="size-4" />
									</Button>
								</div>

								<div className="min-w-20 text-right">
									<p className="text-sm text-muted-foreground">Subtotal</p>

									<p className="font-bold">
										{formatZAR(item.price*item.quantity)}
									</p>
								</div>

								<Button
									variant="ghost"
									size="icon"
									onClick={() => {
										removeItem(item.id);
										toast.success("Item removed from cart");
									}}
									aria-label={`Remove ${item.name} from cart`}
								>
									<Trash2 className="size-5" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</section>

			<section className="mt-8 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-sm text-muted-foreground">Total</p>

					<p className="mt-1 text-3xl font-bold text-primary">
						{formatZAR(totalCents)}
					</p>
				</div>

				<Button size="lg" onClick={handleCheckout}>
					Proceed to checkout
				</Button>
			</section>
		</main>
	);
}

