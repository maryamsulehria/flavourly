import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

interface Recipe {
	id: number;
	title: string;
	description: string | null;
	cookingTimeMinutes: number | null;
	servings: number | null;
	status: 'pending_verification' | 'verified' | 'needs_revision';
	verifiedAt: string | null;
	healthTips: string | null;
	createdAt: string;
	updatedAt: string;
	authorId: number;
	verifiedById: number | null;
	author: {
		id: number;
		username: string;
		fullName: string | null;
	};
	verifiedBy: {
		id: number;
		username: string;
		fullName: string | null;
		profilePicture: string | null;
	} | null;
	media: Array<{
		id: number;
		url: string;
		caption: string | null;
		mediaType: string;
	}>;
	nutritionalInfo: {
		calories: number | null;
		dataSource: 'estimated_api' | 'verified_nutritionist';
	} | null;
	averageRating: number | null;
	reviewCount: number;
}

async function fetchMyRecipes(): Promise<Recipe[]> {
	const response = await fetch('/api/recipes/my-recipes');
	if (!response.ok) {
		throw new Error('Failed to fetch recipes');
	}
	return response.json();
}

export function useMyRecipes() {
	return useQuery({
		queryKey: queryKeys.recipes.my,
		queryFn: fetchMyRecipes,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
