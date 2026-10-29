import { Link,Navigate } from "react-router";
import { LogOut,ShieldCheck,UserRound } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/store/authStore";

export default function AccountPage() {
	const user=useAuthStore((state) => state.user);
	const signOut=useAuthStore((state) => state.signOut);
	const isLoading=useAuthStore((state) => state.isLoading);

	if(isLoading) {
		return (
			<main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">Loading your account...</p>
			</main>
		);
	}

	if(!user) {
		return <Navigate to="/auth/signin" replace />;
	}

	if(user.role==="admin") {
		return <Navigate to="/admin" replace />;
	}

	return (
		<main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
			<section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
				<div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
					<UserRound className="size-7" />
				</div>

				<p className="mt-6 text-sm font-semibold uppercase tracking-widest text-primary">
					Customer account
				</p>

				<h1 className="mt-2 text-3xl font-bold">{user.name}</h1>

				<p className="mt-2 text-muted-foreground">{user.email}</p>

				<div className="mt-8 flex flex-wrap gap-3">
					<Link
						to="/orders"
						className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
					>
						My orders
					</Link>
					<Link
						to="/wishlist"
						className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
					>
						View wishlist
					</Link>

					<Link
						to="/cart"
						className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
					>
						View cart
					</Link>

					<Button variant="destructive" onClick={signOut}>
						<LogOut className="size-4" />
						Sign out
					</Button>
				</div>

				<div className="mt-8 flex gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
					<ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
					<p>
						This is currently a demo account screen. Real authentication and
						secure role validation must be completed in the backend.
					</p>
				</div>
			</section>
		</main>
	);
}