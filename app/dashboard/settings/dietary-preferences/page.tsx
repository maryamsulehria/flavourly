'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useUpdateDietaryPreferences, useUser } from '@/lib/hooks/use-user';
import { ArrowLeft, Save, Utensils } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DietaryPreferences {
	dietaryRestrictions: string[];
	allergies: string[];
	cuisinePreferences: string[];
	cookingSkill: string;
	spiceTolerance: string;
	mealSize: string;
}

const DIETARY_RESTRICTIONS = [
	'Vegetarian',
	'Vegan',
	'Gluten-Free',
	'Dairy-Free',
	'Keto',
	'Low-Carb',
	'Paleo',
	'Low-Sodium',
	'Low-Fat',
	'High-Protein',
	'Low-Calorie',
	'Nut-Free',
	'Soy-Free',
	'Egg-Free',
	'Shellfish-Free',
];

const ALLERGIES = [
	'Peanuts',
	'Tree Nuts',
	'Milk',
	'Eggs',
	'Soy',
	'Wheat',
	'Fish',
	'Shellfish',
	'Sesame',
	'Mustard',
	'Celery',
	'Sulfites',
];

const CUISINE_PREFERENCES = [
	'Italian',
	'Mexican',
	'Asian',
	'Mediterranean',
	'American',
	'Indian',
	'Thai',
	'Chinese',
	'Japanese',
	'French',
	'Greek',
	'Spanish',
	'Middle Eastern',
	'Caribbean',
	'African',
];

const COOKING_SKILLS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SPICE_TOLERANCE = ['Mild', 'Medium', 'Hot', 'Very Hot'];

const MEAL_SIZES = ['Small', 'Medium', 'Large'];

