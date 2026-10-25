import { Link, Outlet, useLocation } from "react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { MenuItemCardSkeleton } from "~/components/menu-item-card-skeleton";
import { useMenuItemsByCategory } from "~/hooks/use-menu-items";
import type { MenuItem } from "~/lib/api";
import { useCartStore } from "~/store/cartStore";
import { useWishlistStore } from "~/store/wishlistStore";

export default function SteaksPage() {
  const location = useLocation();

  if (location.pathname !== "/steaks") {
    return <Outlet />;
  }

  return <SteaksMenuPage />;
}

function SteaksMenuPage() {
  const {
    items: steaks,
    isLoading,
    error,
    refetch,
  } = useMenuItemsByCategory("steaks");

  const addCartItem = useCartStore((state) => state.addItem);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleItem);
  const wishlistItems = useWishlistStore((state) => state.items);

  function addSteakToCart(steak: MenuItem) {
    addCartItem({
      id: steak.id,
      name: steak.name,
      price: steak.priceCents,
      image: steak.imageUrl,
      quantity: 1,
    });
  }

  function isWishlisted(steakId: string) {
    return wishlistItems.some((item) => item.id === steakId);
  }

  function toggleSteakWishlist(steak: MenuItem) {
    toggleWishlistItem({
      id: steak.id,
      slug: steak.slug,
      name: steak.name,
      priceCents: steak.priceCents,
      imageUrl: steak.imageUrl,
      category: steak.category,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-border bg-muted">
        <div className="grid lg:grid-cols-2">
          <img
            src="/images/steaks/Steak_&_Mushroom_Source.jpg"
            alt="Flame-grilled steak"
            className="h-full min-h-64 w-full object-cover"
          />

          <div className="flex flex-col justify-center p-7 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Premium cuts
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Steaks
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Choose from premium cuts, flame-grilled to your preference and
              made complete with your favourite side and sauce.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-border bg-background px-3 py-1.5">
                Cooked to order
              </span>

              <span className="rounded-full border border-border bg-background px-3 py-1.5">
                Choice of sides
              </span>

              <span className="rounded-full border border-border bg-background px-3 py-1.5">
                Sauces available
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Steak menu
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Pick your cut
            </h2>
          </div>

          {!isLoading ? (
            <p className="text-sm text-muted-foreground">
              {steaks.length} {steaks.length === 1 ? "dish" : "dishes"}{" "}
              available
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <MenuItemCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <h3 className="font-bold">Unable to load the steak menu</h3>

            <p className="mt-2 text-sm text-muted-foreground">{error}</p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try again
            </button>
          </div>
        ) : steaks.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
            <h3 className="text-lg font-bold">No steaks available today</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Please check back later.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {steaks.map((steak) => {
              const saved = isWishlisted(steak.id);

              return (
                <article
                  key={steak.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-shadow hover:shadow-lg"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={steak.imageUrl}
                      alt={steak.name}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {steak.featured ? (
                      <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        Best seller
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSteakWishlist(steak);
                      }}
                      aria-label={
                        saved
                          ? `Remove ${steak.name} from wishlist`
                          : `Add ${steak.name} to wishlist`
                      }
                      aria-pressed={saved}
                      className={[
                        "absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors",
                        saved
                          ? "text-primary"
                          : "text-foreground hover:bg-primary hover:text-primary-foreground",
                      ].join(" ")}
                    >
                      <Heart
                        className={`size-4 ${saved ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold">{steak.name}</h3>

                      <span className="whitespace-nowrap text-lg font-bold text-primary">
                        {formatZAR(steak.priceCents)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
                      <Star className="size-4 fill-current" />
                      <Star className="size-4 fill-current" />
                      <Star className="size-4 fill-current" />
                      <Star className="size-4 fill-current" />
                      <Star className="size-4 fill-current" />

                      <span className="ml-1 text-muted-foreground">
                        {steak.prepTimeMinutes
                          ? `${steak.prepTimeMinutes} min`
                          : "Made to order"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {steak.description}
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link
                        to={`/steaks/${steak.slug}`}
                        className="inline-flex flex-1 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
                      >
                        View dish
                      </Link>

                      <button
                        type="button"
                        onClick={() => addSteakToCart(steak)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        <ShoppingCart className="size-4" />
                        Add
                      </button>
                    </div>
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
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(priceCents / 100);
}