'use client';

import { MediaUpload } from '@/components/media-upload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useResubmitRecipe } from '@/lib/hooks/use-mutations';
import { useRecipe, useUpdateRecipe, type Ingredient } from '@/lib/hooks/use-recipes';
import { AlertCircle, ArrowLeft, Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const commonUnits = [
	'cup',
	'tbsp',
	'tsp',
	'oz',
	'lb',
	'g',
	'kg',
	'ml',
	'l',
	'piece',
	'slice',
	'clove',
	'bunch',
	'can',
];

export default function EditRecipePage() {
	const params = useParams();
	const router = useRouter();
	const recipeId = parseInt(params.recipeId as string);

	const { data: recipe, isLoading, error } = useRecipe(recipeId);
	const updateRecipeMutation = useUpdateRecipe();
	const resubmitRecipe = useResubmitRecipe();

	const [currentStep, setCurrentStep] = useState(1);
	const [media, setMedia] = useState<
		Array<{
			id: string;
			url: string;
			type: 'image' | 'video';
			publicId: string;
		}>
	>([]);
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		cookingTimeMinutes: '',
		servings: '',
		ingredients: [{ name: '', quantity: '', unit: 'cup', notes: '' }] as Ingredient[],
		steps: [''] as string[],
	});

	// Check if recipe can be resubmitted (needs revision)
	const canResubmit = recipe?.status === 'needs_revision';

	// Handle resubmitting recipe for review
	const handleResubmit = async () => {
		if (!canResubmit) return;

		try {
			await resubmitRecipe.mutateAsync(recipeId);
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	// Pre-populate form when recipe data is loaded
	useEffect(() => {
		if (recipe) {
			setFormData({
				title: recipe.title,
				description: recipe.description,
				cookingTimeMinutes: recipe.cookingTimeMinutes,
				servings: recipe.servings,
				ingredients:
					recipe.ingredients.length > 0
						? recipe.ingredients
						: [{ name: '', quantity: '', unit: 'cup', notes: '' }],
				steps: recipe.steps.length > 0 ? recipe.steps : [''],
			});
			setMedia(recipe.media);
		}
	}, [recipe]);

	const updateFormData = (field: string, value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const addIngredient = () => {
		setFormData(prev => ({
			...prev,
			ingredients: [...prev.ingredients, { name: '', quantity: '', unit: 'cup', notes: '' }],
		}));
	};

	const removeIngredient = (index: number) => {
		if (formData.ingredients.length > 1) {
			setFormData(prev => ({
				...prev,
				ingredients: prev.ingredients.filter((_, i) => i !== index),
			}));
		}
	};

	const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
		setFormData(prev => ({
			...prev,
			ingredients: prev.ingredients.map((ingredient, i) =>
				i === index ? { ...ingredient, [field]: value } : ingredient,
			),
		}));
	};

	const addStep = () => {
		setFormData(prev => ({
			...prev,
			steps: [...prev.steps, ''],
		}));
	};

	const removeStep = (index: number) => {
		if (formData.steps.length > 1) {
			setFormData(prev => ({
				...prev,
				steps: prev.steps.filter((_, i) => i !== index),
			}));
		}
	};

	const updateStep = (index: number, value: string) => {
		setFormData(prev => ({
			...prev,
			steps: prev.steps.map((step, i) => (i === index ? value : step)),
		}));
	};

	const validateStep = () => {
		switch (currentStep) {
			case 1:
				return formData.title.trim() !== '';
			case 2:
				return formData.ingredients.every(
					ing => ing.name.trim() !== '' && ing.quantity.trim() !== '',
				);
			case 3:
				return formData.steps.every(step => step.trim() !== '');
			case 4:
				return true; // Media is optional
			default:
				return true;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateStep()) {
			return;
		}

		if (currentStep < 4) {
			setCurrentStep(currentStep + 1);
			return;
		}

		// Submit the recipe update
		const recipeData = {
			id: recipeId,
			title: formData.title,
			description: formData.description || undefined,
			cookingTimeMinutes: formData.cookingTimeMinutes
				? parseInt(formData.cookingTimeMinutes)
				: undefined,
			servings: formData.servings ? parseInt(formData.servings) : undefined,
			ingredients: formData.ingredients.filter(ing => ing.name.trim() !== ''),
			steps: formData.steps.filter(step => step.trim() !== ''),
			media: media.filter(m => m.url),
		};

		updateRecipeMutation.mutate(recipeData, {
			onSuccess: () => {
				router.push('/dashboard');
			},
		});
	};

	const steps = [
		{ number: 1, title: 'Basic Information', description: 'Recipe title and details' },
		{ number: 2, title: 'Ingredients', description: 'List all ingredients' },
		{ number: 3, title: 'Instructions', description: 'Preparation steps' },
		{ number: 4, title: 'Media', description: 'Add photos and videos' },
	];

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='flex items-center gap-2'>
					<Loader2 className='h-6 w-6 animate-spin' />
					<span>Loading recipe...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-destructive'>Recipe Not Found</h2>
					<p className='text-muted-foreground mt-2'>
						The recipe you're looking for doesn't exist or you don't have permission to edit it.
					</p>
				</div>
				<Button asChild>
					<Link href='/dashboard'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Dashboard
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col items-start gap-4'>
				<Button
					variant='outline'
					size='sm'
					asChild>
					<Link href='/dashboard'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Dashboard
					</Link>
				</Button>
				<div className='flex items-center justify-between w-full'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Edit Recipe</h1>
						<p className='text-muted-foreground'>Update your recipe details and content</p>
					</div>

					{/* Resubmit Button - Only show for recipes that need revision */}
					{canResubmit && (
						<Button
							onClick={handleResubmit}
							disabled={resubmitRecipe.isPending}
							variant='outline'
							className='bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'>
							{resubmitRecipe.isPending ? (
								<>
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
									Resubmitting...
								</>
							) : (
								<>
									<RefreshCw className='h-4 w-4 mr-2' />
									Resubmit for Review
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			{/* Revision Notes - Show when recipe needs revision */}
			{recipe?.status === 'needs_revision' && recipe?.healthTips && (
				<Card className='border-orange-200 bg-orange-50'>
					<CardHeader>
						<CardTitle className='flex items-center text-orange-800'>
							<AlertCircle className='w-5 h-5 mr-2' />
							Revision Notes from Nutritionist
						</CardTitle>
						<CardDescription className='text-orange-700'>
							Please review the feedback below and make the necessary changes before resubmitting.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='p-4 bg-white rounded-lg border border-orange-200'>
							<p className='text-sm text-gray-800 whitespace-pre-wrap'>{recipe.healthTips}</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Progress Steps */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex items-center justify-between'>
						{steps.map((step, index) => (
							<div
								key={step.number}
								className='flex items-center'>
								<div
									className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
										currentStep >= step.number
											? 'bg-primary border-primary text-primary-foreground'
											: 'border-muted-foreground text-muted-foreground'
									}`}>
									{step.number}
								</div>
								<div className='ml-3'>
									<p className='text-sm font-medium'>{step.title}</p>
									<p className='text-xs text-muted-foreground'>{step.description}</p>
								</div>
								{index < steps.length - 1 && (
									<div
										className={`w-16 h-0.5 mx-4 ${
											currentStep > step.number ? 'bg-primary' : 'bg-muted'
										}`}
									/>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Form */}
			<form
				onSubmit={handleSubmit}
				className='space-y-6'>
				{/* Step 1: Basic Information */}
				{currentStep === 1 && (
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>Update the essential details about your recipe</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='title'>Recipe Title *</Label>
								<Input
									id='title'
									value={formData.title}
									onChange={e => updateFormData('title', e.target.value)}
									placeholder='e.g., Classic Chocolate Chip Cookies'
									required
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									value={formData.description}
									onChange={e => updateFormData('description', e.target.value)}
									placeholder='Tell us about your recipe...'
									rows={3}
								/>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='cookingTime'>Cooking Time (minutes)</Label>
									<Input
										id='cookingTime'
										type='number'
										value={formData.cookingTimeMinutes}
										onChange={e => updateFormData('cookingTimeMinutes', e.target.value)}
										placeholder='30'
										min='1'
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='servings'>Servings</Label>
									<Input
										id='servings'
										type='number'
										value={formData.servings}
										onChange={e => updateFormData('servings', e.target.value)}
										placeholder='4'
										min='1'
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step 2: Ingredients */}
				{currentStep === 2 && (
					<Card>
						<CardHeader>
							<CardTitle>Ingredients</CardTitle>
							<CardDescription>Update the ingredients needed for your recipe</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							{formData.ingredients.map((ingredient, index) => (
								<div
									key={index}
									className='flex items-start gap-4 p-4 border rounded-lg'>
									<div className='flex-1 grid grid-cols-12 gap-4'>
										<div className='col-span-5 space-y-2'>
											<Label htmlFor={`ingredient-${index}`}>Ingredient *</Label>
											<Input
												id={`ingredient-${index}`}
												value={ingredient.name}
												onChange={e => updateIngredient(index, 'name', e.target.value)}
												placeholder='e.g., All-purpose flour'
												required
											/>
										</div>
										<div className='col-span-2 space-y-2'>
											<Label htmlFor={`quantity-${index}`}>Quantity *</Label>
											<Input
												id={`quantity-${index}`}
												value={ingredient.quantity}
												onChange={e => updateIngredient(index, 'quantity', e.target.value)}
												placeholder='2'
												required
											/>
										</div>
										<div className='col-span-2 space-y-2'>
											<Label htmlFor={`unit-${index}`}>Unit</Label>
											<select
												id={`unit-${index}`}
												value={ingredient.unit}
												onChange={e => updateIngredient(index, 'unit', e.target.value)}
												className='w-full px-3 py-2 border border-input rounded-md bg-background text-sm'>
												{commonUnits.map(unit => (
													<option
														key={unit}
														value={unit}>
														{unit}
													</option>
												))}
											</select>
										</div>
										<div className='col-span-3 space-y-2'>
											<Label htmlFor={`notes-${index}`}>Notes</Label>
											<Input
												id={`notes-${index}`}
												value={ingredient.notes}
												onChange={e => updateIngredient(index, 'notes', e.target.value)}
												placeholder='Optional notes'
											/>
										</div>
									</div>
									{formData.ingredients.length > 1 && (
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={() => removeIngredient(index)}
											className='mt-6'>
											<Trash2 className='w-4 h-4' />
										</Button>
									)}
								</div>
							))}

							<Button
								type='button'
								variant='outline'
								onClick={addIngredient}
								className='w-full'>
								<Plus className='w-4 h-4 mr-2' />
								Add Ingredient
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Step 3: Instructions */}
				{currentStep === 3 && (
					<Card>
						<CardHeader>
							<CardTitle>Preparation Steps</CardTitle>
							<CardDescription>Update the step-by-step instructions</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							{formData.steps.map((step, index) => (
								<div
									key={index}
									className='flex items-start gap-4'>
									<Badge
										variant='outline'
										className='mt-2'>
										{index + 1}
									</Badge>
									<div className='flex-1 space-y-2'>
										<Label htmlFor={`step-${index}`}>Step {index + 1} *</Label>
										<Textarea
											id={`step-${index}`}
											value={step}
											onChange={e => updateStep(index, e.target.value)}
											placeholder='Describe this step...'
											rows={2}
											required
										/>
									</div>
									{formData.steps.length > 1 && (
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={() => removeStep(index)}
											className='mt-8'>
											<Trash2 className='w-4 h-4' />
										</Button>
									)}
								</div>
							))}

							<Button
								type='button'
								variant='outline'
								onClick={addStep}
								className='w-full'>
								<Plus className='w-4 h-4 mr-2' />
								Add Step
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Step 4: Media */}
				{currentStep === 4 && (
					<Card>
						<CardHeader>
							<CardTitle>Media</CardTitle>
							<CardDescription>Update photos and videos for your recipe</CardDescription>
						</CardHeader>
						<CardContent>
							<MediaUpload
								onMediaChange={setMedia}
								value={media}
							/>
						</CardContent>
					</Card>
				)}

				{/* Navigation Buttons */}
				<div className='flex items-center justify-between'>
					<Button
						type='button'
						variant='outline'
						onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
						disabled={currentStep === 1}>
						Previous
					</Button>

					<Button
						type='submit'
						disabled={!validateStep() || updateRecipeMutation.isPending}>
						{updateRecipeMutation.isPending ? (
							<>
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								Updating...
							</>
						) : currentStep === 4 ? (
							<>
								<Save className='w-4 h-4 mr-2' />
								Update Recipe
							</>
						) : (
							'Next'
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
