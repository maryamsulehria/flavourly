import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, refetchHelpers } from '../query-keys';

export interface Ingredient {
	name: string;
	quantity: string;
	unit: string;
	notes: string;
}

export interface MediaFile {
	id: string;
	url: string;
	type: 'image' | 'video';
	publicId: string;
}

export interface Recipe {
	id: number;
	title: string;
	description: string;
	cookingTimeMinutes: string;
	servings: string;
	ingredients: Ingredient[];
	steps: string[];
	media: MediaFile[];
	status: string;
	healthTips?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRecipeData {
	title: string;
	description?: string;
	cookingTimeMinutes?: number;
	servings?: number;
	ingredients: Ingredient[];
	steps: string[];
	media: MediaFile[];
}

export interface UpdateRecipeData extends CreateRecipeData {
	id: number;
}

// Fetch user's recipes
export function useUserRecipes() {
	return useQuery({
		queryKey: queryKeys.recipes.user,
		queryFn: async (): Promise<Recipe[]> => {
			const response = await fetch('/api/recipes/my-recipes');
			if (!response.ok) {
				throw new Error('Failed to fetch recipes');
			}
			return response.json();
		},
	});
}

// Fetch user's favorited recipes
export function useFavoritedRecipes() {
	return useQuery({
		queryKey: ['favorited-recipes'],
		queryFn: async (): Promise<Recipe[]> => {
			const response = await fetch('/api/favorites');
			if (!response.ok) {
				throw new Error('Failed to fetch favorited recipes');
			}
			const favorites = await response.json();
			// Transform the data to match Recipe interface
			return favorites.map((favorite: any) => ({
				id: favorite.recipe.id,
				title: favorite.recipe.title,
				description: favorite.recipe.description || '',
				cookingTimeMinutes: favorite.recipe.cookingTimeMinutes?.toString() || '',
				servings: favorite.recipe.servings?.toString() || '',
				ingredients:
					favorite.recipe.ingredients?.map((ing: any) => ({
						name: ing.ingredient.name,
						quantity: ing.quantity.toString(),
						unit: ing.unit.unitName,
						notes: ing.notes || '',
					})) || [],
				steps: favorite.recipe.steps?.map((step: any) => step.instruction) || [],
				media:
					favorite.recipe.media?.map((media: any) => ({
						id: media.id.toString(),
						url: media.url,
						type: media.mediaType,
						publicId: '',
					})) || [],
				status: favorite.recipe.status,
				createdAt: favorite.recipe.createdAt,
				updatedAt: favorite.recipe.updatedAt,
			}));
		},
	});
}

// Fetch a single recipe by ID
export function useRecipe(recipeId: number) {
	return useQuery({
		queryKey: queryKeys.recipes.detail(recipeId),
		queryFn: async (): Promise<Recipe> => {
			const response = await fetch(`/api/recipes/${recipeId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch recipe');
			}
			return response.json();
		},
		enabled: !!recipeId,
	});
}

// Create a new recipe
export function useCreateRecipe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateRecipeData): Promise<{ recipeId: number }> => {
			const response = await fetch('/api/recipes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create recipe');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Recipe created successfully!');

			// Refetch all relevant queries using centralized helpers
			await Promise.all([
				refetchHelpers.refetchAllRecipes(queryClient),
				refetchHelpers.refetchRecipe(queryClient, data.recipeId),
				refetchHelpers.refetchDashboard(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create recipe');
		},
	});
}

// Update an existing recipe
export function useUpdateRecipe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateRecipeData): Promise<{ recipeId: number }> => {
			const response = await fetch(`/api/recipes/${data.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update recipe');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Recipe updated successfully!');

			// Refetch all relevant queries using centralized helpers
			await Promise.all([
				refetchHelpers.refetchAllRecipes(queryClient),
				refetchHelpers.refetchRecipe(queryClient, data.recipeId),
				refetchHelpers.refetchDashboard(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update recipe');
		},
	});
}

// Delete a recipe
export function useDeleteRecipe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (recipeId: number): Promise<void> => {
			const response = await fetch(`/api/recipes/${recipeId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete recipe');
			}
		},
		onSuccess: async (_, recipeId) => {
			toast.success('Recipe deleted successfully!');

			// Refetch all relevant queries using centralized helpers
			await Promise.all([
				refetchHelpers.refetchAllRecipes(queryClient),
				refetchHelpers.refetchDashboard(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete recipe');
		},
	});
}
