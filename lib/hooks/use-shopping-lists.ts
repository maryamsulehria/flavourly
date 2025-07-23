import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ========= QUERIES =========

export function useShoppingLists(mealPlanId?: number) {
	return useQuery({
		queryKey: ['shopping-lists', mealPlanId],
		queryFn: async () => {
			const url = mealPlanId
				? `/api/shopping-lists?mealPlanId=${mealPlanId}`
				: '/api/shopping-lists';
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch shopping lists');
			}
			return response.json();
		},
	});
}

export function useShoppingList(listId: number) {
	return useQuery({
		queryKey: ['shopping-list', listId],
		queryFn: async () => {
			const response = await fetch(`/api/shopping-lists/${listId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch shopping list');
			}
			return response.json();
		},
		enabled: !!listId,
	});
}

// ========= MUTATIONS =========

export function useCreateShoppingList() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			listName: string;
			mealPlanId?: number;
			items?: Array<{
				itemName: string;
				quantity: number;
				unit?: string;
				notes?: string;
			}>;
		}) => {
			const response = await fetch('/api/shopping-lists', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create shopping list');
			}

			return response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
			if (variables.mealPlanId) {
				queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.mealPlanId] });
			}
			toast.success('Shopping list created successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create shopping list');
		},
	});
}

export function useGenerateShoppingList() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { mealPlanId: number; listName?: string }) => {
			const response = await fetch('/api/shopping-lists/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to generate shopping list');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
			toast.success('Shopping list generated successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to generate shopping list');
		},
	});
}

export function useUpdateShoppingList() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			listId,
			data,
		}: {
			listId: number;
			data: {
				listName?: string;
				items: Array<{
					itemName: string;
					quantity: number;
					unit?: string;
					notes?: string;
					isCompleted?: boolean;
				}>;
			};
		}) => {
			const response = await fetch(`/api/shopping-lists/${listId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update shopping list');
			}

			return response.json();
		},
		onSuccess: (_, { listId }) => {
			queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] });
			queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
			toast.success('Shopping list updated successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update shopping list');
		},
	});
}

export function useDeleteShoppingList() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (listId: number) => {
			const response = await fetch(`/api/shopping-lists/${listId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete shopping list');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
			toast.success('Shopping list deleted successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete shopping list');
		},
	});
}

export function useToggleShoppingListItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			listId,
			itemId,
			isCompleted,
		}: {
			listId: number;
			itemId: number;
			isCompleted: boolean;
		}) => {
			const response = await fetch(`/api/shopping-lists/${listId}/items/${itemId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ isCompleted }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update item');
			}

			return response.json();
		},
		onSuccess: (_, { listId, isCompleted }) => {
			queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] });
			queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
			toast.success(`Item ${isCompleted ? 'marked as complete' : 'marked as incomplete'}`);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update item');
		},
	});
}
