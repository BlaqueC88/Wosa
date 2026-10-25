import { Link } from "react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

type Steak = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
};

const steaks: Steak[] = [
  {
    id: "ribeye-300g",
    name: "300g Ribeye Steak",
    description:
      "A rich, juicy ribeye steak, flame-grilled and served with your choice of side.",
    price: 249,
    image: "/images/ribeye.jpg",
    tag: "Best seller",
  },
  {
    id: "sirloin-250g",
    name: "250g Classic Sirloin",
    description:
      "Lean, tender sirloin with signature seasoning and a side of your choice.",
    price: 189,
    image: "/images/sirloin.jpg",
    tag: "Popular",
  },
  {
    id: "t-bone-450g",
    name: "450g T-Bone Steak",
    description:
      "The ultimate steakhouse classic, grilled for maximum flavour.",
    price: 299,
    image: "/images/t-bone.jpg",
  },
  {
    id: "fillet-200g",
    name: "200g Beef Fillet",
    description:
      "A premium, tender fillet prepared simply and cooked to your preference.",
    price: 279,
    image: "/images/ribeye.jpg",
  },
];

export default function SaladsPage() {
  const addItem = useCartStore((state) => state.addItem);

  function addSteakToCart(steak: Steak) {
    /*
      Adjust these property names to match your current Zustand cart store.

      Example expected cart item:
      {
        id: steak.id,
        name: steak.name,
        price: steak.price,
        image: steak.image,
        quantity: 1
      }
    */
    addItem({
      id: steak.id,
      name: steak.name,
      price: steak.price,
      image: steak.image,
      quantity: 1,
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

          <p className="text-sm text-muted-foreground">
            {steaks.length} dishes available
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {steaks.map((steak) => (
            <article
              key={steak.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-shadow hover:shadow-lg"
            >
              <div className="relative overflow-hidden">
                <img src="/images/steaks/Steak_&_Mushroom_Source.jpg"
                  alt={steak.name}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {steak.tag ? (
                  <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {steak.tag}
                  </span>
                ) : null}

                <button
                  type="button"
                  aria-label={`Add ${steak.name} to wishlist`}
                  className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Heart className="size-4" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold">{steak.name}</h3>

                  <span className="whitespace-nowrap text-lg font-bold text-primary">
                    R{steak.price}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
                  <Star className="size-4 fill-current" />
                  <Star className="size-4 fill-current" />
                  <Star className="size-4 fill-current" />
                  <Star className="size-4 fill-current" />
                  <Star className="size-4 fill-current" />
                  <span className="ml-1 text-muted-foreground">(4.9)</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {steak.description}
                </p>

                <div className="mt-5 flex gap-3">
                  <Link
                    to={`/steaks/${steak.id}`}
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
          ))}
        </div>
      </section>
    </div>
  );
}