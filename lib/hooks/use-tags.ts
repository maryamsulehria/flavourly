import { useQuery } from '@tanstack/react-query';

interface Tag {
	id: number;
	tagName: string;
}

interface TagType {
	id: number;
	typeName: string;
	tags: Tag[];
}

export function usePublicTags() {
	return useQuery({
		queryKey: ['tags', 'public'],
		queryFn: async (): Promise<TagType[]> => {
			const response = await fetch('/api/tags/public');
			if (!response.ok) {
				throw new Error('Failed to fetch tags');
			}
			return response.json();
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
