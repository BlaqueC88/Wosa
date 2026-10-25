import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItemOption = {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceName: string;
  priceAdjustmentCents: number;
};

export type CartItem = {
  /*
    Unique cart-line ID.

    A product ID alone is not enough because customers can order
    the same steak with different options, for example:

    - Medium Rare + Chips + Pepper Sauce
    - Well Done + Mash + No Sauce
  */
  id: string;

  /*
    Database ID from menu_items.
  */
  productId?: string;

  name: string;

  /*
    Price per one configured meal in cents.

    Example:
    Base ribeye: R249.00 = 24900
    Pepper sauce: R20.00 = 2000
    unitPrice: R269.00 = 26900
  */
  price: number;

  image: string;

  quantity: number;

  selectedOptions?: CartItemOption[];

  specialInstructions?: string;
};

type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (item: AddCartItemInput) => void;

  removeItem: (itemId: string) => void;

  increaseQuantity: (itemId: string) => void;

  decreaseQuantity: (itemId: string) => void;

  setQuantity: (itemId: string, quantity: number) => void;

  clearCart: () => void;

  getItemCount: () => number;

  getSubtotalCents: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const quantityToAdd = Math.max(1, item.quantity ?? 1);

        set((state) => {
          const existingItem = state.items.find(
            (cartItem) => cartItem.id === item.id
          );

          /*
            If the exact same configured cart line is added again,
            increase its quantity instead of creating a duplicate line.
          */
          if (existingItem) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.id === item.id
                  ? {
                      ...cartItem,
                      quantity: Math.min(
                        20,
                        cartItem.quantity + quantityToAdd
                      ),
                    }
                  : cartItem
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: quantityToAdd,
              },
            ],
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      increaseQuantity: (itemId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: Math.min(20, item.quantity + 1),
                }
              : item
          ),
        }));
      },

      decreaseQuantity: (itemId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        }));
      },

      setQuantity: (itemId, quantity) => {
        const safeQuantity = Math.min(20, Math.max(0, quantity));

        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: safeQuantity,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },

      getSubtotalCents: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "gabz-meals-cart",

      /*
        Explicitly use browser localStorage.
        This persists cart contents across browser refreshes.
      */
      storage: createJSONStorage(() => localStorage),

      /*
        Only persist actual cart data, not methods.
      */
      partialize: (state) => ({
        items: state.items,
      }),

      version: 1,
    }
  )
);