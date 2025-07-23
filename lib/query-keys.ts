// Centralized query key management for the entire app
// This ensures consistency and makes it easy to refetch related queries

export const queryKeys = {
	// User-related queries
	user: {
		profile: ['user', 'profile'] as const,
		session: ['user', 'session'] as const,
	},

	// Recipe-related queries
	recipes: {
		all: ['recipes'] as const,
		user: ['user-recipes'] as const,
		my: ['my-recipes'] as const,
		detail: (id: number) => ['recipe', id] as const,
		byStatus: (status: string) => ['recipes', 'status', status] as const,
		byAuthor: (authorId: number) => ['recipes', 'author', authorId] as const,
		verified: ['recipes', 'verified'] as const,
		pending: ['recipes', 'pending'] as const,
		public: (type: string, limit: number) => ['recipes', 'public', type, limit] as const,
	},

	// Ingredient-related queries
	ingredients: {
		all: ['ingredients'] as const,
		byName: (name: string) => ['ingredient', 'name', name] as const,
	},

	// Unit-related queries
	units: {
		all: ['units'] as const,
		byName: (name: string) => ['unit', 'name', name] as const,
	},

	// Media-related queries
	media: {
		byRecipe: (recipeId: number) => ['media', 'recipe', recipeId] as const,
	},

	// Review-related queries
	reviews: {
		byRecipe: (recipeId: number) => ['reviews', 'recipe', recipeId] as const,
		user: ['reviews', 'user'] as const,
	},

	// Favorite-related queries
	favorites: {
		user: ['favorites', 'user'] as const,
		byRecipe: (recipeId: number) => ['favorites', 'recipe', recipeId] as const,
	},

	// Collection-related queries
	collections: {
		all: ['collections'] as const,
		user: ['collections', 'user'] as const,
		detail: (id: number) => ['collection', id] as const,
	},

	// Meal plan-related queries
	mealPlans: {
		all: ['meal-plans'] as const,
		user: ['meal-plans', 'user'] as const,
		detail: (id: number) => ['meal-plan', id] as const,
		byDate: (date: string) => ['meal-plans', 'date', date] as const,
	},

	// Nutrition-related queries
	nutrition: {
		byRecipe: (recipeId: number) => ['nutrition', 'recipe', recipeId] as const,
		verified: ['nutrition', 'verified'] as const,
	},

	// Tag-related queries
	tags: {
		all: ['tags'] as const,
		byType: (type: string) => ['tags', 'type', type] as const,
		byRecipe: (recipeId: number) => ['tags', 'recipe', recipeId] as const,
	},

	// Dashboard-related queries
	dashboard: {
		stats: ['dashboard', 'stats'] as const,
		recent: ['dashboard', 'recent'] as const,
		queue: ['dashboard', 'queue'] as const,
	},

	// Search-related queries
	search: {
		recipes: (query: string) => ['search', 'recipes', query] as const,
		ingredients: (query: string) => ['search', 'ingredients', query] as const,
	},
} as const;

// Helper functions for refetching related queries
export const refetchHelpers = {
	// Refetch all recipe-related queries
	refetchAllRecipes: (queryClient: any) => {
		return Promise.all([
			queryClient.refetchQueries({ queryKey: queryKeys.recipes.all }),
			queryClient.refetchQueries({ queryKey: queryKeys.recipes.user }),
			queryClient.refetchQueries({ queryKey: queryKeys.recipes.my }),
			queryClient.refetchQueries({ queryKey: queryKeys.recipes.verified }),
			queryClient.refetchQueries({ queryKey: queryKeys.recipes.pending }),
		]);
	},

	// Refetch specific recipe and related data
	refetchRecipe: (queryClient: any, recipeId: number) => {
		return Promise.all([
			queryClient.refetchQueries({ queryKey: queryKeys.recipes.detail(recipeId) }),
			queryClient.refetchQueries({ queryKey: queryKeys.media.byRecipe(recipeId) }),
			queryClient.refetchQueries({ queryKey: queryKeys.reviews.byRecipe(recipeId) }),
			queryClient.refetchQueries({ queryKey: queryKeys.nutrition.byRecipe(recipeId) }),
			queryClient.refetchQueries({ queryKey: queryKeys.tags.byRecipe(recipeId) }),
		]);
	},

	// Refetch user-related queries
	refetchUserData: (queryClient: any) => {
		return Promise.all([
			queryClient.refetchQueries({ queryKey: queryKeys.user.profile }),
			queryClient.refetchQueries({ queryKey: queryKeys.recipes.user }),
			queryClient.refetchQueries({ queryKey: queryKeys.collections.user }),
			queryClient.refetchQueries({ queryKey: queryKeys.reviews.user }),
			queryClient.refetchQueries({ queryKey: queryKeys.mealPlans.user }),
		]);
	},

	// Refetch dashboard data
	refetchDashboard: (queryClient: any) => {
		return Promise.all([
			queryClient.refetchQueries({ queryKey: queryKeys.dashboard.stats }),
			queryClient.refetchQueries({ queryKey: queryKeys.dashboard.recent }),
			queryClient.refetchQueries({ queryKey: queryKeys.dashboard.queue }),
		]);
	},

	// Refetch all data (for major changes)
	refetchAll: (queryClient: any) => {
		return Promise.all([
			refetchHelpers.refetchAllRecipes(queryClient),
			refetchHelpers.refetchUserData(queryClient),
			refetchHelpers.refetchDashboard(queryClient),
		]);
	},
};
