import { MealType } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query Keys
export const mealPlanKeys = {
	all: ['meal-plans'] as const,
	lists: () => [...mealPlanKeys.all, 'list'] as const,
	list: (filters: string) => [...mealPlanKeys.lists(), { filters }] as const,
	details: () => [...mealPlanKeys.all, 'detail'] as const,
	detail: (id: number) => [...mealPlanKeys.details(), id] as const,
	entries: (planId: number) => [...mealPlanKeys.detail(planId), 'entries'] as const,
};

// Types
export interface CreateMealPlanData {
	planName: string;
	startDate: string;
	endDate: string;
}

export interface AddMealPlanEntryData {
	recipeId: number;
	mealDate: string;
	mealType: MealType;
	servingsToPrepare?: number;
}

// Queries
export function useMealPlans() {
	return useQuery({
		queryKey: mealPlanKeys.lists(),
		queryFn: async () => {
			const response = await fetch('/api/meal-plans');
			if (!response.ok) {
				throw new Error('Failed to fetch meal plans');
			}
			return response.json();
		},
	});
}

export function useMealPlanEntries(planId: number) {
	return useQuery({
		queryKey: mealPlanKeys.entries(planId),
		queryFn: async () => {
			const response = await fetch(`/api/meal-plans/${planId}/entries`);
			if (!response.ok) {
				throw new Error('Failed to fetch meal plan entries');
			}
			return response.json();
		},
		enabled: !!planId,
	});
}

// Mutations
export function useCreateMealPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateMealPlanData) => {
			const response = await fetch('/api/meal-plans', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create meal plan');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: mealPlanKeys.lists() });
			toast.success('Meal plan created successfully');
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useAddMealPlanEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ planId, data }: { planId: number; data: AddMealPlanEntryData }) => {
			const response = await fetch(`/api/meal-plans/${planId}/entries`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to add recipe to meal plan');
			}

			return response.json();
		},
		onSuccess: (_, { planId }) => {
			queryClient.invalidateQueries({ queryKey: mealPlanKeys.entries(planId) });
			queryClient.invalidateQueries({ queryKey: mealPlanKeys.lists() });
			toast.success('Recipe added to meal plan');
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useDeleteMealPlanEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ planId, entryId }: { planId: number; entryId: number }) => {
			const response = await fetch(`/api/meal-plans/${planId}/entries/${entryId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to remove recipe from meal plan');
			}

			return response.json();
		},
		onSuccess: (_, { planId }) => {
			queryClient.invalidateQueries({ queryKey: mealPlanKeys.entries(planId) });
			queryClient.invalidateQueries({ queryKey: mealPlanKeys.lists() });
			toast.success('Recipe removed from meal plan');
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useDeleteMealPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (planId: number) => {
			const response = await fetch(`/api/meal-plans/${planId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete meal plan');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
			toast.success('Meal plan deleted successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}
