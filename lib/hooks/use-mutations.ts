import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, refetchHelpers } from '../query-keys';

// ========= RECIPE MUTATIONS =========

export interface CreateRecipeData {
	title: string;
	description?: string;
	cookingTimeMinutes?: number;
	servings?: number;
	ingredients: Array<{
		name: string;
		quantity: string;
		unit: string;
		notes: string;
	}>;
	steps: string[];
	media: Array<{
		id: string;
		url: string;
		type: 'image' | 'video';
		publicId: string;
	}>;
}

export interface UpdateRecipeData extends CreateRecipeData {
	id: number;
}

// Create a new recipe
export function useCreateRecipe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateRecipeData): Promise<{ recipeId: number }> => {
			const response = await fetch('/api/recipes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
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
				headers: { 'Content-Type': 'application/json' },
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

// ========= REVIEW MUTATIONS =========

export interface CreateReviewData {
	recipeId: number;
	rating: number;
	comment?: string;
}

export interface UpdateReviewData extends CreateReviewData {
	id: number;
}

// Create a review
export function useCreateReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateReviewData): Promise<{ reviewId: number; recipeId: number }> => {
			const response = await fetch('/api/reviews', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create review');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Review submitted successfully!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.reviews.byRecipe(data.recipeId) }),
				queryClient.refetchQueries({ queryKey: queryKeys.reviews.user }),
				refetchHelpers.refetchAllRecipes(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create review');
		},
	});
}

// Update a review
export function useUpdateReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateReviewData): Promise<{ reviewId: number; recipeId: number }> => {
			const response = await fetch(`/api/reviews/${data.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update review');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Review updated successfully!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.reviews.byRecipe(data.recipeId) }),
				queryClient.refetchQueries({ queryKey: queryKeys.reviews.user }),
				refetchHelpers.refetchAllRecipes(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update review');
		},
	});
}

// Delete a review
export function useDeleteReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (reviewId: number): Promise<{ recipeId: number }> => {
			const response = await fetch(`/api/reviews/${reviewId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete review');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Review deleted successfully!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.reviews.byRecipe(data.recipeId) }),
				queryClient.refetchQueries({ queryKey: queryKeys.reviews.user }),
				refetchHelpers.refetchAllRecipes(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete review');
		},
	});
}

// ========= COLLECTION MUTATIONS =========

export interface CreateCollectionData {
	collectionName: string;
	description?: string;
}

export interface UpdateCollectionData extends CreateCollectionData {
	id: number;
}

// Create a new collection
export function useCreateCollection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateCollectionData): Promise<{ id: number }> => {
			const response = await fetch('/api/collections', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create collection');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Collection created successfully!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.collections.user }),
				refetchHelpers.refetchUserData(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create collection');
		},
	});
}

// Update an existing collection
export function useUpdateCollection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateCollectionData): Promise<{ id: number }> => {
			const response = await fetch(`/api/collections/${data.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update collection');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Collection updated successfully!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.collections.user }),
				queryClient.refetchQueries({ queryKey: queryKeys.collections.detail(data.id) }),
				refetchHelpers.refetchUserData(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update collection');
		},
	});
}

// Delete a collection
export function useDeleteCollection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (collectionId: number): Promise<void> => {
			const response = await fetch(`/api/collections/${collectionId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete collection');
			}
		},
		onSuccess: async (_, collectionId) => {
			toast.success('Collection deleted successfully!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.collections.user }),
				refetchHelpers.refetchUserData(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete collection');
		},
	});
}

// Add recipe to collection
export function useAddRecipeToCollection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			collectionId,
			recipeId,
		}: {
			collectionId: number;
			recipeId: number;
		}): Promise<void> => {
			const response = await fetch(`/api/collections/${collectionId}/recipes`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ recipeId }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to add recipe to collection');
			}
		},
		onSuccess: async (_, { collectionId }) => {
			toast.success('Recipe added to collection!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.collections.user }),
				queryClient.refetchQueries({ queryKey: queryKeys.collections.detail(collectionId) }),
				refetchHelpers.refetchUserData(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to add recipe to collection');
		},
	});
}

// Remove recipe from collection
export function useRemoveRecipeFromCollection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			collectionId,
			recipeId,
		}: {
			collectionId: number;
			recipeId: number;
		}): Promise<void> => {
			const response = await fetch(
				`/api/collections/${collectionId}/recipes?recipeId=${recipeId}`,
				{
					method: 'DELETE',
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to remove recipe from collection');
			}
		},
		onSuccess: async (_, { collectionId }) => {
			toast.success('Recipe removed from collection!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.collections.user }),
				queryClient.refetchQueries({ queryKey: queryKeys.collections.detail(collectionId) }),
				refetchHelpers.refetchUserData(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to remove recipe from collection');
		},
	});
}

