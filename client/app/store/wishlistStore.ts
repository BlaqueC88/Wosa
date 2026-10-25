import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  category: string;
};

type WishlistStore = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
  isWishlisted: (id: string) => boolean;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const alreadySaved = get().items.some(
          (savedItem) => savedItem.id === item.id
        );

        if (alreadySaved) {
          return;
        }

        set((state) => ({
          items: [...state.items, item],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      toggleItem: (item) => {
        const alreadySaved = get().items.some(
          (savedItem) => savedItem.id === item.id
        );

        if (alreadySaved) {
          set((state) => ({
            items: state.items.filter((savedItem) => savedItem.id !== item.id),
          }));

          return;
        }

        set((state) => ({
          items: [...state.items, item],
        }));
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      isWishlisted: (id) => {
        return get().items.some((item) => item.id === id);
      },
    }),
    {
      name: "gabz-meals-wishlist",
    }
  )
);