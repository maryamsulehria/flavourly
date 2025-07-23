'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PendingRecipe, VerifiedRecipe } from '@/lib/hooks/useNutritionistData';
import { ArrowRight, ChefHat, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RecentRecipesProps {
	title: string;
	recipes:
		| PendingRecipe[]
		| VerifiedRecipe[]
		| {
				recipes: Array<PendingRecipe | VerifiedRecipe>;
				totalCount: number;
				hasMore: boolean;
				nextCursor: string | null;
		  };
	isLoading?: boolean;
	type: 'pending' | 'verified';
	onViewAll: () => void;
}

export default function RecentRecipes({
	title,
	recipes,
	isLoading,
	type,
	onViewAll,
}: RecentRecipesProps) {
	const router = useRouter();

	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			});
		} catch (error) {
			return 'Invalid date';
		}
	};

	const handleRecipeClick = (recipeId: number) => {
		if (type === 'pending') {
			router.push(`/nutritionist/review/${recipeId}`);
		} else {
			router.push(`/recipes/${recipeId}`);
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-40' />
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{[1, 2, 3].map(i => (
							<div
								key={i}
								className='flex items-center space-x-4'>
								<Skeleton className='h-12 w-12 rounded-lg' />
								<div className='flex-1'>
									<Skeleton className='h-4 w-32 mb-2' />
									<Skeleton className='h-3 w-24' />
								</div>
								<Skeleton className='h-8 w-16' />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Handle the case where recipes might have a different structure
	const recipeArray = Array.isArray(recipes) ? recipes : (recipes as any)?.recipes || [];

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle className='text-lg font-semibold'>{title}</CardTitle>
					<Button
						variant='ghost'
						size='sm'
						onClick={onViewAll}
						className='text-primary hover:text-primary/80'>
						View All
						<ArrowRight className='ml-1 h-4 w-4' />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{recipeArray.length === 0 ? (
					<div className='text-center py-8'>
						<ChefHat className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
						<p className='text-muted-foreground'>
							{type === 'pending' ? 'No pending recipes to review' : 'No verified recipes yet'}
						</p>
					</div>
				) : (
					<div className='space-y-4'>
						{recipeArray.map((recipe: PendingRecipe | VerifiedRecipe) => (
							<div
								key={recipe.id}
								className='flex items-center space-x-4 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors'
								onClick={() => handleRecipeClick(recipe.id)}>
								<div className='w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center'>
									<ChefHat className='h-6 w-6 text-primary-foreground' />
								</div>

								<div className='flex-1 min-w-0'>
									<h4 className='text-sm font-medium text-foreground truncate'>{recipe.title}</h4>
									<div className='flex items-center space-x-2 mt-1'>
										<div className='flex items-center text-xs text-muted-foreground'>
											<Avatar className='h-4 w-4 mr-1'>
												<AvatarImage src={recipe.author?.profilePicture || undefined} />
												<AvatarFallback className='text-xs'>
													{recipe.author?.fullName?.charAt(0) || recipe.author?.username?.charAt(0)}
												</AvatarFallback>
											</Avatar>
											{recipe.author?.fullName || recipe.author?.username || 'Unknown author'}
										</div>
										<div className='flex items-center text-xs text-muted-foreground'>
											<Clock className='h-3 w-3 mr-1' />
											{type === 'pending'
												? formatDate(
														(recipe as PendingRecipe).createdAt || new Date().toISOString(),
												  )
												: formatDate(
														(recipe as VerifiedRecipe).verifiedAt || new Date().toISOString(),
												  )}
										</div>
									</div>
								</div>

								<div className='flex items-center space-x-2'>
									{type === 'pending' ? (
										<Badge
											variant='secondary'
											className='text-xs'>
											{(recipe as PendingRecipe)._count?.ingredients || 0} ingredients
										</Badge>
									) : (
										<div className='flex items-center text-xs text-muted-foreground'>
											<Star className='h-3 w-3 mr-1' />
											{(recipe as VerifiedRecipe)._count?.reviews || 0} reviews
										</div>
									)}

									<Button
										size='sm'
										variant={type === 'pending' ? 'default' : 'outline'}
										className='text-xs'>
										{type === 'pending' ? 'Review' : 'View'}
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