// ========= MEAL PLAN MUTATIONS =========

export interface CreateMealPlanData {
	name: string;
	startDate: string;
	endDate: string;
	entries: Array<{
		recipeId: number;
		mealDate: string;
		mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
		servingsToPrepare: number;
	}>;
}

export interface UpdateMealPlanData extends CreateMealPlanData {
	id: number;
}

// Create a meal plan
export function useCreateMealPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateMealPlanData): Promise<{ mealPlanId: number }> => {
			const response = await fetch('/api/meal-plans', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create meal plan');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Meal plan created successfully!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.mealPlans.user }),
				queryClient.refetchQueries({ queryKey: queryKeys.mealPlans.detail(data.mealPlanId) }),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create meal plan');
		},
	});
}

// Update a meal plan
export function useUpdateMealPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateMealPlanData): Promise<{ mealPlanId: number }> => {
			const response = await fetch(`/api/meal-plans/${data.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update meal plan');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Meal plan updated successfully!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.mealPlans.user }),
				queryClient.refetchQueries({ queryKey: queryKeys.mealPlans.detail(data.mealPlanId) }),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update meal plan');
		},
	});
}

// Delete a meal plan
export function useDeleteMealPlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (mealPlanId: number): Promise<void> => {
			const response = await fetch(`/api/meal-plans/${mealPlanId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete meal plan');
			}
		},
		onSuccess: async () => {
			toast.success('Meal plan deleted successfully!');
			await queryClient.refetchQueries({ queryKey: queryKeys.mealPlans.user });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete meal plan');
		},
	});
}

// ========= FAVORITE MUTATIONS =========

// Add recipe to favorites
export function useAddToFavorites() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (recipeId: number): Promise<void> => {
			const response = await fetch(`/api/favorites/${recipeId}`, {
				method: 'POST',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to add to favorites');
			}
		},
		onSuccess: async (_, recipeId) => {
			toast.success('Added to favorites!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.favorites.user }),
				refetchHelpers.refetchRecipe(queryClient, recipeId),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to add to favorites');
		},
	});
}

// Remove recipe from favorites
export function useRemoveFromFavorites() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (recipeId: number): Promise<void> => {
			const response = await fetch(`/api/favorites/${recipeId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to remove from favorites');
			}
		},
		onSuccess: async (_, recipeId) => {
			toast.success('Removed from favorites!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.favorites.user }),
				refetchHelpers.refetchRecipe(queryClient, recipeId),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to remove from favorites');
		},
	});
}

// ========= NUTRITIONIST MUTATIONS =========

export interface VerifyRecipeData {
	recipeId: number;
	status: 'verified' | 'needs_revision';
	healthTips?: string;
}

// Resubmit recipe for nutritionist review
export function useResubmitRecipe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (recipeId: number): Promise<void> => {
			const response = await fetch(`/api/recipes/${recipeId}/resubmit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to resubmit recipe for review');
			}
		},
		onSuccess: async (_, recipeId) => {
			toast.success('Recipe resubmitted for nutritionist review!');
			await Promise.all([
				queryClient.refetchQueries({ queryKey: queryKeys.recipes.user }),
				queryClient.refetchQueries({ queryKey: queryKeys.recipes.detail(recipeId) }),
				refetchHelpers.refetchDashboard(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to resubmit recipe for review');
		},
	});
}

// Verify a recipe (Nutritionist only)
export function useVerifyRecipe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: VerifyRecipeData): Promise<{ recipeId: number }> => {
			const response = await fetch(`/api/recipes/${data.recipeId}/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to verify recipe');
			}

			return response.json();
		},
		onSuccess: async data => {
			toast.success('Recipe verification updated!');
			await Promise.all([
				refetchHelpers.refetchAllRecipes(queryClient),
				refetchHelpers.refetchRecipe(queryClient, data.recipeId),
				refetchHelpers.refetchDashboard(queryClient),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to verify recipe');
		},
	});
}

// ========= MEDIA MUTATIONS =========

// Upload media
export function useUploadMedia() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (file: File): Promise<{ url: string; publicId: string }> => {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to upload media');
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success('Media uploaded successfully!');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to upload media');
		},
	});
}

// Delete media
export function useDeleteMedia() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			publicId,
			recipeId,
		}: {
			publicId: string;
			recipeId: number;
		}): Promise<void> => {
			const response = await fetch(`/api/upload/${publicId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete media');
			}
		},
		onSuccess: async (_, { recipeId }) => {
			toast.success('Media deleted successfully!');
			await refetchHelpers.refetchRecipe(queryClient, recipeId);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete media');
		},
	});
}
