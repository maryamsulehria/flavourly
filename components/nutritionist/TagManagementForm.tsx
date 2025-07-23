'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Save, Tags, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DetailedRecipe } from './RecipeVerificationForm';

interface TagType {
	id: number;
	typeName: string;
	tags: Array<{
		id: number;
		tagName: string;
	}>;
}

interface TagManagementFormProps {
	recipe: DetailedRecipe;
	onUpdate: (tags: any) => void;
}

export default function TagManagementForm({ recipe, onUpdate }: TagManagementFormProps) {
	const [selectedTags, setSelectedTags] = useState<number[]>([]);
	const [newTagName, setNewTagName] = useState('');
	const [selectedTagType, setSelectedTagType] = useState<string>('');
	const queryClient = useQueryClient();

	// Fetch available tag types and tags
	const { data: tagTypes, isLoading } = useQuery<TagType[]>({
		queryKey: ['tagTypes'],
		queryFn: async () => {
			const response = await axios.get('/api/tags');
			return response.data;
		},
	});

	// Mutation to create new tag
	const createTagMutation = useMutation({
		mutationFn: async ({ tagName, tagTypeId }: { tagName: string; tagTypeId: number }) => {
			const response = await axios.post('/api/tags', {
				tagName,
				tagTypeId,
			});
			return response.data;
		},
		onSuccess: data => {
			// Refresh tag types to include the new tag
			queryClient.invalidateQueries({ queryKey: ['tagTypes'] });
			// Add the new tag to selected tags
			setSelectedTags(prev => [...prev, data.tag.id]);
			setNewTagName('');
			setSelectedTagType('');
			toast.success('Tag created successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.error || 'Failed to create tag');
		},
	});

	// Initialize selected tags from recipe
	useEffect(() => {
		if (recipe?.tags && Array.isArray(recipe.tags)) {
			const tagIds = recipe.tags
				.filter(item => item && item.tag && item.tag.id) // Filter out null/undefined items
				.map(({ tag }) => tag.id);
			setSelectedTags(tagIds);
		} else {
			setSelectedTags([]); // Reset to empty array if no tags
		}
	}, [recipe?.tags]);

	const handleTagToggle = (tagId: number) => {
		setSelectedTags(prev =>
			prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId],
		);
	};

	const handleAddNewTag = () => {
		if (!newTagName.trim() || !selectedTagType) return;

		const tagTypeId = parseInt(selectedTagType);
		if (isNaN(tagTypeId)) return;

		createTagMutation.mutate({ tagName: newTagName, tagTypeId });
	};

	const handleSave = () => {
		onUpdate(selectedTags);
	};

	const handleSuggestionClick = (tagName: string) => {
		// Find the tag in the available tags
		const tag = tagTypes?.flatMap(tt => tt.tags).find(t => t.tagName === tagName);

		if (tag && !selectedTags.includes(tag.id)) {
			setSelectedTags(prev => [...prev, tag.id]);
		}
	};

	const getTagsByType = (typeName: string) => {
		const tagType = tagTypes?.find(tt => tt.typeName === typeName);
		return tagType?.tags || [];
	};

	const getSelectedTagsByType = (typeName: string) => {
		const typeTagIds = getTagsByType(typeName).map(tag => tag.id);
		return selectedTags.filter(tagId => typeTagIds.includes(tagId));
	};

	const commonTagTypes = [
		{
			name: 'Dietary',
			examples: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb'],
		},
		{
			name: 'Cuisine',
			examples: ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American'],
		},
		{
			name: 'Meal Type',
			examples: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'],
		},
		{
			name: 'Cooking Method',
			examples: ['Baked', 'Grilled', 'Fried', 'Steamed', 'Raw'],
		},
		{ name: 'Difficulty', examples: ['Easy', 'Medium', 'Hard'] },
		{
			name: 'Health',
			examples: ['Heart-Healthy', 'High-Protein', 'Low-Sodium', 'Anti-Inflammatory'],
		},
	];

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Loading tags...</CardTitle>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<Tags className='h-5 w-5 mr-2' />
						Tag Management
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Current Tags Summary */}
					<div className='space-y-3'>
						<Label>Currently Selected Tags</Label>
						<div className='flex flex-wrap gap-2 p-3 bg-muted rounded-lg min-h-[60px]'>
							{selectedTags.length === 0 ? (
								<p className='text-muted-foreground text-sm'>No tags selected</p>
							) : (
								selectedTags.map(tagId => {
									const tag = tagTypes?.flatMap(tt => tt.tags).find(t => t.id === tagId);
									const tagType = tagTypes?.find(tt => tt.tags.some(t => t.id === tagId));
									return tag ? (
										<Badge
											key={tagId}
											variant='secondary'
											className='flex items-center gap-1'>
											<span className='text-xs text-muted-foreground'>{tagType?.typeName}:</span>
											{tag.tagName}
											<X
												className='h-3 w-3 cursor-pointer hover:text-destructive'
												onClick={() => handleTagToggle(tagId)}
											/>
										</Badge>
									) : null;
								})
							)}
						</div>
					</div>

					<Separator />

					{/* Tag Categories */}
					<div className='space-y-6'>
						{commonTagTypes.map(({ name: typeName }) => {
							const availableTags = getTagsByType(typeName);
							const selectedInType = getSelectedTagsByType(typeName);

							return (
								<div
									key={typeName}
									className='space-y-3'>
									<div className='flex items-center justify-between'>
										<Label className='text-base font-semibold'>{typeName}</Label>
										<Badge variant='outline'>{selectedInType.length} selected</Badge>
									</div>
									<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
										{availableTags.map(tag => (
											<div
												key={tag.id}
												className='flex items-center space-x-2'>
												<Checkbox
													id={`tag-${tag.id}`}
													checked={selectedTags.includes(tag.id)}
													onCheckedChange={() => handleTagToggle(tag.id)}
												/>
												<Label
													htmlFor={`tag-${tag.id}`}
													className='text-sm cursor-pointer'>
													{tag.tagName}
												</Label>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>

					<Separator />

					{/* Add New Tag */}
					<div className='space-y-4'>
						<Label className='text-base font-semibold'>Add New Tag</Label>
						<div className='flex gap-2'>
							<div className='flex-1'>
								<Input
									placeholder='Enter tag name'
									value={newTagName}
									onChange={e => setNewTagName(e.target.value)}
								/>
							</div>
							<div className='w-48'>
								<Select
									value={selectedTagType}
									onValueChange={setSelectedTagType}>
									<SelectTrigger>
										<SelectValue placeholder='Select type' />
									</SelectTrigger>
									<SelectContent>
										{tagTypes?.map(tagType => (
											<SelectItem
												key={tagType.id}
												value={tagType.id.toString()}>
												{tagType.typeName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button
								onClick={handleAddNewTag}
								variant='outline'
								size='icon'
								disabled={!newTagName.trim() || !selectedTagType || createTagMutation.isPending}>
								<Plus className='h-4 w-4' />
							</Button>
						</div>
					</div>

					<Separator />

					{/* Tag Suggestions */}
					<div className='space-y-3'>
						<Label className='text-base font-semibold'>Suggested Tags</Label>
						<p className='text-sm text-muted-foreground'>
							Based on the recipe ingredients and instructions, consider adding these tags:
						</p>
						<div className='flex flex-wrap gap-2'>
							{/* Generate suggestions based on recipe data */}
							{recipe.ingredients.some(
								ing =>
									ing.ingredient?.name?.toLowerCase().includes('chicken') ||
									ing.ingredient?.name?.toLowerCase().includes('beef') ||
									ing.ingredient?.name?.toLowerCase().includes('fish'),
							) && (
								<Badge
									variant='outline'
									className='cursor-pointer hover:bg-muted'
									onClick={() => handleSuggestionClick('High-Protein')}>
									+ High-Protein
								</Badge>
							)}
							{recipe.cookingTimeMinutes && recipe.cookingTimeMinutes <= 30 && (
								<Badge
									variant='outline'
									className='cursor-pointer hover:bg-muted'
									onClick={() => handleSuggestionClick('Quick & Easy')}>
									+ Quick & Easy
								</Badge>
							)}
							{recipe.ingredients.length <= 5 && (
								<Badge
									variant='outline'
									className='cursor-pointer hover:bg-muted'
									onClick={() => handleSuggestionClick('Simple')}>
									+ Simple
								</Badge>
							)}
							{recipe.ingredients.some(
								ing =>
									ing.ingredient?.name?.toLowerCase().includes('vegetable') ||
									ing.ingredient?.name?.toLowerCase().includes('spinach') ||
									ing.ingredient?.name?.toLowerCase().includes('broccoli'),
							) && (
								<Badge
									variant='outline'
									className='cursor-pointer hover:bg-muted'
									onClick={() => handleSuggestionClick('Healthy')}>
									+ Healthy
								</Badge>
							)}
						</div>
					</div>

					<div className='flex justify-end'>
						<Button
							onClick={handleSave}
							className='flex items-center'>
							<Save className='h-4 w-4 mr-2' />
							Save Tags
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
