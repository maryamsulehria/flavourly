'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Clock, Image, Users, Video } from 'lucide-react';
import { DetailedRecipe } from './RecipeVerificationForm';

interface RecipeDetailsViewProps {
	recipe: DetailedRecipe;
}

export default function RecipeDetailsView({ recipe }: RecipeDetailsViewProps) {
	return (
		<div className='space-y-6'>
			{/* Recipe Overview */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<ChefHat className='h-5 w-5 mr-2' />
						Recipe Overview
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div>
						<h3 className='font-semibold text-lg mb-2'>{recipe.title}</h3>
						{recipe.description && <p className='text-muted-foreground'>{recipe.description}</p>}
					</div>

					<div className='flex flex-wrap gap-4'>
						{recipe.cookingTimeMinutes && (
							<div className='flex items-center text-sm'>
								<Clock className='h-4 w-4 mr-1 text-muted-foreground' />
								<span>{recipe.cookingTimeMinutes} minutes</span>
							</div>
						)}
						{recipe.servings && (
							<div className='flex items-center text-sm'>
								<Users className='h-4 w-4 mr-1 text-muted-foreground' />
								<span>{recipe.servings} servings</span>
							</div>
						)}
					</div>

					<div className='flex flex-wrap gap-2'>
						<Badge variant='outline'>
							{recipe._count?.ingredients || recipe.ingredients.length} ingredients
						</Badge>
						<Badge variant='outline'>{recipe._count?.steps || recipe.steps.length} steps</Badge>
						{(recipe._count?.reviews || 0) > 0 && (
							<Badge variant='outline'>{recipe._count?.reviews || 0} reviews</Badge>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Ingredients */}
			<Card>
				<CardHeader>
					<CardTitle>Ingredients</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-3'>
						{recipe.ingredients.map((ingredient, index) => (
							<div
								key={index}
								className='flex items-center justify-between'>
								<div className='flex-1'>
									<span className='font-medium'>
										{ingredient.ingredient?.name || 'Unknown ingredient'}
									</span>
									{ingredient.notes && (
										<p className='text-sm text-muted-foreground mt-1'>{ingredient.notes}</p>
									)}
								</div>
								<div className='text-sm text-muted-foreground'>
									{ingredient.quantity}{' '}
									{ingredient.unit?.abbreviation || ingredient.unit?.unitName || 'unit'}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Instructions */}
			<Card>
				<CardHeader>
					<CardTitle>Instructions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{recipe.steps
							.sort((a, b) => a.stepNumber - b.stepNumber)
							.map(step => (
								<div
									key={step.id}
									className='flex gap-4'>
									<div className='flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium'>
										{step.stepNumber}
									</div>
									<div className='flex-1'>
										<p className='text-sm'>{step.instruction}</p>
									</div>
								</div>
							))}
					</div>
				</CardContent>
			</Card>

			{/* Media */}
			{recipe.media && recipe.media.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Media</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{recipe.media.map(media => (
								<div
									key={media.id}
									className='space-y-2'>
									<div className='flex items-center gap-2'>
										{media.mediaType === 'image' ? (
											<Image className='h-4 w-4 text-muted-foreground' />
										) : (
											<Video className='h-4 w-4 text-muted-foreground' />
										)}
										<span className='text-sm font-medium capitalize'>{media.mediaType}</span>
									</div>
									{media.mediaType === 'image' ? (
										<img
											src={media.url}
											alt={media.caption || 'Recipe image'}
											className='w-full h-48 object-cover rounded-lg'
										/>
									) : (
										<video
											src={media.url}
											className='w-full h-48 object-cover rounded-lg'
											controls
										/>
									)}
									{media.caption && (
										<p className='text-sm text-muted-foreground'>{media.caption}</p>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Current Tags */}
			{recipe.tags && recipe.tags.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Current Tags</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{Object.entries(
								recipe.tags.reduce((acc, { tag }) => {
									const type = tag.tagType.typeName;
									if (!acc[type]) acc[type] = [];
									acc[type].push(tag);
									return acc;
								}, {} as Record<string, Array<{ id: number; tagName: string }>>),
							).map(([tagType, tags]) => (
								<div key={tagType}>
									<h4 className='font-medium text-sm mb-2 capitalize'>{tagType}</h4>
									<div className='flex flex-wrap gap-2'>
										{tags.map(tag => (
											<Badge
												key={tag.id}
												variant='secondary'>
												{tag.tagName}
											</Badge>
										))}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
