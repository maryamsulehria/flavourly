'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChefHat, Clock, Eye, Heart, Star, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface RecipeCardProps {
	recipe: {
		id: number;
		title: string;
		description: string | null;
		cookingTimeMinutes: number | null;
		servings: number | null;
		status: 'pending_verification' | 'verified' | 'needs_revision';
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
			dataSource: 'estimated_api' | 'verified_nutritionist';
		} | null;
		averageRating: number | null;
		reviewCount: number;
		createdAt: string;
		tags?: Array<{
			tag: {
				tagName: string;
				tagType: {
					typeName: string;
				};
			};
		}>;
	};
	showAuthor?: boolean;
	showNutrition?: boolean;
	onTagClick?: (tagName: string, tagType: string) => void;
	activeFilters?: {
		mealType: string[];
		dietaryPreferences: string[];
		cuisine: string[];
		difficulty: string;
	};
}

export function RecipeCard({
	recipe,
	showAuthor = true,
	showNutrition = true,
	onTagClick,
	activeFilters,
}: RecipeCardProps) {
	const { data: session } = useSession();
	const { toast } = useToast();
	const [isFavorite, setIsFavorite] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Check if recipe is favorited on component mount
	useEffect(() => {
		if (session?.user) {
			checkFavoriteStatus();
		}
	}, [session?.user, recipe.id]);

	const checkFavoriteStatus = async () => {
		try {
			const response = await fetch(`/api/favorites/${recipe.id}`);
			if (response.ok) {
				const data = await response.json();
				setIsFavorite(data.isFavorited);
			}
		} catch (error) {
			console.error('Error checking favorite status:', error);
		}
	};

	const getAuthorInitials = (name: string) => {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const formatTime = (minutes: number) => {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	};

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => {
			const starValue = i + 1;
			const isFilled = starValue <= rating;

			return (
				<Star
					key={i}
					className={`h-4 w-4 ${
						isFilled ? 'fill-yellow-500 text-yellow-500 !important' : 'text-gray-300'
					}`}
					style={isFilled ? { fill: '#eab308', color: '#eab308' } : {}}
				/>
			);
		});
	};

	const handleFavoriteClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!session?.user) {
			toast({
				title: 'Sign in required',
				description: 'Please sign in to add recipes to your favorites',
				variant: 'destructive',
			});
			// Redirect to signin page after a short delay to allow toast to show
			setTimeout(() => {
				window.location.href = '/signin';
			}, 1500);
			return;
		}

		// Check if user is a nutritionist
		if (session.user.role === 'Nutritionist') {
			toast({
				title: 'Access restricted',
				description:
					'Only Recipe Developers can favorite recipes. This feature is not available for Nutritionists.',
				variant: 'destructive',
			});
			return;
		}

		if (isLoading) return;

		setIsLoading(true);

		try {
			const response = await fetch(`/api/favorites/${recipe.id}`, {
				method: isFavorite ? 'DELETE' : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				setIsFavorite(!isFavorite);
				toast({
					title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
					description: isFavorite
						? `${recipe.title} has been removed from your favorites`
						: `${recipe.title} has been added to your favorites`,
					variant: 'success',
				});
			} else {
				const errorData = await response.json();
				toast({
					title: 'Error',
					description: errorData.error || 'Failed to update favorites',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
			toast({
				title: 'Error',
				description: 'Failed to update favorites. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Check if a tag is currently active as a filter
	const isTagActive = (tagName: string, tagType: string) => {
		if (!activeFilters) return false;

		switch (tagType) {
			case 'Meal Type':
				return activeFilters.mealType.includes(tagName);
			case 'Dietary':
				return activeFilters.dietaryPreferences.includes(tagName);
			case 'Cuisine':
				return activeFilters.cuisine.includes(tagName);
			case 'Difficulty':
				return activeFilters.difficulty === tagName;
			default:
				return false;
		}
	};

	// Filter tags to show dietary, cuisine, meal type, and difficulty tags
	const displayTags =
		recipe.tags
			?.filter(
				tag =>
					tag.tag.tagType.typeName === 'Dietary' ||
					tag.tag.tagType.typeName === 'Cuisine' ||
					tag.tag.tagType.typeName === 'Meal Type' ||
					tag.tag.tagType.typeName === 'Difficulty',
			)
			.slice(0, 4) || [];

	return (
		<Card className='group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full'>
			{/* Image Section with Heart Button */}
			<div className='relative aspect-[4/3] overflow-hidden p-4'>
				{recipe.media.length > 0 ? (
					<div className='w-full h-full relative'>
						<Image
							src={recipe.media[0].url}
							alt={recipe.media[0].caption || recipe.title}
							fill
							className='object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg'
						/>
					</div>
				) : (
					<div className='w-full h-full bg-muted flex items-center justify-center rounded-lg'>
						<ChefHat className='h-12 w-12 text-muted-foreground' />
					</div>
				)}

				{/* Heart Button - Top Right */}
				<Button
					variant='secondary'
					size='sm'
					className='absolute top-6 right-6 h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md'
					onClick={handleFavoriteClick}
					disabled={isLoading}>
					<Heart
						className={`h-4 w-4 transition-colors ${
							isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
						}`}
					/>
				</Button>
			</div>

			{/* Content Section */}
			<div className='flex flex-col flex-1 p-4'>
				{/* Top Content - Title, Description, Tags, Metadata, Nutrition, Rating */}
				<div className='flex-1'>
					{/* Title and Description */}
					<div className='mb-3'>
						<h3 className='font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2'>
							{recipe.title}
						</h3>
						{recipe.description && (
							<p className='text-sm text-muted-foreground line-clamp-2'>{recipe.description}</p>
						)}
						{/* Verified Badge */}
						{recipe.status === 'verified' && (
							<Badge
								variant='default'
								className='text-xs mt-2'>
								Verified
							</Badge>
						)}
					</div>

					{/* Tags */}
					{displayTags.length > 0 && (
						<div className='flex flex-wrap gap-1 mb-3'>
							{displayTags.map((tag, index) => (
								<Badge
									key={index}
									variant='outline'
									className={`text-xs px-2 py-1 ${
										onTagClick
											? 'cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'
											: ''
									} ${
										isTagActive(tag.tag.tagName, tag.tag.tagType.typeName)
											? 'bg-primary text-primary-foreground'
											: ''
									}`}
									onClick={() => onTagClick?.(tag.tag.tagName, tag.tag.tagType.typeName)}
									title={onTagClick ? `Click to filter by ${tag.tag.tagName}` : undefined}>
									{tag.tag.tagName}
								</Badge>
							))}
						</div>
					)}

					{/* Recipe Metadata */}
					<div className='flex items-center gap-4 text-sm text-muted-foreground mb-3'>
						{recipe.cookingTimeMinutes && (
							<div className='flex items-center gap-1'>
								<Clock className='h-4 w-4' />
								<span>{formatTime(recipe.cookingTimeMinutes)}</span>
							</div>
						)}
						{recipe.servings && (
							<div className='flex items-center gap-1'>
								<Users className='h-4 w-4' />
								<span>{recipe.servings} servings</span>
							</div>
						)}
						{/* Rating - moved here to be with other metadata */}
						{recipe.averageRating && (
							<div className='flex items-center gap-2'>
								<div className='flex items-center gap-0.5'>{renderStars(recipe.averageRating)}</div>
								<span className='text-sm font-semibold text-amber-600'>
									{recipe.averageRating.toFixed(1)}
								</span>
								{recipe.reviewCount > 0 && (
									<span className='text-xs text-muted-foreground'>({recipe.reviewCount})</span>
								)}
							</div>
						)}
					</div>

					{/* Nutrition Info */}
					{showNutrition && recipe.nutritionalInfo?.calories && (
						<div className='text-sm mb-3'>
							<span className='font-medium'>{Math.round(recipe.nutritionalInfo.calories)} cal</span>
							{recipe.nutritionalInfo.proteinGrams && (
								<span className='text-muted-foreground ml-2'>
									• {Math.round(recipe.nutritionalInfo.proteinGrams)}g protein
								</span>
							)}
						</div>
					)}
				</div>

				{/* Bottom Content - Author and Button (always at bottom) */}
				<div className='mt-auto'>
					{/* Author */}
					{showAuthor && (
						<div className='mb-3'>
							<Link
								href={`/users/${recipe.author.id}`}
								className='flex items-center gap-2'>
								<Avatar className='h-6 w-6'>
									<AvatarImage
										src={recipe.author.profilePicture || undefined}
										alt={recipe.author.fullName || recipe.author.username}
									/>
									<AvatarFallback className='text-xs'>
										{getAuthorInitials(recipe.author.fullName || recipe.author.username)}
									</AvatarFallback>
								</Avatar>
								<span className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
									{recipe.author.fullName || recipe.author.username}
								</span>
							</Link>
						</div>
					)}

					{/* View Recipe Button */}
					<Button
						asChild
						className='w-full'
						variant='outline'>
						<Link href={`/recipes/${recipe.id}`}>
							<Eye className='h-4 w-4 mr-2' />
							View Recipe
						</Link>
					</Button>
				</div>
			</div>
		</Card>
	);
}
