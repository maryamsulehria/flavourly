'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteRecipe } from '@/lib/hooks/use-mutations';
import { useUserRecipes } from '@/lib/hooks/use-queries';
import {
	AlertCircle,
	BookOpen,
	CheckCircle,
	ChefHat,
	Clock,
	Edit,
	Eye,
	Plus,
	Star,
	Trash2,
	Users,
	XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function getStatusBadge(status: string) {
	switch (status) {
		case 'verified':
			return (
				<Badge
					variant='default'
					className='bg-green-100 text-green-800 hover:bg-green-100'>
					<CheckCircle className='w-3 h-3 mr-1' />
					Verified
				</Badge>
			);
		case 'pending_verification':
			return (
				<Badge
					variant='secondary'
					className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'>
					<AlertCircle className='w-3 h-3 mr-1' />
					Pending Review
				</Badge>
			);
		case 'needs_revision':
			return (
				<Badge
					variant='destructive'
					className='bg-red-100 text-red-800 hover:bg-red-100'>
					<XCircle className='w-3 h-3 mr-1' />
					Needs Revision
				</Badge>
			);
		default:
			return null;
	}
}

function DeleteRecipeDialog({ recipe, onDelete }: { recipe: any; onDelete: () => void }) {
	const [isOpen, setIsOpen] = useState(false);
	const deleteRecipe = useDeleteRecipe();

	const handleDelete = async () => {
		try {
			await deleteRecipe.mutateAsync(recipe.id);
			setIsOpen(false);
			onDelete();
		} catch (error) {
			// Error is handled by the mutation hook
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant='outline'
					size='sm'
					className='flex-1 text-destructive hover:text-destructive hover:bg-destructive/10'>
					<Trash2 className='w-4 h-4 mr-1' />
					Delete
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Recipe</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{recipe.title}"? This action cannot be undone and will
						permanently remove the recipe and all associated images.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button
						variant='destructive'
						onClick={handleDelete}
						disabled={deleteRecipe.isPending}>
						{deleteRecipe.isPending ? 'Deleting...' : 'Delete Recipe'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function RecipeCard({
	recipe,
	onDelete,
}: {
	recipe: {
		id: number;
		title: string;
		description?: string | null;
		cookingTimeMinutes?: number | null;
		servings?: number | null;
		status: string;
		healthTips?: string | null;
		media?: Array<{
			id: number;
			url: string;
			caption?: string | null;
			mediaType: string;
		}>;
		nutritionalInfo?: {
			calories?: number | null;
			dataSource: string;
		} | null;
		averageRating?: number | null;
		reviewCount?: number;
		verifiedBy?: {
			id: number;
			username: string;
			fullName: string | null;
			profilePicture: string | null;
		} | null;
	};
	onDelete: () => void;
}) {
	const cookingTimeMinutes = recipe.cookingTimeMinutes;

	return (
		<Card className='h-full hover:shadow-md transition-shadow flex flex-col'>
			<CardHeader className='pb-3 flex-shrink-0'>
				<div className='flex items-start justify-between'>
					<div className='flex-1 min-w-0'>
						<CardTitle className='text-lg font-semibold truncate'>{recipe.title}</CardTitle>
						<CardDescription className='line-clamp-2 mt-1'>
							{recipe.description || 'No description available'}
						</CardDescription>
					</div>
					{getStatusBadge(recipe.status)}
				</div>
			</CardHeader>

			<CardContent className='pt-0 flex-1 flex flex-col'>
				{/* Nutritionist Verification - Show for verified recipes */}
				{recipe.status === 'verified' && recipe.verifiedBy && (
					<div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
						<div className='flex items-center gap-2'>
							<CheckCircle className='w-4 h-4 text-green-600 flex-shrink-0' />
							<div className='flex-1'>
								<p className='text-sm font-medium text-green-800 mb-1'>Verified by Nutritionist</p>
								<div className='flex items-center gap-2'>
									<Avatar className='w-4 h-4'>
										<AvatarImage src={recipe.verifiedBy.profilePicture || undefined} />
										<AvatarFallback className='text-xs'>
											{(recipe.verifiedBy.fullName || recipe.verifiedBy.username)
												.charAt(0)
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span className='text-xs text-green-700'>
										{recipe.verifiedBy.fullName || recipe.verifiedBy.username}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Nutritionist Review - Show for recipes that need revision */}
				{recipe.status === 'needs_revision' && recipe.verifiedBy && (
					<div className='mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
						<div className='flex items-center gap-2'>
							<AlertCircle className='w-4 h-4 text-orange-600 flex-shrink-0' />
							<div className='flex-1'>
								<p className='text-sm font-medium text-orange-800 mb-1'>Review by Nutritionist</p>
								<div className='flex items-center gap-2'>
									<Avatar className='w-4 h-4'>
										<AvatarImage src={recipe.verifiedBy.profilePicture || undefined} />
										<AvatarFallback className='text-xs'>
											{(recipe.verifiedBy.fullName || recipe.verifiedBy.username)
												.charAt(0)
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span className='text-xs text-orange-700'>
										{recipe.verifiedBy.fullName || recipe.verifiedBy.username}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Recipe Image */}
				{recipe.media && recipe.media.length > 0 ? (
					<div className='relative mb-4 aspect-video rounded-lg overflow-hidden bg-muted'>
						<img
							src={recipe.media[0].url}
							alt={recipe.media[0].caption || recipe.title}
							className='w-full h-full object-cover'
						/>
					</div>
				) : (
					<div className='mb-4 aspect-video rounded-lg bg-muted flex items-center justify-center'>
						<ChefHat className='h-12 w-12 text-muted-foreground' />
					</div>
				)}

				{/* Recipe Stats */}
				<div className='flex items-center gap-4 text-sm text-muted-foreground mb-4'>
					{cookingTimeMinutes && (
						<div className='flex items-center gap-1'>
							<Clock className='w-4 h-4' />
							<span>{recipe.cookingTimeMinutes} min</span>
						</div>
					)}
					{recipe.servings && (
						<div className='flex items-center gap-1'>
							<Users className='w-4 h-4' />
							<span>{recipe.servings} servings</span>
						</div>
					)}
					{recipe.averageRating && (
						<div className='flex items-center gap-1'>
							<Star className='w-4 h-4 fill-current' />
							<span>
								{Number(recipe.averageRating).toFixed(1)} ({recipe.reviewCount})
							</span>
						</div>
					)}
				</div>

				{/* Nutritional Info */}
				{recipe.nutritionalInfo?.calories && (
					<div className='mb-4 p-2 bg-muted/50 rounded text-sm'>
						<span className='font-medium'>
							{Number(recipe.nutritionalInfo.calories).toFixed(0)} calories
						</span>
					</div>
				)}

				{/* Action Buttons - always at bottom */}
				<div className='flex gap-2 mt-auto pt-4 flex-shrink-0'>
					<Button
						asChild
						variant='outline'
						size='sm'
						className='flex-1'>
						<Link href={`/recipes/${recipe.id}`}>
							<Eye className='w-4 h-4 mr-1' />
							View
						</Link>
					</Button>
					<Button
						asChild
						size='sm'
						className='flex-1'>
						<Link href={`/dashboard/recipes/edit/${recipe.id}`}>
							<Edit className='w-4 h-4 mr-1' />
							Edit
						</Link>
					</Button>
					<DeleteRecipeDialog
						recipe={recipe}
						onDelete={onDelete}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function RecipeSkeleton() {
	return (
		<Card className='h-full'>
			<CardHeader className='pb-3'>
				<Skeleton className='h-6 w-3/4 mb-2' />
				<Skeleton className='h-4 w-full' />
			</CardHeader>
			<CardContent className='pt-0'>
				<Skeleton className='aspect-video w-full mb-4' />
				<div className='flex gap-4 mb-4'>
					<Skeleton className='h-4 w-16' />
					<Skeleton className='h-4 w-20' />
					<Skeleton className='h-4 w-24' />
				</div>
				<Skeleton className='h-8 w-full' />
			</CardContent>
		</Card>
	);
}

export default function DashboardPage() {
	const { data: recipes, isLoading, error } = useUserRecipes();

	const handleRecipeDelete = () => {
		// The centralized query system will automatically refetch the data
		// No manual refetch needed
	};

	if (error) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
				<AlertCircle className='w-12 h-12 text-destructive' />
				<h2 className='text-xl font-semibold'>Error loading recipes</h2>
				<p className='text-muted-foreground text-center max-w-md'>
					There was an error loading your recipes. Please try again later.
				</p>
				<Button onClick={() => window.location.reload()}>Try Again</Button>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>My Recipes</h1>
					<p className='text-muted-foreground'>Manage and track your recipe submissions</p>
				</div>
				<Button asChild>
					<Link href='/dashboard/recipes/new'>
						<Plus className='w-4 h-4 mr-2' />
						Create Recipe
					</Link>
				</Button>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Recipes</CardTitle>
						<BookOpen className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{isLoading ? <Skeleton className='h-8 w-16' /> : recipes?.length || 0}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Verified</CardTitle>
						<CheckCircle className='h-4 w-4 text-green-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-green-600'>
							{isLoading ? (
								<Skeleton className='h-8 w-16' />
							) : (
								recipes?.filter((r: any) => r.status === 'verified').length || 0
							)}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Pending Review</CardTitle>
						<AlertCircle className='h-4 w-4 text-yellow-600' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-yellow-600'>
							{isLoading ? (
								<Skeleton className='h-8 w-16' />
							) : (
								recipes?.filter((r: any) => r.status === 'pending_verification').length || 0
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recipes Grid */}
			<div>
				<h2 className='text-xl font-semibold mb-4'>Your Recipes</h2>
				{isLoading ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{Array.from({ length: 6 }).map((_, i) => (
							<RecipeSkeleton key={i} />
						))}
					</div>
				) : recipes && recipes.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{recipes.map((recipe: any) => (
							<RecipeCard
								key={recipe.id}
								recipe={recipe}
								onDelete={handleRecipeDelete}
							/>
						))}
					</div>
				) : (
					<div className='text-center py-12'>
						<BookOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
						<h3 className='text-lg font-semibold mb-2'>No recipes yet</h3>
						<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
							Start creating your first recipe to share with the community and get it verified by
							our nutritionists.
						</p>
						<Button asChild>
							<Link href='/dashboard/recipes/new'>
								<Plus className='w-4 h-4 mr-2' />
								Create Your First Recipe
							</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
