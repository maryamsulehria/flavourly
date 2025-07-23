import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

// ========= RECIPE QUERIES =========

export interface Recipe {
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
		profilePicture: string | null;
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
		proteinGrams: number | null;
		carbohydratesGrams: number | null;
		fatGrams: number | null;
		fiberGrams: number | null;
		sugarGrams: number | null;
		sodiumMg: number | null;
		dataSource: 'estimated_api' | 'verified_nutritionist';
	} | null;
	steps: Array<{
		id: number;
		stepNumber: number;
		instruction: string;
	}>;
	ingredients: Array<{
		recipeId: number;
		ingredientId: number;
		quantity: number;
		notes: string | null;
		ingredient: {
			id: number;
			name: string;
		};
		unit: {
			id: number;
			unitName: string;
			abbreviation: string | null;
		};
	}>;
	tags?: Array<{
		tag: {
			tagName: string;
			tagType: {
				typeName: string;
			};
		};
	}>;
	reviews: Array<{
		id: number;
		rating: number;
		comment: string | null;
		createdAt: string;
		user: {
			id: number;
			username: string;
			fullName: string | null;
		};
	}>;
	averageRating: number | null;
	reviewCount: number;
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

// Fetch all recipes (for nutritionist)
export function useAllRecipes() {
	return useQuery({
		queryKey: queryKeys.recipes.all,
		queryFn: async (): Promise<Recipe[]> => {
			const response = await fetch('/api/recipes');
			if (!response.ok) {
				throw new Error('Failed to fetch recipes');
			}
			return response.json();
		},
	});
}

// Fetch recipes by status
export function useRecipesByStatus(status: string) {
	return useQuery({
		queryKey: queryKeys.recipes.byStatus(status),
		queryFn: async (): Promise<Recipe[]> => {
			const response = await fetch(`/api/recipes?status=${status}`);
			if (!response.ok) {
				throw new Error('Failed to fetch recipes');
			}
			return response.json();
		},
		enabled: !!status,
	});
}

// Fetch verified recipes
export function useVerifiedRecipes() {
	return useQuery({
		queryKey: queryKeys.recipes.verified,
		queryFn: async (): Promise<Recipe[]> => {
			const response = await fetch('/api/recipes?status=verified');
			if (!response.ok) {
				throw new Error('Failed to fetch verified recipes');
			}
			return response.json();
		},
	});
}

// Fetch public recipes for homepage
export function usePublicRecipes(type: 'verified' | 'popular' | 'recent', limit: number = 6) {
	return useQuery({
		queryKey: queryKeys.recipes.public(type, limit),
		queryFn: async (): Promise<Recipe[]> => {
			// Map the old type parameter to the new sort parameter
			let sortBy = 'recent';
			if (type === 'popular') sortBy = 'popular';
			if (type === 'verified') sortBy = 'recent'; // Verified recipes are sorted by recent by default

			const response = await fetch(`/api/recipes/public?sort=${sortBy}&limit=${limit}`);
			if (!response.ok) {
				throw new Error('Failed to fetch public recipes');
			}
			const data = await response.json();
			// Return the recipes array from the new API response structure
			return data.recipes || [];
		},
	});
}

