import type { MenuCategory } from "~/lib/api";

export type CategoryInfo={
	label: string;
	eyebrow: string;
	menuLabel: string;
	heading: string;
	description: string;
	heroImage: string;
	heroAlt: string;
	highlights: string[];
};

export const categoryInfo: Record<MenuCategory,CategoryInfo>={
	steaks: {
		label: "Steaks",
		eyebrow: "Premium cuts",
		menuLabel: "Steak menu",
		heading: "Pick your cut",
		description:
			"Choose from premium cuts, flame-grilled to your preference and made complete with your favourite side and sauce.",
		heroImage: "/images/steaks/Steak_and_Mushroom_Sauce.jpg",
		heroAlt: "Flame-grilled steak with mushroom sauce",
		highlights: ["Cooked to order","Choice of sides","Sauces available"],
	},
	chicken: {
		label: "Chicken",
		eyebrow: "From the grill",
		menuLabel: "Chicken menu",
		heading: "Pick your plate",
		description:
			"Juicy chicken, grilled, roasted or stir-fried and served the way you like it.",
		heroImage: "/images/chicken/Chicken_Tenderloin.jpeg",
		heroAlt: "Chicken tenderloin",
		highlights: ["Made to order","Bold flavours","Hearty portions"],
	},
	fish: {
		label: "Fish & Seafood",
		eyebrow: "Fresh from the sea",
		menuLabel: "Fish and seafood menu",
		heading: "Catch of the day",
		description:
			"Fresh fish and seafood, finished with herbs, lemon and butter.",
		heroImage: "/images/seafood/Lemon_and_Thyme_Roasted_Sea_Bass.jpeg",
		heroAlt: "Lemon and thyme roasted sea bass",
		highlights: ["Fresh daily","Light and flavourful","Made to order"],
	},
	surfnturf: {
		label: "Surf & Turf",
		eyebrow: "The best of both",
		menuLabel: "Surf and turf menu",
		heading: "Land meets sea",
		description:
			"Flame-grilled steak paired with prawns, scallops and rich sauces.",
		heroImage: "/images/surfnturf/Surf_and_Turf.jpg",
		heroAlt: "Surf and turf platter",
		highlights: ["Steak and seafood","Rich sauces","Made to share"],
	},
	salads: {
		label: "Salads",
		eyebrow: "Fresh and light",
		menuLabel: "Salad menu",
		heading: "Pick your bowl",
		description:
			"Crisp greens and fresh ingredients, on their own or alongside a main.",
		heroImage: "/images/salads/Avocado_Salad.jpg",
		heroAlt: "Avocado salad",
		highlights: ["Fresh ingredients","House dressings","Light option"],
	},
	desserts: {
		label: "Desserts",
		eyebrow: "Something sweet",
		menuLabel: "Dessert menu",
		heading: "Save room",
		description: "Cheesecakes, cakes and sweet treats to finish your meal.",
		heroImage: "/images/desserts/White_Chocolate_Bliss_Cheesecake.jpeg",
		heroAlt: "White chocolate cheesecake",
		highlights: ["Baked fresh","Made to share","Sweet finish"],
	},
};