import { Form,Link,useLocation,useNavigate } from "react-router";
import { Eye,EyeOff,LockKeyhole,Mail } from "lucide-react";
import { useState } from "react";

import { useAuthStore } from "~/store/authStore";

type LocationState={
	success?: string;
	email?: string;
	from?: {
		pathname?: string;
	};
};

export default function SignInPage() {
	const navigate=useNavigate();
	const location=useLocation();
	const state=(location.state??{}) as LocationState;

	const signIn=useAuthStore((store) => store.signIn);

	const [showPassword,setShowPassword]=useState(false);
	const [isSubmitting,setIsSubmitting]=useState(false);
	const [error,setError]=useState<string|null>(null);

	const redirectTo=state.from?.pathname||"/account";

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		const formData=new FormData(event.currentTarget);
		const email=String(formData.get("email")||"")
			.trim()
			.toLowerCase();
		const password=String(formData.get("password")||"");

		if(!email||!password) {
			setError("Enter both your email address and password.");
			return;
		}

		try {
			setIsSubmitting(true);

			const user=await signIn(email,password);

			navigate(user.role==="admin"? "/admin":redirectTo,{
				replace: true,
			});
		} catch(error) {
			setError(
				error instanceof Error
					? error.message
					:"Unable to sign in. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
			<div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
				<Link to="/" className="text-xl font-black tracking-tight">
					WOSA
				</Link>

				<p className="mt-8 text-sm font-semibold uppercase tracking-widest text-primary">
					Welcome back
				</p>

				<h1 className="mt-2 text-3xl font-bold tracking-tight">
					Sign in to your account
				</h1>

				<p className="mt-2 text-sm leading-6 text-muted-foreground">
					Access your saved favourites and continue ordering your favourite
					meals.
				</p>

				{state.success? (
					<div
						role="status"
						className="mt-5 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary"
					>
						{state.success}
					</div>
				):null}

				{error? (
					<div
						role="alert"
						className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					>
						{error}
					</div>
				):null}

				<Form method="post" onSubmit={handleSubmit} className="mt-7 space-y-5">
					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email address
						</label>

						<div className="relative">
							<Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

							<input
								id="email"
								name="email"
								type="email"
								defaultValue={state.email}
								autoComplete="email"
								placeholder="you@example.com"
								className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between gap-4">
							<label htmlFor="password" className="text-sm font-medium">
								Password
							</label>

							<Link
								to="/auth/forgot-password"
								className="text-sm font-medium text-primary hover:underline"
							>
								Forgot password?
							</Link>
						</div>

						<div className="relative">
							<LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

							<input
								id="password"
								name="password"
								type={showPassword? "text":"password"}
								autoComplete="current-password"
								placeholder="Enter your password"
								className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
							/>

							<button
								type="button"
								onClick={() => setShowPassword((current) => !current)}
								aria-label={showPassword? "Hide password":"Show password"}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{showPassword? (
									<EyeOff className="size-4" />
								):(
									<Eye className="size-4" />
								)}
							</button>
						</div>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
					>
						{isSubmitting? "Signing in...":"Sign in"}
					</button>
				</Form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					New to Wosa?{" "}
					<Link
						to="/auth/signup"
						className="font-semibold text-primary hover:underline"
					>
						Create an account
					</Link>
				</p>
			</div>
		</main>
	);
}