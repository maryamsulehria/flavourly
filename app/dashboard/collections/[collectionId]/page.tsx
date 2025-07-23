'use client';

import { AddRecipeToCollectionDialog } from '@/components/add-recipe-to-collection-dialog';
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
import { useRemoveRecipeFromCollection } from '@/lib/hooks/use-mutations';
import { useCollection } from '@/lib/hooks/use-queries';
import {
	AlertCircle,
	ArrowLeft,
	CheckCircle,
	ChefHat,
	Clock,
	Edit,
	Eye,
	FolderOpen,
	Star,
	Trash2,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';

interface CollectionDetailPageProps {
	params: Promise<{ collectionId: string }>;
}

function RemoveRecipeDialog({
	collectionId,
	recipe,
	onRemove,
}: {
	collectionId: number;
	recipe: any;
	onRemove: () => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const removeRecipe = useRemoveRecipeFromCollection();

	const handleRemove = async () => {
		try {
			await removeRecipe.mutateAsync({ collectionId, recipeId: recipe.id });
			setIsOpen(false);
			onRemove();
		} catch (_error) {
			// Error is handled by the mutation
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
					className='text-destructive hover:text-destructive hover:bg-destructive/10'>
					<Trash2 className='w-4 h-4 mr-1' />
					Remove
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Remove Recipe from Collection</DialogTitle>
					<DialogDescription>
						Are you sure you want to remove &quot;{recipe.title}&quot; from this collection? The
						recipe will remain in your recipes but will be removed from this collection.
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
						onClick={handleRemove}
						disabled={removeRecipe.isPending}>
						{removeRecipe.isPending ? 'Removing...' : 'Remove Recipe'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function RecipeCard({ recipe, collectionId }: { recipe: any; collectionId: number }) {
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
					{recipe.status === 'verified' && (
						<Badge
							variant='default'
							className='bg-green-100 text-green-800 hover:bg-green-100'>
							Verified
						</Badge>
					)}
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
					{recipe.cookingTimeMinutes && (
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
					<RemoveRecipeDialog
						collectionId={collectionId}
						recipe={recipe}
						onRemove={() => {
							// The centralized query system will automatically refetch the data
						}}
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

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
	const { collectionId } = use(params);
	const collectionIdNum = parseInt(collectionId);
	const { data: collection, isLoading, error } = useCollection(collectionIdNum);

	if (error) {
		return (
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col items-start gap-4'>
					<Button
						variant='outline'
						size='sm'
						asChild>
						<Link href='/dashboard/collections'>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Collections
						</Link>
					</Button>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Collection Not Found</h1>
						<p className='text-muted-foreground'>
							The collection you're looking for doesn't exist or has been removed.
						</p>
					</div>
				</div>

				<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
					<FolderOpen className='w-12 h-12 text-destructive' />
					<h2 className='text-xl font-semibold'>Error loading collection</h2>
					<p className='text-muted-foreground text-center max-w-md'>
						There was an error loading this collection. Please try again later.
					</p>
					<Button asChild>
						<Link href='/dashboard/collections'>Back to Collections</Link>
					</Button>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='space-y-6'>
				{/* Header Skeleton */}
				<div className='flex flex-col items-start gap-4'>
					<Skeleton className='h-10 w-40' />
					<div>
						<Skeleton className='h-8 w-64 mb-2' />
						<Skeleton className='h-4 w-96' />
					</div>
				</div>

				{/* Recipes Grid Skeleton */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{Array.from({ length: 6 }).map((_, i) => (
						<RecipeSkeleton key={i} />
					))}
				</div>
			</div>
		);
	}

	if (!collection) {
		return null;
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col items-start gap-4'>
				<Button
					variant='outline'
					size='sm'
					asChild>
					<Link href='/dashboard/collections'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Collections
					</Link>
				</Button>
				<div className='flex items-center justify-between w-full'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>{collection.collectionName}</h1>
						<p className='text-muted-foreground'>
							{collection.description || 'No description available'}
						</p>
						<div className='flex items-center gap-4 mt-2 text-sm text-muted-foreground'>
							<span>{collection.recipeCount} recipes</span>
							<span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
					<div className='flex gap-2'>
						<AddRecipeToCollectionDialog
							collectionId={collection.id}
							collectionName={collection.collectionName}
							onSuccess={() => {
								// The centralized query system will automatically refetch the data
							}}
						/>
						<Button asChild>
							<Link href={`/dashboard/collections/${collection.id}/edit`}>
								<Edit className='w-4 h-4 mr-2' />
								Edit Collection
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Recipes Grid */}
			<div>
				{collection.recipes && collection.recipes.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{collection.recipes.map(({ recipe }: { recipe: any }) => (
							<RecipeCard
								key={recipe.id}
								recipe={recipe}
								collectionId={collection.id}
							/>
						))}
					</div>
				) : (
					<div className='text-center py-12'>
						<FolderOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
						<h3 className='text-lg font-semibold mb-2'>No recipes in this collection</h3>
						<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
							This collection is empty. Add some recipes to get started!
						</p>
						<AddRecipeToCollectionDialog
							collectionId={collection.id}
							collectionName={collection.collectionName}
							onSuccess={() => {
								// The centralized query system will automatically refetch the data
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
