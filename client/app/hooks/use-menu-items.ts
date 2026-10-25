import { useCallback,useEffect,useState } from "react";

import {
	getFeaturedMenuItems,
	getMenuItemsByCategory,
	type MenuCategory,
	type MenuItem,
} from "~/lib/api";

type UseMenuItemsState={
	items: MenuItem[];
	isLoading: boolean;
	error: string|null;
	refetch: () => void;
};

export function useFeaturedMenuItems(): UseMenuItemsState {
	const [items,setItems]=useState<MenuItem[]>([]);
	const [isLoading,setIsLoading]=useState(true);
	const [error,setError]=useState<string|null>(null);
	const [reloadKey,setReloadKey]=useState(0);

	const refetch=useCallback(() => {
		setReloadKey((current) => current+1);
	},[]);

	useEffect(() => {
		let isCurrent=true;

		async function loadFeaturedItems() {
			try {
				setIsLoading(true);
				setError(null);

				const data=await getFeaturedMenuItems();

				if(isCurrent) {
					setItems(data);
				}
			} catch(error) {
				if(isCurrent) {
					setError(
						error instanceof Error
							? error.message
							:"Unable to load featured dishes."
					);
				}
			} finally {
				if(isCurrent) {
					setIsLoading(false);
				}
			}
		}

		void loadFeaturedItems();

		return () => {
			isCurrent=false;
		};
	},[reloadKey]);

	return { items,isLoading,error,refetch };
}

export function useMenuItemsByCategory(
	category: MenuCategory
): UseMenuItemsState {
	const [items,setItems]=useState<MenuItem[]>([]);
	const [isLoading,setIsLoading]=useState(true);
	const [error,setError]=useState<string|null>(null);
	const [reloadKey,setReloadKey]=useState(0);

	const refetch=useCallback(() => {
		setReloadKey((current) => current+1);
	},[]);

	useEffect(() => {
		let isCurrent=true;

		async function loadCategoryItems() {
			try {
				setIsLoading(true);
				setError(null);

				const data=await getMenuItemsByCategory(category);

				if(isCurrent) {
					setItems(data);
				}
			} catch(error) {
				if(isCurrent) {
					setError(
						error instanceof Error
							? error.message
							:`Unable to load ${category}.`
					);
				}
			} finally {
				if(isCurrent) {
					setIsLoading(false);
				}
			}
		}

		void loadCategoryItems();

		return () => {
			isCurrent=false;
		};
	},[category,reloadKey]);

	return { items,isLoading,error,refetch };
}