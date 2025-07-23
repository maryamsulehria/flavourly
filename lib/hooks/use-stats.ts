import { useQuery } from '@tanstack/react-query';

interface Stats {
	verifiedRecipes: number;
	nutritionists: number;
}

export function useStats() {
	return useQuery({
		queryKey: ['stats'],
		queryFn: async (): Promise<Stats> => {
			const response = await fetch('/api/stats');
			if (!response.ok) {
				throw new Error('Failed to fetch stats');
			}
			return response.json();
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
