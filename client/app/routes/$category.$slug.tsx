import { useEffect,useMemo,useState } from "react";
import { Link,useParams } from "react-router";
import { categoryInfo } from "~/lib/categories";
import { toast } from "sonner";

import {
	ArrowLeft,
	Check,
	Clock3,
	Heart,
	Minus,
	Plus,
	ShoppingCart,
	Star,
	Truck,
} from "lucide-react";

import { Skeleton } from "~/components/ui/skeleton";
import {
	getMenuItem,
	isMenuCategory,
	type MenuItemDetail,
	type OptionChoice,
	type OptionGroup,
} from "~/lib/api";

import { useCartStore } from "~/store/cartStore";
import { useWishlistStore } from "~/store/wishlistStore";

function getDefaultChoices(groups: OptionGroup[]) {
	const defaults: Record<string,string>={};

	for(const group of groups) {
		const choice=
			group.choices.find((option) => option.isDefault)??
			(group.required? group.choices[0]:undefined);

		if(choice) {
			defaults[group.code]=choice.code;
		}
	}

	return defaults;
}

export default function DishDetailPage() {
	const { category,slug }=useParams();

	const [steak,setSteak]=useState<MenuItemDetail|null>(null);
	const [isLoading,setIsLoading]=useState(true);
	const [error,setError]=useState<string|null>(null);

	const [quantity,setQuantity]=useState(1);

	const [chosenCodes,setChosenCodes]=useState<Record<string,string>>({});

	const [specialInstructions,setSpecialInstructions]=useState("");

	const addItem=useCartStore((state) => state.addItem);

	const toggleWishlistItem=useWishlistStore((state) => state.toggleItem);

	const isFavourite=useWishlistStore((state) =>
		steak? state.items.some((item) => item.id===steak.id):false
	);

	useEffect(() => {
		let isCurrent=true;

		async function loadSteak() {
			if(!slug||!isMenuCategory(category)) {
				if(isCurrent) {
					setError("This dish could not be found.");
					setIsLoading(false);
				}

				return;
			}

			try {
				setIsLoading(true);
				setError(null);
				setQuantity(1);
				setSpecialInstructions("");

				const item=await getMenuItem(category,slug);

				if(isCurrent) {
					setSteak(item);
					setChosenCodes(getDefaultChoices(item.optionGroups));
				}
			} catch(error) {
				if(isCurrent) {
					setError(
						error instanceof Error
							? error.message
							:"Unable to load this dish."
					);
				}
			} finally {
				if(isCurrent) {
					setIsLoading(false);
				}
			}
		}

		void loadSteak();

		return () => {
			isCurrent=false;
		};
	},[category,slug]);

	const selectedOptionsList=useMemo(() => {
		if(!steak) {
			return [];
		}

		return steak.optionGroups.flatMap((group) => {
			const choice=group.choices.find(
				(option) => option.code===chosenCodes[group.code]
			);

			if(!choice) {
				return [];
			}

			return [
				{
					groupId: group.code,
					groupName: group.name,
					choiceId: choice.code,
					choiceName: choice.name,
					priceAdjustmentCents: choice.priceAdjustmentCents,
				},
			];
		});
	},[steak,chosenCodes]);

	const optionsPriceCents=useMemo(
		() =>
			selectedOptionsList.reduce(
				(total,option) => total+option.priceAdjustmentCents,
				0
			),
		[selectedOptionsList]
	);

	const unitPriceCents=steak
		? steak.priceCents+optionsPriceCents
		:0;

	const totalPriceCents=unitPriceCents*quantity;

	function selectOption(group: OptionGroup,choice: OptionChoice) {
		setChosenCodes((current) => ({
			...current,
			[group.code]: choice.code,
		}));
	}

	function decreaseQuantity() {
		setQuantity((current) => Math.max(1,current-1));
	}

	function increaseQuantity() {
		setQuantity((current) => Math.min(20,current+1));
	}

	function toggleFavourite() {
		if(!steak) {
			return;
		}

		toggleWishlistItem({
			id: steak.id,
			slug: steak.slug,
			name: steak.name,
			priceCents: steak.priceCents,
			imageUrl: steak.imageUrl,
			category: steak.category,
		});
	}

	function addToCart() {
		if(!steak) {
			return;
		}

		const missingRequiredGroup=steak.optionGroups.find(
			(group) => group.required&&!chosenCodes[group.code]
		);

		if(missingRequiredGroup) {
			toast.error(`Please choose: ${missingRequiredGroup.name}`);
			return;
		}

		const cartLineId=[
			steak.id,
			...selectedOptionsList
				.map((option) => `${option.groupId}:${option.choiceId}`)
				.sort(),
			specialInstructions.trim(),
		].join("|");

		addItem({
			id: cartLineId,
			productId: steak.id,
			name: steak.name,
			price: unitPriceCents,
			image: steak.imageUrl,
			quantity,
			selectedOptions: selectedOptionsList,
			specialInstructions: specialInstructions.trim(),
		});

		toast.success(`${steak.name} added to cart`);
	}

	const backPath=isMenuCategory(category)? `/${category}`:"/";
	const backLabel=isMenuCategory(category)
		? categoryInfo[category].label
		:"the menu";

	if(isLoading) {
		return <SteakDetailSkeleton />;
	}

	if(error||!steak) {
		return (
			<main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
				<Link
					to="/steaks"
					className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
				>
					<ArrowLeft className="size-4" />
					Back to steaks
				</Link>

				<section className="mx-auto mt-10 max-w-xl rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
					<h1 className="text-2xl font-bold">Unable to load this dish</h1>

					<p className="mt-3 text-sm text-muted-foreground">
						{error||"The requested dish could not be found."}
					</p>

					<Link
						to="/steaks"
						className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
					>
						Return to {backLabel}
					</Link>
				</section>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Link
				to={backPath}
				className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
			>
				<ArrowLeft className="size-4" />
				Back to {backLabel}
			</Link>

			<section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-12">
				<div>
					<div className="relative overflow-hidden rounded-3xl border border-border bg-muted">
						<img
							src={steak.imageUrl}
							alt={steak.name}
							className="aspect-square w-full object-cover"
						/>

						{steak.featured? (
							<span className="absolute left-5 top-5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
								Best seller
							</span>
						):null}

						<button
							type="button"
							onClick={toggleFavourite}
							aria-label={
								isFavourite
									? `Remove ${steak.name} from wishlist`
									:`Add ${steak.name} to wishlist`
							}
							aria-pressed={isFavourite}
							className={[
								"absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors",
								isFavourite
									? "text-primary"
									:"text-foreground hover:bg-primary hover:text-primary-foreground",
							].join(" ")}
						>
							<Heart
								className={`size-5 ${isFavourite? "fill-current":""}`}
							/>
						</button>
					</div>

					<div className="mt-5 grid grid-cols-3 gap-3">
						<InfoCard
							icon={<Clock3 className="size-5" />}
							title="Preparation"
							value={
								steak.prepTimeMinutes
									? `${steak.prepTimeMinutes} minutes`
									:"Made to order"
							}
						/>

						<InfoCard
							icon={<Truck className="size-5" />}
							title="Order type"
							value="Delivery or collection"
						/>

						<InfoCard
							icon={<Star className="size-5 fill-current" />}
							title="Customer rating"
							value="4.9 / 5"
						/>
					</div>
				</div>

				<div>
					<p className="text-sm font-semibold uppercase tracking-widest text-primary">
						{formatCategory(steak.category)}
					</p>

					<h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
						{steak.name}
					</h1>

					<div className="mt-3 flex items-center gap-2 text-amber-500">
						<div className="flex items-center gap-1">
							<Star className="size-4 fill-current" />
							<Star className="size-4 fill-current" />
							<Star className="size-4 fill-current" />
							<Star className="size-4 fill-current" />
							<Star className="size-4 fill-current" />
						</div>

						<span className="text-sm font-medium text-muted-foreground">
							4.9 (124 reviews)
						</span>
					</div>

					<p className="mt-5 text-base leading-7 text-muted-foreground">
						{steak.description}
					</p>

					<p className="mt-6 text-3xl font-bold text-primary">
						{formatZAR(unitPriceCents)}
					</p>

					<p className="mt-1 text-sm text-muted-foreground">
						Base price: {formatZAR(steak.priceCents)}
					</p>

					<div className="mt-8 space-y-8">
						{steak.optionGroups.map((group) => (
							<section key={group.code}>
								<div className="flex items-center gap-2">
									<h2 className="font-bold">{group.name}</h2>

									{group.required? (
										<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
											Required
										</span>
									):(
										<span className="text-xs text-muted-foreground">
											Optional
										</span>
									)}
								</div>

								<div className="mt-3 grid gap-2 sm:grid-cols-2">
									{group.choices.map((choice) => {
										const isSelected=
											chosenCodes[group.code]===choice.code;

										return (
											<button
												key={choice.code}
												type="button"
												onClick={() => selectOption(group,choice)}
												className={[
													"flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
													isSelected
														? "border-primary bg-primary/10 text-foreground"
														:"border-border bg-background hover:border-primary/50 hover:bg-accent",
												].join(" ")}
											>
												<span className="flex items-center gap-2">
													<span
														className={[
															"flex size-4 items-center justify-center rounded-full border",
															isSelected
																? "border-primary bg-primary text-primary-foreground"
																:"border-muted-foreground",
														].join(" ")}
													>
														{isSelected? <Check className="size-3" />:null}
													</span>

													{choice.name}
												</span>

												{choice.priceAdjustmentCents>0? (
													<span className="text-xs text-muted-foreground">
														+{formatZAR(choice.priceAdjustmentCents)}
													</span>
												):null}
											</button>
										);
									})}
								</div>
							</section>
						))}

						<section>
							<label
								htmlFor="special-instructions"
								className="font-bold"
							>
								Special instructions
							</label>

							<p className="mt-1 text-sm text-muted-foreground">
								Let the kitchen know about preferences or requests.
							</p>

							<textarea
								id="special-instructions"
								value={specialInstructions}
								onChange={(event) =>
									setSpecialInstructions(event.target.value.slice(0,300))
								}
								maxLength={300}
								placeholder="Example: Please put the sauce on the side."
								className="mt-3 min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
							/>

							<p className="mt-1 text-right text-xs text-muted-foreground">
								{specialInstructions.length}/300
							</p>
						</section>

						<section className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-6">
							<div>
								<p className="font-bold">Quantity</p>

								<p className="mt-1 text-sm text-muted-foreground">
									Choose how many meals you want.
								</p>
							</div>

							<div className="flex items-center rounded-lg border border-border bg-background">
								<button
									type="button"
									onClick={decreaseQuantity}
									disabled={quantity===1}
									aria-label="Decrease quantity"
									className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
								>
									<Minus className="size-4" />
								</button>

								<span className="flex h-11 min-w-11 items-center justify-center border-x border-border px-3 text-sm font-bold">
									{quantity}
								</span>

								<button
									type="button"
									onClick={increaseQuantity}
									disabled={quantity===20}
									aria-label="Increase quantity"
									className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
								>
									<Plus className="size-4" />
								</button>
							</div>
						</section>

						<button
							type="button"
							onClick={addToCart}
							className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
						>
							<ShoppingCart className="size-5" />
							Add to cart · {formatZAR(totalPriceCents)}
						</button>

						<p className="text-center text-xs leading-5 text-muted-foreground">
							Your meal will be prepared fresh after you place your order.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}

function InfoCard({
	icon,
	title,
	value,
}: {
	icon: React.ReactNode;
	title: string;
	value: string;
}) {
	return (
		<div className="rounded-xl border border-border bg-card p-3 sm:p-4">
			<div className="text-primary">{icon}</div>

			<p className="mt-3 text-xs font-medium text-muted-foreground">
				{title}
			</p>

			<p className="mt-1 text-xs font-semibold sm:text-sm">{value}</p>
		</div>
	);
}

function SteakDetailSkeleton() {
	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Skeleton className="h-5 w-32" />

			<section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-12">
				<div>
					<Skeleton className="aspect-square w-full rounded-3xl" />

					<div className="mt-5 grid grid-cols-3 gap-3">
						<Skeleton className="h-24 rounded-xl" />
						<Skeleton className="h-24 rounded-xl" />
						<Skeleton className="h-24 rounded-xl" />
					</div>
				</div>

				<div>
					<Skeleton className="h-4 w-20" />
					<Skeleton className="mt-3 h-10 w-4/5" />
					<Skeleton className="mt-4 h-5 w-32" />

					<Skeleton className="mt-6 h-5 w-full" />
					<Skeleton className="mt-2 h-5 w-11/12" />
					<Skeleton className="mt-2 h-5 w-3/4" />

					<Skeleton className="mt-7 h-10 w-32" />

					<div className="mt-8 space-y-8">
						<div>
							<Skeleton className="h-5 w-48" />

							<div className="mt-3 grid gap-2 sm:grid-cols-2">
								<Skeleton className="h-12 rounded-lg" />
								<Skeleton className="h-12 rounded-lg" />
								<Skeleton className="h-12 rounded-lg" />
								<Skeleton className="h-12 rounded-lg" />
							</div>
						</div>

						<div>
							<Skeleton className="h-5 w-36" />

							<div className="mt-3 grid gap-2 sm:grid-cols-2">
								<Skeleton className="h-12 rounded-lg" />
								<Skeleton className="h-12 rounded-lg" />
								<Skeleton className="h-12 rounded-lg" />
								<Skeleton className="h-12 rounded-lg" />
							</div>
						</div>

						<Skeleton className="h-28 w-full rounded-lg" />
						<Skeleton className="h-14 w-full rounded-md" />
					</div>
				</div>
			</section>
		</main>
	);
}

function formatZAR(priceCents: number) {
	return new Intl.NumberFormat("en-ZA",{
		style: "currency",
		currency: "ZAR",
		minimumFractionDigits: 2,
	}).format(priceCents/100);
}

function formatCategory(category: string) {
	const labels: Record<string,string>={
		steaks: "Steaks",
		chicken: "Chicken",
		fish: "Fish & Seafood",
		surfnturf: "Surf & Turf",
		salads: "Salads",
		desserts: "Desserts",
	};

	return labels[category]??category;
}