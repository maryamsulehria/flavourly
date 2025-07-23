'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRemoveFromFavorites } from '@/lib/hooks/use-mutations';
import { useUserFavorites, type FavoriteRecipe } from '@/lib/hooks/use-queries';
import { ChefHat, Clock, Eye, Heart, Star, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
	const { data: favorites, isLoading, error } = useUserFavorites();
	const removeFromFavorites = useRemoveFromFavorites();
	const router = useRouter();

	const handleRemoveFavorite = async (recipeId: number, recipeTitle: string) => {
		try {
			await removeFromFavorites.mutateAsync(recipeId);
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	const handleViewRecipe = (recipeId: number) => {
		router.push(`/recipes/${recipeId}`);
	};

	if (error) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold text-destructive mb-4'>Error Loading Favorites</h1>
					<p className='text-muted-foreground mb-4'>
						There was an error loading your favorite recipes.
					</p>
					<Button onClick={() => window.location.reload()}>Try Again</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex items-center gap-3 mb-2'>
					<Heart className='h-8 w-8 text-primary' />
					<h1 className='text-3xl font-bold'>My Favorites</h1>
				</div>
				<p className='text-muted-foreground'>
					Your collection of favorite recipes, saved for quick access.
				</p>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{Array.from({ length: 8 }).map((_, index) => (
						<Card
							key={index}
							className='overflow-hidden'>
							<Skeleton className='h-48 w-full' />
							<CardHeader className='pb-3'>
								<Skeleton className='h-6 w-3/4 mb-2' />
								<Skeleton className='h-4 w-full' />
							</CardHeader>
							<CardFooter className='pt-0'>
								<div className='flex items-center gap-4 w-full'>
									<Skeleton className='h-4 w-16' />
									<Skeleton className='h-4 w-16' />
									<Skeleton className='h-4 w-16' />
								</div>
							</CardFooter>
						</Card>
					))}
				</div>
			) : favorites && favorites.length > 0 ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{favorites.map((favorite: FavoriteRecipe) => {
						const recipe = favorite.recipe;
						const mainImage = recipe.media.find((m: any) => m.mediaType === 'image');

						return (
							<Card
								key={`favorite-${favorite.id}-${recipe.id}`}
								className='group overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full'>
								{/* Recipe Image */}
								<div className='relative aspect-square overflow-hidden p-4'>
									{mainImage ? (
										<div className='w-full h-full relative'>
											<img
												src={mainImage.url}
												alt={recipe.title}
												className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg'
											/>
										</div>
									) : (
										<div className='w-full h-full bg-muted flex items-center justify-center rounded-lg'>
											<ChefHat className='h-12 w-12 text-muted-foreground' />
										</div>
									)}

									{/* Remove Favorite Button Only */}
									<div className='absolute top-7 right-7 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
										<Button
											size='sm'
											variant='destructive'
											className='h-8 w-8 p-0'
											onClick={() => handleRemoveFavorite(recipe.id, recipe.title)}
											disabled={removeFromFavorites.isPending}>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>
								</div>

								{/* Recipe Info */}
								<div className='flex flex-col flex-1 p-4'>
									{/* Top Content */}
									<div className='flex-1'>
										<h3 className='font-semibold text-lg line-clamp-2 mb-2'>{recipe.title}</h3>
										{recipe.description && (
											<p className='text-sm text-muted-foreground line-clamp-2 mb-3'>
												{recipe.description}
											</p>
										)}
										{/* Status Badge */}
										{recipe.status === 'verified' && (
											<Badge
												variant='default'
												className='text-xs mb-3'>
												Verified
											</Badge>
										)}

										{/* Metadata */}
										<div className='flex items-center justify-between w-full text-sm text-muted-foreground mb-3'>
											{/* Cooking Time */}
											{recipe.cookingTimeMinutes && (
												<div className='flex items-center gap-1'>
													<Clock className='h-4 w-4' />
													<span>{recipe.cookingTimeMinutes}m</span>
												</div>
											)}

											{/* Servings */}
											{recipe.servings && (
												<div className='flex items-center gap-1'>
													<Users className='h-4 w-4' />
													<span>{recipe.servings}</span>
												</div>
											)}

											{/* Rating */}
											{recipe.averageRating && (
												<div className='flex items-center gap-1'>
													<Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
													<span>{recipe.averageRating.toFixed(1)}</span>
												</div>
											)}
										</div>
									</div>

									{/* Bottom Content - View Recipe Button (always at bottom) */}
									<div className='mt-auto'>
										<Button
											onClick={() => handleViewRecipe(recipe.id)}
											className='w-full'
											variant='outline'>
											<Eye className='h-4 w-4 mr-2' />
											View Recipe
										</Button>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			) : (
				<div className='text-center py-12'>
					<Heart className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
					<h2 className='text-xl font-semibold mb-2'>No favorites yet</h2>
					<p className='text-muted-foreground mb-6'>
						Start exploring recipes and add them to your favorites for quick access.
					</p>
					<div className='flex gap-4 justify-center'>
						<Button onClick={() => router.push('/recipes')}>Browse Recipes</Button>
					</div>
				</div>
			)}

			{/* Footer Stats */}
			{favorites && favorites.length > 0 && (
				<div className='mt-8 pt-6 border-t'>
					<div className='flex items-center justify-between text-sm text-muted-foreground'>
						<span>
							{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
						</span>
						<span>Last updated: {new Date().toLocaleDateString()}</span>
					</div>
				</div>
			)}
		</div>
	);
}
