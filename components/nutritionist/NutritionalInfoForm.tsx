'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { NutritionDataSource } from '@prisma/client';
import { Calculator, RefreshCw, Save } from 'lucide-react';
import { useState } from 'react';
import { DetailedRecipe } from './RecipeVerificationForm';

interface NutritionalInfoFormProps {
	recipe: DetailedRecipe;
	onUpdate: (nutritionalInfo: any) => void;
}

interface NutritionalData {
	calories: string;
	proteinGrams: string;
	carbohydratesGrams: string;
	fatGrams: string;
	fiberGrams: string;
	sugarGrams: string;
	sodiumMg: string;
	dataSource: NutritionDataSource;
}

export default function NutritionalInfoForm({ recipe, onUpdate }: NutritionalInfoFormProps) {
	const [nutritionalData, setNutritionalData] = useState<NutritionalData>({
		calories: recipe.nutritionalInfo?.calories || '',
		proteinGrams: recipe.nutritionalInfo?.proteinGrams || '',
		carbohydratesGrams: recipe.nutritionalInfo?.carbohydratesGrams || '',
		fatGrams: recipe.nutritionalInfo?.fatGrams || '',
		fiberGrams: recipe.nutritionalInfo?.fiberGrams || '',
		sugarGrams: recipe.nutritionalInfo?.sugarGrams || '',
		sodiumMg: recipe.nutritionalInfo?.sodiumMg || '',
		dataSource:
			(recipe.nutritionalInfo?.dataSource as NutritionDataSource) ||
			NutritionDataSource.estimated_api,
	});

	const [isRecalculating, setIsRecalculating] = useState(false);

	const handleInputChange = (field: keyof NutritionalData, value: string) => {
		setNutritionalData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = () => {
		// Convert empty strings to null for database storage
		const processedData = Object.entries(nutritionalData).reduce((acc, [key, value]) => {
			if (key === 'dataSource') {
				acc[key] = value;
			} else {
				acc[key] = value === '' ? null : value;
			}
			return acc;
		}, {} as any);

		onUpdate(processedData);
	};

	const handleRecalculate = async () => {
		setIsRecalculating(true);
		try {
			// Here you would typically call an API to recalculate nutrition
			// For now, we'll simulate this with a timeout
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Simulate API response with estimated values
			const estimatedData = {
				calories: '250',
				proteinGrams: '12',
				carbohydratesGrams: '30',
				fatGrams: '8',
				fiberGrams: '5',
				sugarGrams: '6',
				sodiumMg: '400',
				dataSource: NutritionDataSource.estimated_api,
			};

			setNutritionalData(estimatedData);
		} catch (error) {
			console.error('Error recalculating nutrition:', error);
		} finally {
			setIsRecalculating(false);
		}
	};

	const isDataSourceVerified =
		nutritionalData.dataSource === NutritionDataSource.verified_nutritionist;

	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle className='flex items-center'>
							<Calculator className='h-5 w-5 mr-2' />
							Nutritional Information
						</CardTitle>
						<div className='flex items-center space-x-2'>
							<Badge variant={isDataSourceVerified ? 'default' : 'secondary'}>
								{nutritionalData.dataSource === NutritionDataSource.verified_nutritionist
									? 'Verified by Nutritionist'
									: 'Estimated from API'}
							</Badge>
							<Button
								variant='outline'
								size='sm'
								onClick={handleRecalculate}
								disabled={isRecalculating}>
								{isRecalculating ? (
									<RefreshCw className='h-4 w-4 mr-2 animate-spin' />
								) : (
									<Calculator className='h-4 w-4 mr-2' />
								)}
								Recalculate
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Data Source Selection */}
					<div className='space-y-2'>
						<Label htmlFor='dataSource'>Data Source</Label>
						<Select
							value={nutritionalData.dataSource}
							onValueChange={(value: NutritionDataSource) =>
								handleInputChange('dataSource', value)
							}>
							<SelectTrigger>
								<SelectValue placeholder='Select data source' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={NutritionDataSource.estimated_api}>
									Estimated from API
								</SelectItem>
								<SelectItem value={NutritionDataSource.verified_nutritionist}>
									Verified by Nutritionist
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Separator />

					{/* Macronutrients */}
					<div className='space-y-4'>
						<h3 className='font-semibold'>Macronutrients</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='calories'>Calories</Label>
								<Input
									id='calories'
									type='number'
									step='0.1'
									value={nutritionalData.calories}
									onChange={e => handleInputChange('calories', e.target.value)}
									placeholder='0'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='proteinGrams'>Protein (g)</Label>
								<Input
									id='proteinGrams'
									type='number'
									step='0.1'
									value={nutritionalData.proteinGrams}
									onChange={e => handleInputChange('proteinGrams', e.target.value)}
									placeholder='0'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='carbohydratesGrams'>Carbohydrates (g)</Label>
								<Input
									id='carbohydratesGrams'
									type='number'
									step='0.1'
									value={nutritionalData.carbohydratesGrams}
									onChange={e => handleInputChange('carbohydratesGrams', e.target.value)}
									placeholder='0'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='fatGrams'>Fat (g)</Label>
								<Input
									id='fatGrams'
									type='number'
									step='0.1'
									value={nutritionalData.fatGrams}
									onChange={e => handleInputChange('fatGrams', e.target.value)}
									placeholder='0'
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Micronutrients */}
					<div className='space-y-4'>
						<h3 className='font-semibold'>Additional Nutrients</h3>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='fiberGrams'>Fiber (g)</Label>
								<Input
									id='fiberGrams'
									type='number'
									step='0.1'
									value={nutritionalData.fiberGrams}
									onChange={e => handleInputChange('fiberGrams', e.target.value)}
									placeholder='0'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='sugarGrams'>Sugar (g)</Label>
								<Input
									id='sugarGrams'
									type='number'
									step='0.1'
									value={nutritionalData.sugarGrams}
									onChange={e => handleInputChange('sugarGrams', e.target.value)}
									placeholder='0'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='sodiumMg'>Sodium (mg)</Label>
								<Input
									id='sodiumMg'
									type='number'
									step='0.1'
									value={nutritionalData.sodiumMg}
									onChange={e => handleInputChange('sodiumMg', e.target.value)}
									placeholder='0'
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Nutritional Summary */}
					<div className='space-y-4'>
						<h3 className='font-semibold'>Nutritional Summary</h3>
						<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
							<div className='text-center p-3 bg-muted rounded-lg'>
								<div className='text-2xl font-bold text-primary'>
									{nutritionalData.calories || '0'}
								</div>
								<div className='text-sm text-muted-foreground'>Calories</div>
							</div>
							<div className='text-center p-3 bg-muted rounded-lg'>
								<div className='text-2xl font-bold text-blue-600'>
									{nutritionalData.proteinGrams || '0'}g
								</div>
								<div className='text-sm text-muted-foreground'>Protein</div>
							</div>
							<div className='text-center p-3 bg-muted rounded-lg'>
								<div className='text-2xl font-bold text-green-600'>
									{nutritionalData.carbohydratesGrams || '0'}g
								</div>
								<div className='text-sm text-muted-foreground'>Carbs</div>
							</div>
							<div className='text-center p-3 bg-muted rounded-lg'>
								<div className='text-2xl font-bold text-orange-600'>
									{nutritionalData.fatGrams || '0'}g
								</div>
								<div className='text-sm text-muted-foreground'>Fat</div>
							</div>
						</div>
					</div>

					<div className='flex justify-end'>
						<Button
							onClick={handleSave}
							className='flex items-center'>
							<Save className='h-4 w-4 mr-2' />
							Save Nutritional Information
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
