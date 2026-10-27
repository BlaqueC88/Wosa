import { formatZAR } from "~/lib/format";
import { Link } from "react-router";

import {
  ArrowRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";

import { MenuItemCardSkeleton } from "~/components/menu-item-card-skeleton";
import { useFeaturedMenuItems } from "~/hooks/use-menu-items";

type Category = {
  name: string;
  href: string;
  image: string;
  description: string;
};

const categories: Category[] = [
  {
    name: "Steaks",
    href: "/steaks",
    image: "/images/steaks/Herbert_Tomahawk_Steak.jpg",
    description: "Premium cuts, grilled with care.",
  },
  {
    name: "Chicken",
    href: "/chicken",
    image: "/images/chicken/Chicken_Tenderloin.jpeg",
    description: "Flame-grilled favourites and hearty plates.",
  },
  {
    name: "Fish & Seafood",
    href: "/fish",
    image: "/images/seafood/Stuffed_Salmon.jpg",
    description: "Fresh seafood with bold flavour.",
  },
  {
    name: "Surf & Turf",
    href: "/surfnturf",
    image: "/images/surfnturf/Surf_and_Turf.jpg",
    description: "The best of land and sea on one plate.",
  },
  {
    name: "Salads",
    href: "/salads",
    image: "/images/salads/Summer_Garden_Salad.jpeg",
    description: "Fresh, colourful and satisfying.",
  },
  {
    name: "Desserts",
    href: "/desserts",
    image: "/images/desserts/Lemon_Dump_Cakes.jpeg",
    description: "Finish your meal with something sweet.",
  },
];

export default function HomePage() {
  const {
    items: featuredDishes,
    isLoading,
    error,
    refetch,
  } = useFeaturedMenuItems();

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Star className="size-4 fill-current" />
              Restaurant quality, delivered
            </div>

            <h1 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Big flavour.
              <span className="block text-primary">Delivered your way.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Order premium steaks, flame-grilled chicken, fresh seafood,
              satisfying salads and indulgent desserts—prepared for a great
              meal at home.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/steaks"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Order now
                <ArrowRight className="size-4" />
              </Link>

              <Link
                to="/steaks"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent"
              >
                View menu
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              <Feature
                icon={<Clock3 className="size-5" />}
                title="Made to order"
                description="Prepared when you order."
              />

              <Feature
                icon={<MapPin className="size-5" />}
                title="Delivery or collection"
                description="Choose what suits you."
              />

              <Feature
                icon={<ShieldCheck className="size-5" />}
                title="Quality ingredients"
                description="Food you can trust."
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-muted">
            <img
              src="/images/steaks/Herbert_Tomahawk_Steak.jpg"
              alt="Restaurant-quality grilled steak meal"
              className="aspect-[4/3] w-full object-cover"
            />

            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-background/90 p-4 shadow-lg backdrop-blur sm:inset-x-6 sm:bottom-6">
              <p className="text-sm font-semibold">Tonight’s favourite</p>

              <div className="mt-1 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Flame-grilled steak with a delicious side.
                </p>

                <span className="whitespace-nowrap font-bold text-primary">
                  From R249
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Explore the menu
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              What are you in the mood for?
            </h2>
          </div>

          <Link
            to="/steaks"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Browse dishes
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.href}
              to={category.href}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold">{category.name}</h3>

                  <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Popular right now
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Customer favourites
            </h2>
          </div>

          {isLoading ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <MenuItemCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
              <h3 className="font-bold">Unable to load featured dishes</h3>

              <p className="mt-2 text-sm text-muted-foreground">{error}</p>

              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Try again
              </button>
            </div>
          ) : featuredDishes.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
              <h3 className="text-lg font-bold">
                No featured dishes available right now
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Please check back shortly.
              </p>

              <Link
                to="/steaks"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Browse the steak menu
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredDishes.map((dish) => (
                <article
                  key={dish.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="relative">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />

                    {dish.featured ? (
                      <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        Featured
                      </span>
                    ) : null}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold">{dish.name}</h3>

                      <span className="whitespace-nowrap font-bold text-primary">
                        {formatZAR(dish.priceCents)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {dish.description}
                    </p>

                    {dish.prepTimeMinutes ? (
                      <p className="mt-3 text-xs font-medium text-muted-foreground">
                        Ready in about {dish.prepTimeMinutes} minutes
                      </p>
                    ) : null}

                    <Link
                      to={`/${dish.category}/${dish.slug}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      View dish
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/80">
              Hungry already?
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Your next great meal is a few clicks away.
            </h2>

            <p className="mt-3 max-w-2xl text-primary-foreground/80">
              Browse the menu, choose your favourites and add them to your
              cart.
            </p>
          </div>

          <Link
            to="/steaks"
            className="mt-6 inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 lg:mt-0"
          >
            Start with steaks
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold">{title}</p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

