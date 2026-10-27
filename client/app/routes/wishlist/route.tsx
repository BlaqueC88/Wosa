import { formatZAR } from "~/lib/format";
import { Link,Navigate } from "react-router";
import { Heart,ShoppingBag,ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { useWishlistStore,type WishlistItem } from "~/store/wishlistStore";
import { useAuthStore } from "~/store/authStore";

export default function WishlistPage() {
	const wishlistItems=useWishlistStore((state) => state.items);
	const removeWishlistItem=useWishlistStore((state) => state.removeItem);
	const user=useAuthStore((state) => state.user);
	const isAuthLoading=useAuthStore((state) => state.isLoading);

	const hasItems=wishlistItems.length>0;

	function removeFromWishlist(item: WishlistItem) {
		removeWishlistItem(item.id);
		toast.success(`${item.name} removed from wishlist`);
	}

	if(isAuthLoading) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-10">
				<p className="text-sm text-muted-foreground">Loading your wishlist...</p>
			</main>
		);
	}

	if(!user) {
		return (
			<Navigate
				to="/auth/signin"
				replace
				state={{ from: { pathname: "/wishlist" } }}
			/>
		);
	}

	return (
		<main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-sm font-semibold uppercase tracking-widest text-primary">
						Saved dishes
					</p>

					<h1 className="mt-2 text-3xl font-bold tracking-tight">
						Your wishlist
					</h1>

					<p className="mt-2 text-sm text-muted-foreground">
						Keep track of dishes you want to order later.
					</p>
				</div>

				{hasItems? (
					<span className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
						{wishlistItems.length}{" "}
						{wishlistItems.length===1? "saved dish":"saved dishes"}
					</span>
				):null}
			</div>

			{!hasItems? (
				<section className="mt-10 flex min-h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 px-6 text-center">
					<div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Heart className="size-8" />
					</div>

					<h2 className="mt-5 text-xl font-bold">Your wishlist is empty</h2>

					<p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
						Save meals you love, then come back when you are ready to order
						them.
					</p>

					<Link
						to="/steaks"
						className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
					>
						<ShoppingBag className="size-4" />
						Browse the menu
					</Link>
				</section>
			):(
				<section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{wishlistItems.map((item) => (
						<article
							key={item.id}
							className="group overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-shadow hover:shadow-lg"
						>
							<div className="relative overflow-hidden">
								<img
									src={item.imageUrl}
									alt={item.name}
									className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>

								<button
									type="button"
									onClick={() => removeFromWishlist(item)}
									aria-label={`Remove ${item.name} from wishlist`}
									className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-background/90 text-primary shadow-sm backdrop-blur transition-colors hover:bg-destructive hover:text-destructive-foreground"
								>
									<Heart className="size-5 fill-current" />
								</button>
							</div>

							<div className="p-5">
								<div className="flex items-start justify-between gap-4">
									<h2 className="text-lg font-bold">{item.name}</h2>

									<span className="shrink-0 font-bold text-primary">
										{formatZAR(item.priceCents)}
									</span>
								</div>

								<div className="mt-5">
									<Link
										to={`/${item.category}/${item.slug}`}
										className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
									>
										<ShoppingCart className="size-4" />
										Choose options
									</Link>
								</div>
							</div>
						</article>
					))}
				</section>
			)}
		</main>
	);
}

