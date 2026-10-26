import { create } from "zustand";

import {
	getCurrentUser,
	signUpRequest,
	signInRequest,
	signOutRequest,
	type AuthUser,
	type UserRole,
	type SignUpInput
} from "~/lib/api";

import { useCartStore } from "~/store/cartStore";

export type { AuthUser,UserRole };

type AuthStore={
	user: AuthUser|null;
	isLoading: boolean;
	setUser: (user: AuthUser|null) => void;
	setIsLoading: (isLoading: boolean) => void;
	clearUser: () => void;
	loadSession: () => Promise<void>;
	signIn: (email: string,password: string) => Promise<AuthUser>;
	signUp: (input: SignUpInput) => Promise<AuthUser>;
	signOut: () => Promise<void>;
};

export const useAuthStore=create<AuthStore>()((set) => ({
	user: null,
	isLoading: true,

	setUser: (user) => {
		set({ user });
	},

	setIsLoading: (isLoading) => {
		set({ isLoading });
	},

	clearUser: () => {
		set({ user: null });
	},

	loadSession: async () => {
		const user=await getCurrentUser();

		set({ user,isLoading: false });
	},

	signIn: async (email,password) => {
		const user=await signInRequest(email,password);

		set({ user });

		return user;
	},

	signUp: async (input) => {
		const user=await signUpRequest(input);

		set({ user });

		return user;
	},

	signOut: async () => {
		try {
			await signOutRequest();
		} catch(error) {
			console.error("Sign out request failed:",error);
		} finally {
			set({ user: null });
			useCartStore.getState().clearCart();
		}
	},
}));