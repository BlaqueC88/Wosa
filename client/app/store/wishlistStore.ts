import { create } from "zustand";
import { toast } from "sonner";

import {
	addWishlistItemRequest,
	getWishlistRequest,
	removeWishlistItemRequest,
} from "~/lib/api";
import { useAuthStore } from "~/store/authStore";

export type WishlistItem={
	id: string;
	slug: string;
	name: string;
	priceCents: number;
	imageUrl: string;
	category: string;
};

type WishlistStore={
	items: WishlistItem[];
	loadWishlist: () => Promise<void>;
	resetWishlist: () => void;
	addItem: (item: WishlistItem) => void;
	removeItem: (id: string) => void;
	toggleItem: (item: WishlistItem) => void;
	isWishlisted: (id: string) => boolean;
};

export const useWishlistStore=create<WishlistStore>()((set,get) => ({
	items: [],

	loadWishlist: async () => {
		try {
			const items=await getWishlistRequest();

			set({ items });
		} catch(error) {
			console.error("Could not load the wishlist:",error);
		}
	},

	resetWishlist: () => {
		set({ items: [] });
	},

	addItem: (item) => {
		if(get().items.some((saved) => saved.id===item.id)) {
			return;
		}

		if(!useAuthStore.getState().user) {
			toast.info("Sign in to save dishes to your wishlist.");
			return;
		}

		const previous=get().items;

		set({ items: [item,...previous] });

		addWishlistItemRequest(item.id).catch(() => {
			set({ items: previous });
			toast.error("Could not save this dish. Please try again.");
		});
	},

	removeItem: (id) => {
		const previous=get().items;

		set({ items: previous.filter((item) => item.id!==id) });

		removeWishlistItemRequest(id).catch(() => {
			set({ items: previous });
			toast.error("Could not remove this dish. Please try again.");
		});
	},

	toggleItem: (item) => {
		if(get().items.some((saved) => saved.id===item.id)) {
			get().removeItem(item.id);
		} else {
			get().addItem(item);
		}
	},

	isWishlisted: (id) => {
		return get().items.some((item) => item.id===id);
	},
}));