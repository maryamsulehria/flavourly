import { VerificationStatus } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface NutritionistStats {
	pendingReviews: number;
	verifiedRecipes: number;
	totalRecipes: number;
}

export interface PendingRecipe {
	id: number;
	title: string;
	description: string | null;
	createdAt: string;
	author: {
		username: string;
		fullName: string | null;
		profilePicture: string | null;
	};
	_count: {
		ingredients: number;
	};
}

export interface VerifiedRecipe {
	id: number;
	title: string;
	description: string | null;
	verifiedAt: string | null;
	author: {
		username: string;
		fullName: string | null;
		profilePicture: string | null;
	};
	_count: {
		reviews: number;
	};
}

export interface UpdateRecipeStatusInput {
	recipeId: number;
	status: VerificationStatus;
	healthTips?: string;
}

export const useNutritionistStats = () => {
	return useQuery<NutritionistStats>({
		queryKey: ['nutritionist', 'stats'],
		queryFn: async () => {
			const response = await axios.get('/api/nutritionist/stats');
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 10 * 60 * 1000, // 10 minutes
	});
};

export const usePendingRecipes = (limit: number = 5) => {
	return useQuery<PendingRecipe[]>({
		queryKey: ['nutritionist', 'pending-recipes', limit],
		queryFn: async () => {
			const response = await axios.get(`/api/nutritionist/pending-recipes?limit=${limit}`);
			return response.data;
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval: 5 * 60 * 1000, // 5 minutes
	});
};

export const useVerifiedRecipes = (limit: number = 5) => {
	return useQuery<VerifiedRecipe[]>({
		queryKey: ['nutritionist', 'verified-recipes', limit],
		queryFn: async () => {
			const response = await axios.get(`/api/nutritionist/verified-recipes?limit=${limit}`);
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 10 * 60 * 1000, // 10 minutes
	});
};

// Mutation to update recipe verification status
export const useUpdateRecipeStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ recipeId, status, healthTips }: UpdateRecipeStatusInput) => {
			const response = await axios.patch(`/api/recipes/${recipeId}/update-status`, {
				status,
				healthTips,
			});
			return response.data;
		},
		onSuccess: () => {
			// Invalidate relevant queries to refresh data
			queryClient.invalidateQueries({ queryKey: ['nutritionist', 'stats'] });
			queryClient.invalidateQueries({
				queryKey: ['nutritionist', 'pending-recipes'],
			});
			queryClient.invalidateQueries({
				queryKey: ['nutritionist', 'verified-recipes'],
			});
			queryClient.invalidateQueries({
				queryKey: ['nutritionist', 'queue', 'recipes'],
			});
		},
	});
};
