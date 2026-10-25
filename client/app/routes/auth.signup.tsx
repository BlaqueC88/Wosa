import { Form,Link,useNavigate } from "react-router";
import { Eye,EyeOff,LockKeyhole,Mail,UserRound } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "~/store/authStore";

export default function SignUpPage() {
	const navigate=useNavigate();

	const [showPassword,setShowPassword]=useState(false);
	const [error,setError]=useState<string|null>(null);

	const signUp=useAuthStore((store) => store.signUp);
	const [isSubmitting,setIsSubmitting]=useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		const formData=new FormData(event.currentTarget);

		const name=String(formData.get("fullName")||"").trim();
		const email=String(formData.get("email")||"")
			.trim()
			.toLowerCase();
		const password=String(formData.get("password")||"");
		const confirmPassword=String(formData.get("confirmPassword")||"");

		if(!name||!email||!password||!confirmPassword) {
			setError("Please complete all fields.");
			return;
		}

		if(password.length<8) {
			setError("Your password must contain at least 8 characters.");
			return;
		}

		if(password!==confirmPassword) {
			setError("Your passwords do not match.");
			return;
		}

		try {
			setIsSubmitting(true);

			await signUp({ name,email,password,confirmPassword });

			navigate("/account",{ replace: true });
		} catch(error) {
			setError(
				error instanceof Error
					? error.message
					:"Unable to create your account. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
			<div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-2">
				<section className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
					<Link to="/" className="text-xl font-black tracking-tight">
						GABZ MEALS
					</Link>

					<div>
						<p className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/80">
							Join Gabz Meals
						</p>

						<h1 className="mt-3 text-4xl font-black leading-tight">
							Great meals are better when ordering is easy.
						</h1>

						<p className="mt-5 max-w-md leading-7 text-primary-foreground/80">
							Save favourite dishes, manage orders, and make checkout faster
							the next time you are hungry.
						</p>
					</div>

					<p className="text-sm text-primary-foreground/70">
						Restaurant-quality food, your way.
					</p>
				</section>

				<section className="p-6 sm:p-10">
					<div className="mx-auto max-w-md">
						<p className="text-sm font-semibold uppercase tracking-widest text-primary">
							Create account
						</p>

						<h1 className="mt-2 text-3xl font-bold tracking-tight">
							Sign up
						</h1>

						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Enter your details to create your Gabz Meals account.
						</p>

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
								<label htmlFor="fullName" className="text-sm font-medium">
									Full name
								</label>

								<div className="relative">
									<UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

									<input
										id="fullName"
										name="fullName"
										type="text"
										autoComplete="name"
										placeholder="Your full name"
										className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
									/>
								</div>
							</div>

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
										autoComplete="email"
										placeholder="you@example.com"
										className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium">
									Password
								</label>

								<div className="relative">
									<LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

									<input
										id="password"
										name="password"
										type={showPassword? "text":"password"}
										autoComplete="new-password"
										placeholder="At least 8 characters"
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

							<div className="space-y-2">
								<label htmlFor="confirmPassword" className="text-sm font-medium">
									Confirm password
								</label>

								<input
									id="confirmPassword"
									name="confirmPassword"
									type={showPassword? "text":"password"}
									autoComplete="new-password"
									placeholder="Re-enter your password"
									className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
								/>
							</div>

							<label className="flex items-start gap-3 text-sm text-muted-foreground">
								<input
									type="checkbox"
									name="terms"
									required
									className="mt-1 size-4 accent-primary"
								/>

								<span>I agree to the terms of service and privacy policy.</span>
							</label>

							<button
								type="submit"
								disabled={isSubmitting}
								className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
							>
								{isSubmitting? "Creating account...":"Create account"}
							</button>
						</Form>

						<p className="mt-6 text-center text-sm text-muted-foreground">
							Already have an account?{" "}
							<Link
								to="/auth/signin"
								className="font-semibold text-primary hover:underline"
							>
								Sign in
							</Link>
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}