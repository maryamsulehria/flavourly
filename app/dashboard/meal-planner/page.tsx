'use client';

import { DeleteMealPlanDialog } from '@/components/delete-meal-plan-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateMealPlan, useMealPlans } from '@/lib/hooks/use-meal-plans';
import { MealType } from '@prisma/client';
import { eachDayOfInterval, format } from 'date-fns';
import { ArrowLeft, Calendar, CalendarDays, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const mealTypeLabels: Record<MealType, string> = {
	[MealType.Breakfast]: 'Breakfast',
	[MealType.Lunch]: 'Lunch',
	[MealType.Dinner]: 'Dinner',
	[MealType.Snack]: 'Snack',
};

const mealTypeShortLabels: Record<MealType, string> = {
	[MealType.Breakfast]: 'Break',
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

function CreateMealPlanDialog({ onSuccess }: { onSuccess: () => void }) {
	const [isOpen, setIsOpen] = useState(false);
	const [planName, setPlanName] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const createMealPlan = useCreateMealPlan();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!planName || !startDate || !endDate) return;

		try {
			await createMealPlan.mutateAsync({
				planName,
				startDate,
				endDate,
			});
			setIsOpen(false);
			setPlanName('');
			setStartDate('');
			setEndDate('');
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
				<Button>
					<Plus className='w-4 h-4 mr-2' />
					Create Meal Plan
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Meal Plan</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='planName'>Plan Name</Label>
						<Input
							id='planName'
							value={planName}
							onChange={e => setPlanName(e.target.value)}
							placeholder='e.g., Week of July 15th'
							required
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='startDate'>Start Date</Label>
						<Input
							id='startDate'
							type='date'
							value={startDate}
							onChange={e => setStartDate(e.target.value)}
							required
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='endDate'>End Date</Label>
						<Input
							id='endDate'
							type='date'
							value={endDate}
							onChange={e => setEndDate(e.target.value)}
							required
						/>
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
							disabled={createMealPlan.isPending}>
							{createMealPlan.isPending ? 'Creating...' : 'Create Plan'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function MealPlanCard({ mealPlan }: { mealPlan: any }) {
	// Ensure consistent date handling by creating local dates
	const startDateStr = mealPlan.startDate.split('T')[0]; // Get just the date part
	const endDateStr = mealPlan.endDate.split('T')[0]; // Get just the date part

	const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
	const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

	const startDate = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed
	const endDate = new Date(endYear, endMonth - 1, endDay); // month is 0-indexed

	// Generate days based on actual meal plan start and end dates
	const allDays = eachDayOfInterval({ start: startDate, end: endDate });

	// Limit to maximum 6 days for the card view
	const weekDays = allDays.slice(0, 6);

	// Group entries by date and meal type
	const entriesByDate = mealPlan.entries.reduce((acc: any, entry: any) => {
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
	}, {});

	return (
		<Card className='h-full hover:shadow-md transition-shadow flex flex-col'>
			<CardHeader className='pb-3 flex-shrink-0'>
				<div className='flex items-center justify-between'>
					<CardTitle className='text-lg font-semibold flex items-center gap-2'>
						<CalendarDays className='w-5 h-5 text-muted-foreground' />
						{mealPlan.planName}
					</CardTitle>
					<Badge variant='secondary'>{mealPlan.entries.length} meals</Badge>
				</div>
				<div className='text-sm text-muted-foreground'>
					{format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
					{allDays.length > 6 && (
						<span className='ml-2 text-xs bg-muted px-2 py-1 rounded'>
							+{allDays.length - 6} more days
						</span>
					)}
				</div>
			</CardHeader>
			<CardContent className='pt-0 flex-1 flex flex-col'>
				<div
					className={`grid gap-2 text-xs flex-1`}
					style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}>
					{weekDays.map((day: Date, index: number) => (
						<div
							key={index}
							className='text-center min-w-0'>
							<div className='font-medium text-muted-foreground'>{format(day, 'EEE')}</div>
							<div className='text-lg font-bold'>{format(day, 'd')}</div>
							<div className='space-y-1 mt-2'>
								{Object.values(MealType).map(mealType => {
									const dateKey = format(day, 'yyyy-MM-dd');
									const entries = entriesByDate[dateKey]?.[mealType] || [];

									if (entries.length === 0) return null;

									return (
										<div
											key={mealType}
											className={`p-1 rounded text-xs border break-words ${mealTypeColors[mealType]}`}>
											{entries.length} {mealTypeShortLabels[mealType]}
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
				{/* Action Buttons - always at bottom */}
				<div className='flex gap-2 mt-auto pt-4'>
					<Button
						variant='outline'
						size='sm'
						className='flex-1'
						asChild>
						<Link href={`/dashboard/meal-planner/${mealPlan.id}`}>
							<Calendar className='w-4 h-4 mr-2' />
							View Details
						</Link>
					</Button>
					<Button
						size='sm'
						className='flex-1'
						asChild>
						<Link href={`/dashboard/meal-planner/${mealPlan.id}/edit`}>
							<Plus className='w-4 h-4 mr-2' />
							Add Meals
						</Link>
					</Button>
					<DeleteMealPlanDialog
						planId={mealPlan.id}
						planName={mealPlan.planName}>
						<Button
							variant='outline'
							size='sm'
							className='text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'>
							<Trash2 className='w-4 h-4' />
						</Button>
					</DeleteMealPlanDialog>
				</div>
			</CardContent>
		</Card>
	);
}

function MealPlanSkeleton() {
	return (
		<Card className='h-full'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<div className='h-6 w-32 bg-muted rounded' />
					<div className='h-5 w-16 bg-muted rounded' />
				</div>
				<div className='h-4 w-24 bg-muted rounded' />
			</CardHeader>
			<CardContent className='pt-0'>
				<div
					className='grid gap-2'
					style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
					{Array.from({ length: 7 }).map((_, i) => (
						<div
							key={i}
							className='text-center min-w-0'>
							<div className='h-4 w-8 bg-muted rounded mx-auto mb-1' />
							<div className='h-6 w-6 bg-muted rounded mx-auto mb-2' />
							<div className='space-y-1'>
								<div className='h-3 w-full bg-muted rounded' />
								<div className='h-3 w-full bg-muted rounded' />
							</div>
						</div>
					))}
				</div>
				<div className='flex gap-2 mt-4'>
					<div className='h-8 flex-1 bg-muted rounded' />
					<div className='h-8 flex-1 bg-muted rounded' />
				</div>
			</CardContent>
		</Card>
	);
}

export default function MealPlannerPage() {
	const { data: mealPlans, isLoading, error } = useMealPlans();

	if (error) {
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
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Meal Planner</h1>
						<p className='text-muted-foreground'>Plan your meals for the week</p>
					</div>
				</div>

				<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
					<Calendar className='w-12 h-12 text-destructive' />
					<h2 className='text-xl font-semibold'>Error loading meal plans</h2>
					<p className='text-muted-foreground text-center max-w-md'>
						There was an error loading your meal plans. Please try again later.
					</p>
					<Button onClick={() => window.location.reload()}>Try Again</Button>
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
					<Link href='/dashboard'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Dashboard
					</Link>
				</Button>
				<div className='flex items-center justify-between w-full'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Meal Planner</h1>
						<p className='text-muted-foreground'>Plan your meals for the week</p>
					</div>
					<CreateMealPlanDialog
						onSuccess={() => {
							// The centralized query system will automatically refetch the data
						}}
					/>
				</div>
			</div>

			{/* Meal Plans Grid */}
			<div>
				{isLoading ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{Array.from({ length: 6 }).map((_, i) => (
							<MealPlanSkeleton key={i} />
						))}
					</div>
				) : mealPlans && mealPlans.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{mealPlans.map((mealPlan: any) => (
							<MealPlanCard
								key={mealPlan.id}
								mealPlan={mealPlan}
							/>
						))}
					</div>
				) : (
					<div className='text-center py-12'>
						<Calendar className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
						<h3 className='text-lg font-semibold mb-2'>No meal plans yet</h3>
						<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
							Start planning your meals by creating your first meal plan. You can add recipes to
							specific days and meal times.
						</p>
						<CreateMealPlanDialog
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