// Fetch filtered public recipes
export function useFilteredPublicRecipes(filters: {
	search?: string;
	sort?: string;
	mealType?: string[];
	dietary?: string[];
	allergies?: string[];
	cuisine?: string[];
	time?: string;
	difficulty?: string;
	rating?: string;
	cookingMethod?: string[];
	health?: string[];
	page?: number;
	limit?: number;
}) {
	return useQuery({
		queryKey: ['recipes', 'public', 'filtered', filters],
		queryFn: async (): Promise<{ recipes: Recipe[]; totalCount: number }> => {
			const params = new URLSearchParams();

			if (filters.search) params.set('search', filters.search);
			if (filters.sort) params.set('sort', filters.sort);
			if (filters.mealType?.length) params.set('mealType', filters.mealType.join(','));
			if (filters.dietary?.length) params.set('dietary', filters.dietary.join(','));
			if (filters.allergies?.length) params.set('allergies', filters.allergies.join(','));
			if (filters.cuisine?.length) params.set('cuisine', filters.cuisine.join(','));
			if (filters.time) params.set('time', filters.time);
			if (filters.difficulty) params.set('difficulty', filters.difficulty);
			if (filters.rating) params.set('rating', filters.rating);
			if (filters.cookingMethod?.length)
				params.set('cookingMethod', filters.cookingMethod.join(','));
			if (filters.health?.length) params.set('health', filters.health.join(','));
			if (filters.page) params.set('page', filters.page.toString());
			if (filters.limit) params.set('limit', filters.limit.toString());

			const response = await fetch(`/api/recipes/public?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch filtered recipes');
			}
			return response.json();
		},
	});
}

// Fetch pending recipes
export function usePendingRecipes() {
	return useQuery({
		queryKey: queryKeys.recipes.pending,
		queryFn: async (): Promise<Recipe[]> => {
			const response = await fetch('/api/recipes?status=pending_verification');
			if (!response.ok) {
				throw new Error('Failed to fetch pending recipes');
			}
			return response.json();
		},
	});
}

// ========= FAVORITES QUERIES =========

export interface FavoriteRecipe {
	id: number;
	createdAt: string;
	recipe: Recipe;
}

// Fetch user's favorite recipes
export function useUserFavorites() {
	return useQuery({
		queryKey: queryKeys.favorites.user,
		queryFn: async (): Promise<FavoriteRecipe[]> => {
			const response = await fetch('/api/favorites');
			if (!response.ok) {
				throw new Error('Failed to fetch favorites');
			}
			return response.json();
		},
	});
}

// ========= REVIEW QUERIES =========

export interface Review {
	id: number;
	rating: number;
	comment: string | null;
	createdAt: string;
	user: {
		id: number;
		username: string;
		fullName: string | null;
	};
}

// Fetch reviews for a recipe
export function useRecipeReviews(recipeId: number) {
	return useQuery({
		queryKey: queryKeys.reviews.byRecipe(recipeId),
		queryFn: async (): Promise<Review[]> => {
			const response = await fetch(`/api/recipes/${recipeId}/reviews`);
			if (!response.ok) {
				throw new Error('Failed to fetch reviews');
			}
			return response.json();
		},
		enabled: !!recipeId,
	});
}

// Fetch user's reviews
export function useUserReviews() {
	return useQuery({
		queryKey: queryKeys.reviews.user,
		queryFn: async (): Promise<Review[]> => {
			const response = await fetch('/api/reviews/my-reviews');
			if (!response.ok) {
				throw new Error('Failed to fetch user reviews');
			}
			return response.json();
		},
	});
}

// ========= COLLECTION QUERIES =========

export interface Collection {
	id: number;
	collectionName: string;
	description: string | null;
	createdAt: string;
	recipeCount: number;
	firstImage: string | null;
}

export interface CollectionDetail extends Collection {
	recipes: Array<{
		recipe: Recipe;
	}>;
}

// Fetch user's collections
export function useUserCollections() {
	return useQuery({
		queryKey: queryKeys.collections.user,
		queryFn: async (): Promise<Collection[]> => {
			const response = await fetch('/api/collections');
			if (!response.ok) {
				throw new Error('Failed to fetch collections');
			}
			return response.json();
		},
	});
}

// Fetch a single collection by ID
export function useCollection(collectionId: number) {
	return useQuery({
		queryKey: queryKeys.collections.detail(collectionId),
		queryFn: async (): Promise<CollectionDetail> => {
			const response = await fetch(`/api/collections/${collectionId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch collection');
			}
			return response.json();
		},
		enabled: !!collectionId,
	});
}

// ========= MEAL PLAN QUERIES =========

export interface MealPlan {
	id: number;
	name: string;
	startDate: string;
	endDate: string;
	createdAt: string;
	entries: Array<{
		id: number;
		mealDate: string;
		mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
		servingsToPrepare: number;
		recipe: Recipe;
	}>;
}

// Fetch user's meal plans
export function useUserMealPlans() {
	return useQuery({
		queryKey: queryKeys.mealPlans.user,
		queryFn: async (): Promise<MealPlan[]> => {
			const response = await fetch('/api/meal-plans');
			if (!response.ok) {
				throw new Error('Failed to fetch meal plans');
			}
			return response.json();
		},
	});
}

// Fetch a single meal plan
export function useMealPlan(mealPlanId: number) {
	return useQuery({
		queryKey: queryKeys.mealPlans.detail(mealPlanId),
		queryFn: async (): Promise<MealPlan> => {
			const response = await fetch(`/api/meal-plans/${mealPlanId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch meal plan');
			}
			return response.json();
		},
		enabled: !!mealPlanId,
	});
}

// Fetch meal plans by date
export function useMealPlansByDate(date: string) {
	return useQuery({
		queryKey: queryKeys.mealPlans.byDate(date),
		queryFn: async (): Promise<MealPlan[]> => {
			const response = await fetch(`/api/meal-plans?date=${date}`);
			if (!response.ok) {
				throw new Error('Failed to fetch meal plans');
			}
			return response.json();
		},
		enabled: !!date,
	});
}

// ========= INGREDIENT QUERIES =========

export interface Ingredient {
	id: number;
	name: string;
}

// Fetch all ingredients
export function useIngredients() {
	return useQuery({
		queryKey: queryKeys.ingredients.all,
		queryFn: async (): Promise<Ingredient[]> => {
			const response = await fetch('/api/ingredients');
			if (!response.ok) {
				throw new Error('Failed to fetch ingredients');
			}
			return response.json();
		},
	});
}

// Fetch ingredient by name
export function useIngredientByName(name: string) {
	return useQuery({
		queryKey: queryKeys.ingredients.byName(name),
		queryFn: async (): Promise<Ingredient> => {
			const response = await fetch(`/api/ingredients/${encodeURIComponent(name)}`);
			if (!response.ok) {
				throw new Error('Failed to fetch ingredient');
			}
			return response.json();
		},
		enabled: !!name,
	});
}

// ========= UNIT QUERIES =========

export interface Unit {
	id: number;
	name: string;
	abbreviation: string | null;
}

// Fetch all units
export function useUnits() {
	return useQuery({
		queryKey: queryKeys.units.all,
		queryFn: async (): Promise<Unit[]> => {
			const response = await fetch('/api/units');
			if (!response.ok) {
				throw new Error('Failed to fetch units');
			}
			return response.json();
		},
	});
}

// Fetch unit by name
export function useUnitByName(name: string) {
	return useQuery({
		queryKey: queryKeys.units.byName(name),
		queryFn: async (): Promise<Unit> => {
			const response = await fetch(`/api/units/${encodeURIComponent(name)}`);
			if (!response.ok) {
				throw new Error('Failed to fetch unit');
			}
			return response.json();
		},
		enabled: !!name,
	});
}

// ========= DASHBOARD QUERIES =========

export interface DashboardStats {
	totalRecipes: number;
	verifiedRecipes: number;
	pendingRecipes: number;
	totalReviews: number;
	averageRating: number;
	recentActivity: Array<{
		id: number;
		type: 'recipe_created' | 'recipe_verified' | 'review_added';
		title: string;
		createdAt: string;
	}>;
}

// Fetch dashboard stats
export function useDashboardStats() {
	return useQuery({
		queryKey: queryKeys.dashboard.stats,
		queryFn: async (): Promise<DashboardStats> => {
			const response = await fetch('/api/dashboard/stats');
			if (!response.ok) {
				throw new Error('Failed to fetch dashboard stats');
			}
			return response.json();
		},
	});
}

// Fetch recent activity
export function useRecentActivity() {
	return useQuery({
		queryKey: queryKeys.dashboard.recent,
		queryFn: async (): Promise<DashboardStats['recentActivity']> => {
			const response = await fetch('/api/dashboard/recent');
			if (!response.ok) {
				throw new Error('Failed to fetch recent activity');
			}
			return response.json();
		},
	});
}

// Fetch verification queue (for nutritionists)
export function useVerificationQueue() {
	return useQuery({
		queryKey: queryKeys.dashboard.queue,
		queryFn: async (): Promise<Recipe[]> => {
			const response = await fetch('/api/dashboard/verification-queue');
			if (!response.ok) {
				throw new Error('Failed to fetch verification queue');
			}
			return response.json();
		},
	});
}

// ========= SEARCH QUERIES =========

// Search recipes
export function useSearchRecipes(query: string) {
	return useQuery({
		queryKey: queryKeys.search.recipes(query),
		queryFn: async (): Promise<Recipe[]> => {
			const response = await fetch(`/api/search/recipes?q=${encodeURIComponent(query)}`);
			if (!response.ok) {
				throw new Error('Failed to search recipes');
			}
			return response.json();
		},
		enabled: !!query && query.length >= 2,
	});
}

// Search ingredients
export function useSearchIngredients(query: string) {
	return useQuery({
		queryKey: queryKeys.search.ingredients(query),
		queryFn: async (): Promise<Ingredient[]> => {
			const response = await fetch(`/api/search/ingredients?q=${encodeURIComponent(query)}`);
			if (!response.ok) {
				throw new Error('Failed to search ingredients');
			}
			return response.json();
		},
		enabled: !!query && query.length >= 2,
	});
}

// ========= USER QUERIES =========

export interface UserProfile {
	id: number;
	username: string;
	email: string;
	fullName: string | null;
	role: {
		id: number;
		name: string;
	};
	createdAt: string;
	stats: {
		totalRecipes: number;
		totalReviews: number;
		totalCollections: number;
		totalMealPlans: number;
	};
}

// Fetch user profile
export function useUserProfile() {
	return useQuery({
		queryKey: queryKeys.user.profile,
		queryFn: async (): Promise<UserProfile> => {
			const response = await fetch('/api/user/profile');
			if (!response.ok) {
				throw new Error('Failed to fetch user profile');
			}
			return response.json();
		},
	});
}
