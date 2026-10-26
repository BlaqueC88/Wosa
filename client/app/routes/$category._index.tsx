import { Link,useParams } from "react-router";
import { ArrowRight,Heart,Star } from "lucide-react";

import { MenuItemCardSkeleton } from "~/components/menu-item-card-skeleton";
import { useMenuItemsByCategory } from "~/hooks/use-menu-items";
import { isMenuCategory,type MenuCategory,type MenuItem } from "~/lib/api";
import { categoryInfo } from "~/lib/categories";
import { useWishlistStore } from "~/store/wishlistStore";

export default function CategoryPage() {
	const { category }=useParams();

	if(!isMenuCategory(category)) {
		return (
			<main className="mx-auto max-w-xl px-4 py-16 text-center">
				<h1 className="text-2xl font-bold">Page not found</h1>

				<p className="mt-3 text-sm text-muted-foreground">
					We could not find that part of the menu.
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

	return <CategoryMenuPage key={category} category={category} />;
}

function CategoryMenuPage({ category }: { category: MenuCategory }) {
	const info=categoryInfo[category];

	const { items,isLoading,error,refetch }=
		useMenuItemsByCategory(category);

	const toggleWishlistItem=useWishlistStore((state) => state.toggleItem);
	const wishlistItems=useWishlistStore((state) => state.items);

	function isWishlisted(itemId: string) {
		return wishlistItems.some((item) => item.id===itemId);
	}

	function toggleWishlist(item: MenuItem) {
		toggleWishlistItem({
			id: item.id,
			slug: item.slug,
			name: item.name,
			priceCents: item.priceCents,
			imageUrl: item.imageUrl,
			category: item.category,
		});
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<section className="overflow-hidden rounded-3xl border border-border bg-muted">
				<div className="grid lg:grid-cols-2">
					<img
						src={info.heroImage}
						alt={info.heroAlt}
						className="h-full min-h-64 w-full object-cover"
					/>

					<div className="flex flex-col justify-center p-7 sm:p-10">
						<p className="text-sm font-semibold uppercase tracking-widest text-primary">
							{info.eyebrow}
						</p>

						<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
							{info.label}
						</h1>

						<p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
							{info.description}
						</p>

						<div className="mt-6 flex flex-wrap gap-3 text-sm">
							{info.highlights.map((highlight) => (
								<span
									key={highlight}
									className="rounded-full border border-border bg-background px-3 py-1.5"
								>
									{highlight}
								</span>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="mt-12">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-sm font-semibold uppercase tracking-widest text-primary">
							{info.menuLabel}
						</p>

						<h2 className="mt-2 text-3xl font-bold tracking-tight">
							{info.heading}
						</h2>
					</div>

					{!isLoading&&!error? (
						<p className="text-sm text-muted-foreground">
							{items.length} {items.length===1? "dish":"dishes"} available
						</p>
					):null}
				</div>

				{isLoading? (
					<div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
						{Array.from({ length: 6 }).map((_,index) => (
							<MenuItemCardSkeleton key={index} />
						))}
					</div>
				):error? (
					<div className="mx-auto mt-8 max-w-xl rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
						<h3 className="font-bold">
							Unable to load the {info.menuLabel.toLowerCase()}
						</h3>

						<p className="mt-2 text-sm text-muted-foreground">{error}</p>

						<button
							type="button"
							onClick={() => refetch()}
							className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
						>
							Try again
						</button>
					</div>
				):items.length===0? (
					<div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
						<h3 className="text-lg font-bold">No dishes available today</h3>

						<p className="mt-2 text-sm text-muted-foreground">
							Please check back later.
						</p>
					</div>
				):(
					<div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
						{items.map((item) => {
							const saved=isWishlisted(item.id);

							return (
								<article
									key={item.id}
									className="group overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-shadow hover:shadow-lg"
								>
									<div className="relative overflow-hidden">
										<img
											src={item.imageUrl}
											alt={item.name}
											loading="lazy"
											className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>

										{item.featured? (
											<span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
												Best seller
											</span>
										):null}

										<button
											type="button"
											onClick={() => toggleWishlist(item)}
											aria-label={
												saved
													? `Remove ${item.name} from wishlist`
													:`Add ${item.name} to wishlist`
											}
											aria-pressed={saved}
											className={[
												"absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors",
												saved
													? "text-primary"
													:"text-foreground hover:bg-primary hover:text-primary-foreground",
											].join(" ")}
										>
											<Heart
												className={`size-4 ${saved? "fill-current":""}`}
											/>
										</button>
									</div>

									<div className="p-5">
										<div className="flex items-start justify-between gap-4">
											<h3 className="text-lg font-bold">{item.name}</h3>

											<span className="whitespace-nowrap text-lg font-bold text-primary">
												{formatZAR(item.priceCents)}
											</span>
										</div>

										<div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
											<Star className="size-4 fill-current" />

											<span className="ml-1 text-muted-foreground">
												{item.prepTimeMinutes
													? `${item.prepTimeMinutes} min`
													:"Made to order"}
											</span>
										</div>

										<p className="mt-3 text-sm leading-6 text-muted-foreground">
											{item.description}
										</p>

										<Link
											to={`/${item.category}/${item.slug}`}
											className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
										>
											View and order
											<ArrowRight className="size-4" />
										</Link>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
}

function formatZAR(priceCents: number) {
	return new Intl.NumberFormat("en-ZA",{
		style: "currency",
		currency: "ZAR",
		minimumFractionDigits: 2,
	}).format(priceCents/100);
}