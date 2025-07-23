'use client';

import { VerificationStatus } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// UI Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Custom Components
import HealthTipsForm from '@/components/nutritionist/HealthTipsForm';
import NutritionalInfoForm from '@/components/nutritionist/NutritionalInfoForm';
import RecipeDetailsView from '@/components/nutritionist/RecipeDetailsView';
import TagManagementForm from '@/components/nutritionist/TagManagementForm';
import VerificationActions from '@/components/nutritionist/VerificationActions';

// Icons
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, User } from 'lucide-react';

export interface DetailedRecipe {
	id: number;
	title: string;
	description: string | null;
	cookingTimeMinutes: number | null;
	servings: number | null;
	status: VerificationStatus;
	healthTips: string | null;
	createdAt: string;
	updatedAt: string;
	verifiedAt: string | null;
	author: {
		id: number;
		username: string;
		fullName: string | null;
		email: string;
	};
	verifiedBy: {
		id: number;
		username: string;
		fullName: string | null;
		profilePicture: string | null;
	} | null;
	ingredients: Array<{
		quantity: string;
		notes: string | null;
		ingredient: {
			id: number;
			name: string;
		};
		unit: {
			id: number;
			unitName: string;
			abbreviation: string | null;
		};
	}>;
	steps: Array<{
		id: number;
		stepNumber: number;
		instruction: string;
	}>;
	media: Array<{
		id: number;
		mediaType: string;
		url: string;
		caption: string | null;
	}>;
	tags: Array<{
		tag: {
			id: number;
			tagName: string;
			tagType: {
				id: number;
				typeName: string;
			};
		};
	}>;
	nutritionalInfo: {
		calories: string | null;
		proteinGrams: string | null;
		carbohydratesGrams: string | null;
		fatGrams: string | null;
		fiberGrams: string | null;
		sugarGrams: string | null;
		sodiumMg: string | null;
		dataSource: string;
	} | null;
	_count: {
		ingredients: number;
		steps: number;
		reviews: number;
	};
}

interface RecipeVerificationFormProps {
	recipeId: number;
}

