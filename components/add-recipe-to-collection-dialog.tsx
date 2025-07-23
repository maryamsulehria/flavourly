'use client';

import { RecipeCombobox } from '@/components/recipe-combobox';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAddRecipeToCollection } from '@/lib/hooks/use-mutations';
import { useUserFavorites, useUserRecipes } from '@/lib/hooks/use-queries';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

interface AddRecipeToCollectionDialogProps {
	collectionId: number;
	collectionName: string;
	onSuccess?: () => void;
}

export function AddRecipeToCollectionDialog({
	collectionId,
	collectionName,
	onSuccess,
}: AddRecipeToCollectionDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedRecipe, setSelectedRecipe] = useState('');
	const addRecipeToCollection = useAddRecipeToCollection();

	// Fetch both user's recipes and favorited recipes
	const { data: userRecipes, isLoading: userRecipesLoading } = useUserRecipes();
	const { data: userFavorites, isLoading: favoritesLoading } = useUserFavorites();

	// Transform recipes to match RecipeCombobox interface and combine with user recipes
	const allRecipes = useMemo(() => {
		if (!userRecipes && !userFavorites) return [];

		const userRecipeIds = new Set(userRecipes?.map((r: any) => r.id) || []);

		// Transform user recipes to match RecipeCombobox interface
		const transformedUserRecipes = (userRecipes || []).map((recipe: any) => ({
			id: recipe.id,
			title: recipe.title,
			cookingTimeMinutes: recipe.cookingTimeMinutes || undefined,
			servings: recipe.servings || undefined,
		}));

		const combined = [...transformedUserRecipes];

		// Add favorited recipes that aren't already in user recipes
		userFavorites?.forEach((favorite: any) => {
			if (!userRecipeIds.has(favorite.recipe.id)) {
				combined.push({
					id: favorite.recipe.id,
					title: favorite.recipe.title,
					cookingTimeMinutes: favorite.recipe.cookingTimeMinutes || undefined,
					servings: favorite.recipe.servings || undefined,
				});
			}
		});

		return combined;
	}, [userRecipes, userFavorites]);

	const isLoading = userRecipesLoading || favoritesLoading;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedRecipe) return;

		try {
			await addRecipeToCollection.mutateAsync({
				collectionId,
				recipeId: parseInt(selectedRecipe),
			});
			setIsOpen(false);
			setSelectedRecipe('');
			onSuccess?.();
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className='w-4 h-4 mr-2' />
					Add Recipe
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>Add Recipe to {collectionName}</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='recipe'>Select Recipe</Label>
						<RecipeCombobox
							recipes={allRecipes}
							value={selectedRecipe}
							onValueChange={setSelectedRecipe}
							placeholder='Search and select a recipe...'
							disabled={isLoading}
						/>
						{allRecipes.length > 0 && (
							<p className='text-xs text-muted-foreground'>
								{userRecipes?.length || 0} of your recipes • {userFavorites?.length || 0} favorited
								recipes
							</p>
						)}
					</div>
					<div className='flex justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setIsOpen(false)}>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={addRecipeToCollection.isPending || !selectedRecipe}>
							{addRecipeToCollection.isPending ? 'Adding...' : 'Add to Collection'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
