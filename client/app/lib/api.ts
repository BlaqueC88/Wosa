const API_URL=import.meta.env.VITE_API_URL??"http://localhost:5000";

export type MenuCategory=
	|"steaks"
	|"chicken"
	|"fish"
	|"surfnturf"
	|"salads"
	|"desserts";

export type MenuItem={
	id: string;
	slug: string;
	name: string;
	description: string;
	category: MenuCategory;
	priceCents: number;
	imageUrl: string;
	available: boolean;
	featured: boolean;
	prepTimeMinutes: number|null;
};

export type OptionChoice={
	code: string;
	name: string;
	priceAdjustmentCents: number;
	isDefault: boolean;
};

export type OptionGroup={
	code: string;
	name: string;
	required: boolean;
	choices: OptionChoice[];
};

export type MenuItemDetail=MenuItem&{
	optionGroups: OptionGroup[];
};

type ApiErrorResponse={
	message?: string;
	errors?: string[];
	fields?: Record<string,string>;
};

type MenuListResponse={
	category?: MenuCategory;
	data: MenuItem[];
};

type MenuItemResponse={
	data: MenuItemDetail;
};

async function request<T>(
	path: string,
	options: RequestInit={}
): Promise<T> {
	const response=await fetch(`${API_URL}${path}`,{
		...options,

		/*
			Needed for future httpOnly-cookie authentication.
			It does not hurt public GET menu endpoints.
		*/
		credentials: "include",

		headers: {
			Accept: "application/json",
			...options.headers,
		},
	});

	const body=(await response.json().catch(() => null)) as
		|T
		|ApiErrorResponse
		|null;

	if(!response.ok) {
		const errorBody=body as ApiErrorResponse|null;

		const validationMessage=
			errorBody?.errors&&errorBody.errors.length>0
				? errorBody.errors.join(" ")
				:errorBody?.fields
					? Object.values(errorBody.fields).join(" ")
					:null;

		throw new Error(
			validationMessage||
			errorBody?.message||
			`Request failed with status ${response.status}.`
		);
	}

	return body as T;
}

/*
	GET /api/menu/featured

	Used by:
	app/routes/_index.tsx
*/
export async function getFeaturedMenuItems(): Promise<MenuItem[]> {
	const response=await request<MenuListResponse>("/api/menu/featured");

	return response.data;
}

/*
	GET /api/menu?category=steaks

	Used by:
	app/routes/steaks/route.tsx
*/
export async function getMenuItemsByCategory(
	category: MenuCategory
): Promise<MenuItem[]> {
	const response=await request<MenuListResponse>(
		`/api/menu?category=${encodeURIComponent(category)}`
	);

	return response.data;
}

/*
	GET /api/menu/steaks/ribeye-300g

	Used by:
	app/routes/steaks/$slug/route.tsx
*/
export async function getMenuItem(
	category: MenuCategory,
	slug: string
): Promise<MenuItemDetail> {
	const response=await request<MenuItemResponse>(
		`/api/menu/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`
	);

	return response.data;
}

export type UserRole="customer"|"admin";

export type AuthUser={
	id: string;
	name: string;
	email: string;
	role: UserRole;
	createdAt: string;
};

type AuthResponse={
	user: AuthUser;
};

export async function signInRequest(
	email: string,
	password: string
): Promise<AuthUser> {
	const response=await request<AuthResponse>("/api/auth/signin",{
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email,password }),
	});

	return response.user;
}

export type SignUpInput={
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
};

export async function signUpRequest(input: SignUpInput): Promise<AuthUser> {
	const response=await request<AuthResponse>("/api/auth/signup",{
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	return response.user;
}

export async function signOutRequest(): Promise<void> {
	await request<null>("/api/auth/signout",{ method: "POST" });
}

export async function getCurrentUser(): Promise<AuthUser|null> {
	try {
		const response=await request<Partial<AuthResponse>>("/api/auth/me");

		return response.user??null;
	} catch {
		return null;
	}
}

export { request };