export default function RecipeVerificationForm({ recipeId }: RecipeVerificationFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('details');

	// Fetch recipe details
	const {
		data: recipe,
		isLoading,
		error,
	} = useQuery<DetailedRecipe>({
		queryKey: ['recipe', recipeId],
		queryFn: async () => {
			const response = await axios.get(`/api/recipes/${recipeId}`);
			return response.data;
		},
		staleTime: 5 * 60 * 1000,
	});

	// Save recipe data mutation (without changing status)
	const saveRecipeDataMutation = useMutation({
		mutationFn: async ({
			healthTips,
			nutritionalInfo,
			tags,
		}: {
			healthTips?: string;
			nutritionalInfo?: any;
			tags?: any;
		}) => {
			const response = await axios.patch(`/api/recipes/${recipeId}/update`, {
				healthTips,
				nutritionalInfo,
				tags,
			});
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
			toast.success('Recipe data saved successfully');
		},
		onError: error => {
			console.error('Error saving recipe data:', error);
			toast.error('Failed to save recipe data');
		},
	});

	// Update recipe status mutation (only for status changes)
	const updateRecipeStatusMutation = useMutation({
		mutationFn: async ({ status }: { status: VerificationStatus }) => {
			const response = await axios.patch(`/api/recipes/${recipeId}/update-status`, { status });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
			queryClient.invalidateQueries({ queryKey: ['nutritionist', 'queue'] });
			queryClient.invalidateQueries({ queryKey: ['nutritionist', 'stats'] });

			toast.success('Recipe status updated successfully');
		},
		onError: error => {
			console.error('Error updating recipe status:', error);
			toast.error('Failed to update recipe status');
		},
	});

	const handleBack = () => {
		router.push('/nutritionist/queue');
	};

	// Handle saving recipe data (nutritional info, tags, health tips)
	const handleSaveData = (data: { healthTips?: string; nutritionalInfo?: any; tags?: any }) => {
		saveRecipeDataMutation.mutate(data);
	};

	// Handle status updates (verify, needs revision, etc.)
	const handleStatusUpdate = (status: VerificationStatus) => {
		updateRecipeStatusMutation.mutate({ status });
	};

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='h-10 w-24' />
				</div>
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					<div className='lg:col-span-2 space-y-6'>
						<Card>
							<CardHeader>
								<Skeleton className='h-6 w-32' />
							</CardHeader>
							<CardContent className='space-y-4'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-3/4' />
								<Skeleton className='h-4 w-1/2' />
							</CardContent>
						</Card>
					</div>
					<div className='space-y-6'>
						<Card>
							<CardHeader>
								<Skeleton className='h-6 w-32' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-20 w-full' />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (error || !recipe) {
		return (
			<Alert className='border-destructive'>
				<AlertCircle className='h-4 w-4' />
				<AlertDescription>
					{error?.message || 'Failed to load recipe. Please try again.'}
				</AlertDescription>
			</Alert>
		);
	}

	const statusColor = {
		[VerificationStatus.pending_verification]: 'bg-yellow-500',
		[VerificationStatus.verified]: 'bg-green-500',
		[VerificationStatus.needs_revision]: 'bg-red-500',
	};

	// Check if recipe is verified (read-only mode)
	const isVerified = recipe.status === VerificationStatus.verified;

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col items-start gap-4'>
				<Button
					variant='outline'
					size='sm'
					onClick={handleBack}
					className='flex items-center'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Queue
				</Button>
				<div className='flex items-center justify-between w-full'>
					<div>
						<h2 className='text-2xl font-bold'>{recipe.title}</h2>
						<div className='flex items-center space-x-4 mt-1'>
							<div className='flex items-center text-sm text-muted-foreground'>
								<User className='h-4 w-4 mr-1' />
								{recipe.author.fullName || recipe.author.username}
							</div>
							<div className='flex items-center text-sm text-muted-foreground'>
								<Calendar className='h-4 w-4 mr-1' />
								{new Date(recipe.createdAt).toLocaleDateString()}
							</div>
						</div>
						{isVerified && (
							<div className='mt-2 p-3 bg-green-50 border border-green-200 rounded-lg'>
								<div className='flex items-center text-sm text-green-800'>
									<CheckCircle className='h-4 w-4 mr-2' />
									This recipe has already been verified. You can view the information but cannot
									make changes.
								</div>
							</div>
						)}
					</div>
					<div className='flex items-center space-x-3'>
						<Badge
							variant='secondary'
							className='flex items-center'>
							<div className={`w-2 h-2 rounded-full mr-2 ${statusColor[recipe.status]}`} />
							{recipe.status.replace('_', ' ').toUpperCase()}
						</Badge>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Left Column - Recipe Details */}
				<div className='lg:col-span-2'>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}>
						<TabsList className='grid w-full grid-cols-4'>
							<TabsTrigger value='details'>Recipe Details</TabsTrigger>
							<TabsTrigger value='nutrition'>Nutrition</TabsTrigger>
							<TabsTrigger value='tags'>Tags</TabsTrigger>
							<TabsTrigger value='tips'>Health Tips</TabsTrigger>
						</TabsList>

						<TabsContent
							value='details'
							className='mt-6'>
							<RecipeDetailsView recipe={recipe} />
						</TabsContent>

						<TabsContent
							value='nutrition'
							className='mt-6'>
							{isVerified ? (
								<Card>
									<CardHeader>
										<CardTitle>Nutritional Information (Read-Only)</CardTitle>
									</CardHeader>
									<CardContent>
										{recipe.nutritionalInfo ? (
											<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
												{recipe.nutritionalInfo.calories && (
													<div className='text-center p-3 bg-muted rounded-lg'>
														<div className='text-lg font-semibold'>
															{recipe.nutritionalInfo.calories}
														</div>
														<div className='text-sm text-muted-foreground'>Calories</div>
													</div>
												)}
												{recipe.nutritionalInfo.proteinGrams && (
													<div className='text-center p-3 bg-muted rounded-lg'>
														<div className='text-lg font-semibold'>
															{recipe.nutritionalInfo.proteinGrams}g
														</div>
														<div className='text-sm text-muted-foreground'>Protein</div>
													</div>
												)}
												{recipe.nutritionalInfo.carbohydratesGrams && (
													<div className='text-center p-3 bg-muted rounded-lg'>
														<div className='text-lg font-semibold'>
															{recipe.nutritionalInfo.carbohydratesGrams}g
														</div>
														<div className='text-sm text-muted-foreground'>Carbs</div>
													</div>
												)}
												{recipe.nutritionalInfo.fatGrams && (
													<div className='text-center p-3 bg-muted rounded-lg'>
														<div className='text-lg font-semibold'>
															{recipe.nutritionalInfo.fatGrams}g
														</div>
														<div className='text-sm text-muted-foreground'>Fat</div>
													</div>
												)}
											</div>
										) : (
											<p className='text-muted-foreground'>No nutritional information available.</p>
										)}
									</CardContent>
								</Card>
							) : (
								<NutritionalInfoForm
									recipe={recipe}
									onUpdate={(nutritionalInfo: any) => handleSaveData({ nutritionalInfo })}
								/>
							)}
						</TabsContent>

						<TabsContent
							value='tags'
							className='mt-6'>
							{isVerified ? (
								<Card>
									<CardHeader>
										<CardTitle>Recipe Tags (Read-Only)</CardTitle>
									</CardHeader>
									<CardContent>
										{recipe.tags.length > 0 ? (
											<div className='flex flex-wrap gap-2'>
												{recipe.tags.map(({ tag }) => (
													<Badge
														key={tag.id}
														variant='secondary'>
														{tag.tagName}
													</Badge>
												))}
											</div>
										) : (
											<p className='text-muted-foreground'>No tags assigned to this recipe.</p>
										)}
									</CardContent>
								</Card>
							) : (
								<TagManagementForm
									recipe={recipe}
									onUpdate={(tags: any) => handleSaveData({ tags })}
								/>
							)}
						</TabsContent>

						<TabsContent
							value='tips'
							className='mt-6'>
							{isVerified ? (
								<Card>
									<CardHeader>
										<CardTitle>Health Tips (Read-Only)</CardTitle>
									</CardHeader>
									<CardContent>
										{recipe.healthTips ? (
											<div className='p-4 bg-muted rounded-lg'>
												<p className='whitespace-pre-wrap'>{recipe.healthTips}</p>
											</div>
										) : (
											<p className='text-muted-foreground'>
												No health tips available for this recipe.
											</p>
										)}
									</CardContent>
								</Card>
							) : (
								<HealthTipsForm
									recipe={recipe}
									onUpdate={(healthTips: string) => handleSaveData({ healthTips })}
								/>
							)}
						</TabsContent>
					</Tabs>
				</div>

				{/* Right Column - Actions */}
				<div className='space-y-6'>
					<VerificationActions
						recipe={recipe}
						onStatusUpdate={handleStatusUpdate}
						onSaveData={handleSaveData}
						isLoading={updateRecipeStatusMutation.isPending || saveRecipeDataMutation.isPending}
					/>
				</div>
			</div>
		</div>
	);
}
