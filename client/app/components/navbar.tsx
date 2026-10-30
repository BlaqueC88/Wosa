import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Heart, Search, ShoppingCart, User } from "lucide-react";

import { useCartStore } from "~/store/cartStore";
import { useWishlistStore } from "~/store/wishlistStore";
import { useAuthStore } from "~/store/authStore";

import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

export function Navbar() {
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const wishlistCount = useWishlistStore((state) => state.items.length);

  const user = useAuthStore((state) => state.user);

  const accountPath =
    user?.role === "admin"
      ? "/admin"
      : user
        ? "/account"
        : "/auth/signin";

  return (
    <nav className="min-w-screen border-b border-border bg-background px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <NavLink
            to="/"
            end
            className="shrink-0 text-lg font-black tracking-tight text-foreground"
          >
            WOSA
          </NavLink>

          <div className="hidden w-full max-w-md md:block">
            <SearchForm id="site-search" />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <NavbarIconLink
              to="/wishlist"
              label={`Wishlist${wishlistCount ? ` (${wishlistCount})` : ""}`}
              count={wishlistCount}
            >
              <Heart className="size-5" />
            </NavbarIconLink>

            <NavbarIconLink
              to="/cart"
              label={`Cart${cartCount ? ` (${cartCount})` : ""}`}
              count={cartCount}
            >
              <ShoppingCart className="size-5" />
            </NavbarIconLink>

            <NavbarIconLink
              to={accountPath}
              label={
                user?.role === "admin"
                  ? "Open admin dashboard"
                  : user
                    ? "Open your account"
                    : "Sign in or create an account"
              }
            >
              <User className="size-5" />
            </NavbarIconLink>
          </div>
        </div>

        <div className="mt-4 md:hidden">
          <SearchForm id="mobile-site-search" />
        </div>

        <Separator className="my-5" />

        <div className="flex items-center justify-start gap-x-6 gap-y-3 overflow-x-auto pb-1 sm:justify-center">
          {navigation.map(({ href, name }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/"}
              className={({ isActive }) =>
                [
                  "shrink-0 text-sm font-semibold transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary",
                ].join(" ")
              }
            >
              {name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

function SearchForm({ id }: { id: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="w-full">
      <ButtonGroup className="w-full">
        <Input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search meals..."
          aria-label="Search meals"
          maxLength={60}
        />

        <Button type="submit" variant="outline" size="icon" aria-label="Search">
          <Search className="size-4" />
        </Button>
      </ButtonGroup>
    </form>
  );
}

function NavbarIconLink({
  to,
  label,
  count,
  children,
}: {
  to: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}

      {count && count > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

const navigation = [
  { href: "/", name: "HOME" },
  { href: "/steaks", name: "STEAKS" },
  { href: "/chicken", name: "CHICKEN" },
  { href: "/fish", name: "FISH" },
  { href: "/surfnturf", name: "SURF & TURF" },
  { href: "/salads", name: "SALADS" },
  { href: "/desserts", name: "DESSERTS" },
];