export default function DietaryPreferencesPage() {
	const { data: user, isLoading } = useUser();
	const updateDietaryPreferences = useUpdateDietaryPreferences();

	const [preferences, setPreferences] = useState<DietaryPreferences>({
		dietaryRestrictions: [],
		allergies: [],
		cuisinePreferences: [],
		cookingSkill: '',
		spiceTolerance: '',
		mealSize: '',
	});

	// Initialize preferences when user data loads
	useEffect(() => {
		if (user && !preferences.cookingSkill) {
			setPreferences({
				dietaryRestrictions: user.dietaryRestrictions || [],
				allergies: user.allergies || [],
				cuisinePreferences: user.cuisinePreferences || [],
				cookingSkill: user.cookingSkill || '',
				spiceTolerance: user.spiceTolerance || '',
				mealSize: user.mealSize || '',
			});
		}
	}, [user, preferences.cookingSkill]);

	const handleRestrictionToggle = (restriction: string) => {
		setPreferences(prev => ({
			...prev,
			dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
				? prev.dietaryRestrictions.filter(r => r !== restriction)
				: [...prev.dietaryRestrictions, restriction],
		}));
	};

	const handleAllergyToggle = (allergy: string) => {
		setPreferences(prev => ({
			...prev,
			allergies: prev.allergies.includes(allergy)
				? prev.allergies.filter(a => a !== allergy)
				: [...prev.allergies, allergy],
		}));
	};

	const handleCuisineToggle = (cuisine: string) => {
		setPreferences(prev => ({
			...prev,
			cuisinePreferences: prev.cuisinePreferences.includes(cuisine)
				? prev.cuisinePreferences.filter(c => c !== cuisine)
				: [...prev.cuisinePreferences, cuisine],
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await updateDietaryPreferences.mutateAsync({
				dietaryRestrictions: preferences.dietaryRestrictions,
				allergies: preferences.allergies,
				cuisinePreferences: preferences.cuisinePreferences,
				cookingSkill: preferences.cookingSkill,
				spiceTolerance: preferences.spiceTolerance,
				mealSize: preferences.mealSize,
			});
		} catch (error) {
			// Error is handled by the mutation hook
		}
	};

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='flex flex-col items-start gap-4'>
					<Button
						variant='outline'
						size='sm'
						disabled>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Settings
					</Button>
					<div>
						<div className='h-8 w-64 bg-muted rounded animate-pulse mb-2' />
						<div className='h-4 w-80 bg-muted rounded animate-pulse' />
					</div>
				</div>
				<div className='space-y-4'>
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<div className='h-6 w-32 bg-muted rounded animate-pulse' />
							</CardHeader>
							<CardContent className='space-y-4'>
								{Array.from({ length: 3 }).map((_, j) => (
									<div
										key={j}
										className='space-y-2'>
										<div className='h-4 w-24 bg-muted rounded animate-pulse' />
										<div className='h-10 w-full bg-muted rounded animate-pulse' />
									</div>
								))}
							</CardContent>
						</Card>
					))}
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
					<Link href='/dashboard/settings'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Settings
					</Link>
				</Button>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Dietary Preferences</h1>
					<p className='text-muted-foreground'>Customize your food preferences and restrictions</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<div className='space-y-6'>
					{/* Dietary Restrictions */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Utensils className='w-5 h-5 text-muted-foreground' />
								Dietary Restrictions
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
								{DIETARY_RESTRICTIONS.map(restriction => (
									<div
										key={restriction}
										className='flex items-center space-x-2'>
										<Checkbox
											id={restriction}
											checked={preferences.dietaryRestrictions.includes(restriction)}
											onCheckedChange={() => handleRestrictionToggle(restriction)}
										/>
										<Label
											htmlFor={restriction}
											className='text-sm'>
											{restriction}
										</Label>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Allergies */}
					<Card>
						<CardHeader>
							<CardTitle>Food Allergies & Intolerances</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
								{ALLERGIES.map(allergy => (
									<div
										key={allergy}
										className='flex items-center space-x-2'>
										<Checkbox
											id={allergy}
											checked={preferences.allergies.includes(allergy)}
											onCheckedChange={() => handleAllergyToggle(allergy)}
										/>
										<Label
											htmlFor={allergy}
											className='text-sm'>
											{allergy}
										</Label>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Cuisine Preferences */}
					<Card>
						<CardHeader>
							<CardTitle>Cuisine Preferences</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
								{CUISINE_PREFERENCES.map(cuisine => (
									<div
										key={cuisine}
										className='flex items-center space-x-2'>
										<Checkbox
											id={cuisine}
											checked={preferences.cuisinePreferences.includes(cuisine)}
											onCheckedChange={() => handleCuisineToggle(cuisine)}
										/>
										<Label
											htmlFor={cuisine}
											className='text-sm'>
											{cuisine}
										</Label>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Cooking Preferences */}
					<Card>
						<CardHeader>
							<CardTitle>Cooking Preferences</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='cooking-skill'>Cooking Skill Level</Label>
									<Select
										value={preferences.cookingSkill}
										onValueChange={value =>
											setPreferences(prev => ({ ...prev, cookingSkill: value }))
										}>
										<SelectTrigger>
											<SelectValue placeholder='Select skill level' />
										</SelectTrigger>
										<SelectContent>
											{COOKING_SKILLS.map(skill => (
												<SelectItem
													key={skill}
													value={skill}>
													{skill}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='spice-tolerance'>Spice Tolerance</Label>
									<Select
										value={preferences.spiceTolerance}
										onValueChange={value =>
											setPreferences(prev => ({ ...prev, spiceTolerance: value }))
										}>
										<SelectTrigger>
											<SelectValue placeholder='Select tolerance' />
										</SelectTrigger>
										<SelectContent>
											{SPICE_TOLERANCE.map(tolerance => (
												<SelectItem
													key={tolerance}
													value={tolerance}>
													{tolerance}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='meal-size'>Preferred Meal Size</Label>
									<Select
										value={preferences.mealSize}
										onValueChange={value => setPreferences(prev => ({ ...prev, mealSize: value }))}>
										<SelectTrigger>
											<SelectValue placeholder='Select meal size' />
										</SelectTrigger>
										<SelectContent>
											{MEAL_SIZES.map(size => (
												<SelectItem
													key={size}
													value={size}>
													{size}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Your Preferences Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{preferences.dietaryRestrictions.length > 0 && (
									<div>
										<h4 className='font-medium text-sm mb-2'>Dietary Restrictions:</h4>
										<div className='flex flex-wrap gap-2'>
											{preferences.dietaryRestrictions.map(restriction => (
												<Badge
													key={restriction}
													variant='secondary'>
													{restriction}
												</Badge>
											))}
										</div>
									</div>
								)}

								{preferences.allergies.length > 0 && (
									<div>
										<h4 className='font-medium text-sm mb-2'>Allergies:</h4>
										<div className='flex flex-wrap gap-2'>
											{preferences.allergies.map(allergy => (
												<Badge
													key={allergy}
													variant='destructive'>
													{allergy}
												</Badge>
											))}
										</div>
									</div>
								)}

								{preferences.cuisinePreferences.length > 0 && (
									<div>
										<h4 className='font-medium text-sm mb-2'>Preferred Cuisines:</h4>
										<div className='flex flex-wrap gap-2'>
											{preferences.cuisinePreferences.map(cuisine => (
												<Badge
													key={cuisine}
													variant='outline'>
													{cuisine}
												</Badge>
											))}
										</div>
									</div>
								)}

								{(preferences.cookingSkill ||
									preferences.spiceTolerance ||
									preferences.mealSize) && (
									<div>
										<h4 className='font-medium text-sm mb-2'>Cooking Preferences:</h4>
										<div className='flex flex-wrap gap-2'>
											{preferences.cookingSkill && (
												<Badge variant='outline'>Skill: {preferences.cookingSkill}</Badge>
											)}
											{preferences.spiceTolerance && (
												<Badge variant='outline'>Spice: {preferences.spiceTolerance}</Badge>
											)}
											{preferences.mealSize && (
												<Badge variant='outline'>Size: {preferences.mealSize}</Badge>
											)}
										</div>
									</div>
								)}

								{preferences.dietaryRestrictions.length === 0 &&
									preferences.allergies.length === 0 &&
									preferences.cuisinePreferences.length === 0 &&
									!preferences.cookingSkill &&
									!preferences.spiceTolerance &&
									!preferences.mealSize && (
										<p className='text-muted-foreground text-sm'>
											No preferences set yet. Select your preferences above to get personalized
											recipe recommendations.
										</p>
									)}
							</div>
						</CardContent>
					</Card>

					{/* Submit Button */}
					<div className='flex justify-end'>
						<Button
							type='submit'
							disabled={updateDietaryPreferences.isPending}>
							{updateDietaryPreferences.isPending ? (
								<>
									<Save className='w-4 h-4 mr-2 animate-spin' />
									Saving...
								</>
							) : (
								<>
									<Save className='w-4 h-4 mr-2' />
									Save Preferences
								</>
							)}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
