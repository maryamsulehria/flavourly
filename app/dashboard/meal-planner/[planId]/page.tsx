'use client';

import { DeleteMealPlanDialog } from '@/components/delete-meal-plan-dialog';
import { RecipeCombobox } from '@/components/recipe-combobox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	useAddMealPlanEntry,
	useDeleteMealPlanEntry,
	useMealPlanEntries,
} from '@/lib/hooks/use-meal-plans';
import { useMealPlan } from '@/lib/hooks/use-queries';
import { useFavoritedRecipes, useUserRecipes } from '@/lib/hooks/use-recipes';
import { MealType } from '@prisma/client';
import { eachDayOfInterval, format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, Edit, Plus, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { use, useMemo, useState } from 'react';

const mealTypeLabels: Record<MealType, string> = {
	[MealType.Breakfast]: 'Breakfast',
	[MealType.Lunch]: 'Lunch',
	[MealType.Dinner]: 'Dinner',
	[MealType.Snack]: 'Snack',
};

const mealTypeColors: Record<MealType, string> = {
	[MealType.Breakfast]: 'bg-orange-100 text-orange-800 border-orange-200',
	[MealType.Lunch]: 'bg-blue-100 text-blue-800 border-blue-200',
	[MealType.Dinner]: 'bg-purple-100 text-purple-800 border-purple-200',
	[MealType.Snack]: 'bg-green-100 text-green-800 border-green-200',
};

function AddRecipeDialog({
	planId,
	mealDate,
	mealType,
	onSuccess,
}: {
	planId: number;
	mealDate: string;
	mealType: MealType;
	onSuccess: () => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedRecipe, setSelectedRecipe] = useState('');
	const [servingsToPrepare, setServingsToPrepare] = useState(1);
	const addMealPlanEntry = useAddMealPlanEntry();

	// Fetch both user's recipes and favorited recipes
	const { data: userRecipes, isLoading: userRecipesLoading } = useUserRecipes();
	const { data: favoritedRecipes, isLoading: favoritedRecipesLoading } = useFavoritedRecipes();

	// Combine and deduplicate recipes
	const allRecipes = useMemo(() => {
		if (!userRecipes && !favoritedRecipes) return [];

		const userRecipeIds = new Set(userRecipes?.map((r: any) => r.id) || []);
		const combined = [...(userRecipes || [])];

		// Add favorited recipes that aren't already in user recipes
		favoritedRecipes?.forEach((recipe: any) => {
			if (!userRecipeIds.has(recipe.id)) {
				combined.push(recipe);
			}
		});

		return combined;
	}, [userRecipes, favoritedRecipes]);

	const isLoading = userRecipesLoading || favoritedRecipesLoading;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedRecipe) return;

		try {
			await addMealPlanEntry.mutateAsync({
				planId,
				data: {
					recipeId: parseInt(selectedRecipe),
					mealDate,
					mealType,
					servingsToPrepare,
				},
			});
			setIsOpen(false);
			setSelectedRecipe('');
			setServingsToPrepare(1);
			onSuccess();
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					size='sm'
					variant='outline'
					className='w-full'>
					<Plus className='w-4 h-4 mr-1' />
					Add Recipe
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>Add Recipe to {mealTypeLabels[mealType]}</DialogTitle>
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
								{userRecipes?.length || 0} of your recipes • {favoritedRecipes?.length || 0}{' '}
								favorited recipes
							</p>
						)}
					</div>
					<div className='space-y-2'>
						<Label htmlFor='servings'>Servings to Prepare</Label>
						<Select
							value={servingsToPrepare.toString()}
							onValueChange={value => setServingsToPrepare(parseInt(value))}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[1, 2, 3, 4, 5, 6, 8, 10].map(serving => (
									<SelectItem
										key={serving}
										value={serving.toString()}>
										{serving} {serving === 1 ? 'serving' : 'servings'}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
							disabled={addMealPlanEntry.isPending || !selectedRecipe}>
							{addMealPlanEntry.isPending ? 'Adding...' : 'Add Recipe'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function RecipeCard({
	entry,
	planId,
	onRemove,
}: {
	entry: any;
	planId: number;
	onRemove: () => void;
}) {
	const deleteMealPlanEntry = useDeleteMealPlanEntry();

	const handleRemove = async () => {
		try {
			await deleteMealPlanEntry.mutateAsync({
				planId,
				entryId: entry.id,
			});
			onRemove();
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	return (
		<Card className='mb-2 hover:shadow-sm transition-shadow'>
			<CardContent className='p-3'>
				<div className='flex items-start justify-between'>
					<div className='flex-1 min-w-0'>
						<h4 className='font-medium text-sm truncate'>{entry.recipe.title}</h4>
						<div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
							<Clock className='w-3 h-3' />
							<span>{entry.recipe.cookingTimeMinutes || 'N/A'} min</span>
							<Users className='w-3 h-3' />
							<span>{entry.servingsToPrepare} servings</span>
						</div>
					</div>
					<Button
						size='sm'
						variant='ghost'
						onClick={handleRemove}
						disabled={deleteMealPlanEntry.isPending}
						className='text-destructive hover:text-destructive hover:bg-destructive/10'>
						<Trash2 className='w-3 h-3' />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function MealSlot({
	planId,
	date,
	mealType,
	entries,
}: {
	planId: number;
	date: Date;
	mealType: MealType;
	entries: any[];
}) {
	const mealDate = format(date, 'yyyy-MM-dd');

	return (
		<div className='border rounded-lg p-3 bg-card'>
			<div className='flex items-center justify-between mb-2'>
				<Badge className={mealTypeColors[mealType]}>{mealTypeLabels[mealType]}</Badge>
				<span className='text-xs text-muted-foreground'>
					{entries.length} {entries.length === 1 ? 'recipe' : 'recipes'}
				</span>
			</div>
			<div className='space-y-2'>
				{entries.map(entry => (
					<RecipeCard
						key={entry.id}
						entry={entry}
						planId={planId}
						onRemove={() => {
							// The centralized query system will automatically refetch the data
						}}
					/>
				))}
				<AddRecipeDialog
					planId={planId}
					mealDate={mealDate}
					mealType={mealType}
					onSuccess={() => {
						// The centralized query system will automatically refetch the data
					}}
				/>
			</div>
		</div>
	);
}

export default function MealPlanDetailPage({ params }: { params: Promise<{ planId: string }> }) {
	const { planId } = use(params);
	const planIdNum = parseInt(planId);
	const {
		data: entries,
		isLoading: entriesLoading,
		error: entriesError,
	} = useMealPlanEntries(planIdNum);
	const {
		data: mealPlan,
		isLoading: mealPlanLoading,
		error: mealPlanError,
	} = useMealPlan(planIdNum);

	// Generate days based on actual meal plan start and end dates
	const weekDays: Date[] = useMemo(() => {
		if (!mealPlan) return [];

		// Ensure consistent date handling by creating local dates
		const startDateStr = mealPlan.startDate.split('T')[0]; // Get just the date part
		const endDateStr = mealPlan.endDate.split('T')[0]; // Get just the date part

		const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
		const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

		const startDate = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed
		const endDate = new Date(endYear, endMonth - 1, endDay); // month is 0-indexed

		return eachDayOfInterval({ start: startDate, end: endDate });
	}, [mealPlan]);

	const isLoading = entriesLoading || mealPlanLoading;
	const error = entriesError || mealPlanError;

	// Group entries by date and meal type
	const entriesByDate =
		entries?.reduce((acc: any, entry: any) => {
			// Use the date part only to avoid timezone issues
			const date = entry.mealDate.split('T')[0];
			if (!acc[date]) {
				acc[date] = {};
			}
			if (!acc[date][entry.mealType]) {
				acc[date][entry.mealType] = [];
			}
			acc[date][entry.mealType].push(entry);
			return acc;
		}, {}) || {};

	if (error) {
		return (
			<div className='space-y-6'>
				<div className='flex flex-col items-start gap-4'>
					<Button
						variant='outline'
						size='sm'
						asChild>
						<Link href='/dashboard/meal-planner'>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Meal Planner
						</Link>
					</Button>
					<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
						<Calendar className='w-12 h-12 text-destructive' />
						<h2 className='text-xl font-semibold'>Error loading meal plan</h2>
						<p className='text-muted-foreground text-center max-w-md'>
							There was an error loading your meal plan. Please try again later.
						</p>
						<Button onClick={() => window.location.reload()}>Try Again</Button>
					</div>
				</div>
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
					<Link href='/dashboard/meal-planner'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Meal Planner
					</Link>
				</Button>
				<div className='flex items-center justify-between w-full'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Meal Plan Details</h1>
						<p className='text-muted-foreground'>View and manage your meal plan</p>
					</div>
					<div className='flex gap-2'>
						<Button
							asChild
							size='sm'>
							<Link href={`/dashboard/meal-planner/${planId}/edit`}>
								<Edit className='w-4 h-4 mr-2' />
								Edit Plan
							</Link>
						</Button>
						<DeleteMealPlanDialog
							planId={parseInt(planId)}
							planName='this meal plan'>
							<Button
								variant='outline'
								size='sm'
								className='text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'>
								<Trash2 className='w-4 h-4 mr-2' />
								Delete Plan
							</Button>
						</DeleteMealPlanDialog>
					</div>
				</div>
			</div>

			{/* Calendar Grid */}
			{isLoading ? (
				<div
					className={`grid gap-4`}
					style={{ gridTemplateColumns: `repeat(${Math.max(weekDays.length, 1)}, 1fr)` }}>
					{Array.from({ length: Math.max(weekDays.length, 1) }).map((_, dayIndex) => (
						<div
							key={dayIndex}
							className='space-y-4'>
							<div className='text-center'>
								<div className='font-medium text-muted-foreground'>
									{weekDays[dayIndex] ? format(weekDays[dayIndex], 'EEE') : ''}
								</div>
								<div className='text-2xl font-bold'>
									{weekDays[dayIndex] ? format(weekDays[dayIndex], 'd') : ''}
								</div>
							</div>
							{Object.values(MealType).map(mealType => (
								<div
									key={mealType}
									className='h-32 bg-muted rounded animate-pulse'
								/>
							))}
						</div>
					))}
				</div>
			) : (
				<div
					className={`grid gap-4`}
					style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}>
					{weekDays.map((date, dayIndex) => (
						<div
							key={dayIndex}
							className='space-y-4'>
							<div className='text-center'>
								<div className='font-medium text-muted-foreground'>{format(date, 'EEE')}</div>
								<div className='text-2xl font-bold'>{format(date, 'd')}</div>
							</div>
							{Object.values(MealType).map(mealType => {
								const dateKey = format(date, 'yyyy-MM-dd');
								const dayEntries = entriesByDate[dateKey]?.[mealType] || [];

								return (
									<MealSlot
										key={mealType}
										planId={parseInt(planId)}
										date={date}
										mealType={mealType}
										entries={dayEntries}
									/>
								);
							})}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
