import { Link,Navigate } from "react-router";
import { LayoutDashboard,LogOut,ShieldCheck } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/store/authStore";

export default function AdminPage() {
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

	if(user.role!=="admin") {
		return <Navigate to="/account" replace />;
	}

	return (
		<main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-sm font-semibold uppercase tracking-widest text-primary">
						Administration
					</p>

					<h1 className="mt-2 text-3xl font-bold tracking-tight">
						Admin dashboard
					</h1>

					<p className="mt-2 text-sm text-muted-foreground">
						Signed in as {user.email}
					</p>
				</div>

				<Button variant="destructive" onClick={signOut}>
					<LogOut className="size-4" />
					Sign out
				</Button>
			</div>

			<section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				<Link
					to="/steaks"
					className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
				>
					<LayoutDashboard className="size-6 text-primary" />
					<h2 className="mt-4 text-lg font-bold">Manage menu</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Review and update menu categories and dishes.
					</p>
				</Link>

				<div className="rounded-2xl border border-border bg-card p-6">
					<ShieldCheck className="size-6 text-primary" />
					<h2 className="mt-4 text-lg font-bold">Orders</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Order management can be connected when checkout and orders are
						implemented.
					</p>
				</div>

				<div className="rounded-2xl border border-border bg-card p-6">
					<ShieldCheck className="size-6 text-primary" />
					<h2 className="mt-4 text-lg font-bold">Customers</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Customer administration belongs behind server-enforced role checks.
					</p>
				</div>
			</section>
		</main>
	);
}