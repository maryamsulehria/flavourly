'use client';

import { RecipeCard } from '@/components/recipe-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilteredPublicRecipes } from '@/lib/hooks/use-queries';
import { usePublicTags } from '@/lib/hooks/use-tags';
import { ChefHat, Filter, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

interface FilterState {
	search: string;
	mealType: string[];
	dietaryPreferences: string[];
	cuisine: string[];
	cookingTime: string;
	difficulty: string;
	rating: string;
	cookingMethod: string[];
	health: string[];
}

function RecipesPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Fetch available tags for filtering
	const { data: tagTypes, isLoading: tagsLoading } = usePublicTags();

	// Initialize filters from URL params
	const [filters, setFilters] = useState<FilterState>({
		search: searchParams.get('search') || '',
		mealType: searchParams.get('mealType')?.split(',') || [],
		dietaryPreferences: searchParams.get('dietary')?.split(',') || [],
		cuisine: searchParams.get('cuisine')?.split(',') || [],
		cookingTime: searchParams.get('time') || '',
		difficulty: searchParams.get('difficulty') || '',
		rating: searchParams.get('rating') || '',
		cookingMethod: searchParams.get('cookingMethod')?.split(',') || [],
		health: searchParams.get('health')?.split(',') || [],
	});

	const [currentPage, setCurrentPage] = useState(1);

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams();

		if (filters.search) params.set('search', filters.search);
		if (filters.mealType.length > 0) params.set('mealType', filters.mealType.join(','));
		if (filters.dietaryPreferences.length > 0)
			params.set('dietary', filters.dietaryPreferences.join(','));
		if (filters.cuisine.length > 0) params.set('cuisine', filters.cuisine.join(','));
		if (filters.cookingTime) params.set('time', filters.cookingTime);
		if (filters.difficulty) params.set('difficulty', filters.difficulty);
		if (filters.rating) params.set('rating', filters.rating);
		if (filters.cookingMethod.length > 0)
			params.set('cookingMethod', filters.cookingMethod.join(','));
		if (filters.health.length > 0) params.set('health', filters.health.join(','));

		const newUrl = params.toString() ? `?${params.toString()}` : '/recipes';
		router.replace(newUrl, { scroll: false });
	}, [filters, router]);

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [filters]);

	// Fetch recipes with filters
	const {
		data: recipesData,
		isLoading,
		error,
	} = useFilteredPublicRecipes({
		search: filters.search,
		sort: 'recent',
		mealType: filters.mealType,
		dietary: filters.dietaryPreferences,
		cuisine: filters.cuisine,
		time: filters.cookingTime,
		difficulty: filters.difficulty,
		rating: filters.rating,
		cookingMethod: filters.cookingMethod,
		health: filters.health,
		page: currentPage,
		limit: 12,
	});

	const recipes = recipesData?.recipes || [];

	// Handle filter changes
	const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
		setFilters(prev => ({
			...prev,
			[key]: value === 'all' ? '' : value,
		}));
	};

	const handleArrayFilterChange = (key: keyof FilterState, value: string, checked: boolean) => {
		setFilters(prev => {
			const currentArray = prev[key] as string[];
			if (checked) {
				return { ...prev, [key]: [...currentArray, value] };
			} else {
				return { ...prev, [key]: currentArray.filter(item => item !== value) };
			}
		});
	};

	// Calculate active filters count (excluding search)
	const activeFiltersCount =
		filters.mealType.length +
		filters.dietaryPreferences.length +
		filters.cuisine.length +
		(filters.cookingTime ? 1 : 0) +
		(filters.difficulty ? 1 : 0) +
		(filters.rating ? 1 : 0) +
		filters.cookingMethod.length +
		filters.health.length;

	const totalCount = recipesData?.totalCount || 0;
	const totalPages = Math.ceil(totalCount / 12);

	// Handle pagination
	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, []);

	if (error) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-red-600 mb-4'>Error Loading Recipes</h2>
					<p className='text-gray-600'>
						Something went wrong while loading the recipes. Please try again.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-background'>
			{/* Header */}
			<div className='bg-gradient-to-r from-primary/5 to-primary/10 border-b'>
				<div className='container mx-auto px-4 py-8'>
					<div className='space-y-4'>
						<h1 className='text-4xl font-bold'>Discover Recipes</h1>
						<p className='text-muted-foreground text-lg'>
							Find your next favorite meal from our collection of verified recipes
						</p>

						{/* Search Bar */}
						<div className='relative max-w-2xl'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5' />
							<Input
								type='text'
								placeholder='Search for recipes, ingredients, or cuisines...'
								value={filters.search}
								onChange={e => handleFilterChange('search', e.target.value)}
								className='pl-10'
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='container mx-auto px-4 py-8'>
				<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
					{/* Filters Sidebar */}
					<div className='lg:col-span-1'>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center gap-2 mb-6'>
									<Filter className='h-5 w-5' />
									<h2 className='text-lg font-semibold'>Filters</h2>
								</div>

								<div className='space-y-6'>
									{/* Meal Type */}
									<div>
										<h3 className='font-medium mb-3'>Meal Type</h3>
										{tagsLoading ? (
											<div className='space-y-2'>
												{Array.from({ length: 5 }).map((_, i) => (
													<div
														key={i}
														className='flex items-center space-x-2'>
														<Skeleton className='h-4 w-4' />
														<Skeleton className='h-4 w-20' />
													</div>
												))}
											</div>
										) : (
											<div className='space-y-2'>
												{tagTypes
													?.find(type => type.typeName === 'Meal Type')
													?.tags.map(tag => (
														<div
															key={tag.id}
															className='flex items-center space-x-2'>
															<Checkbox
																id={`mealType-${tag.tagName}`}
																checked={filters.mealType.includes(tag.tagName)}
																onCheckedChange={checked =>
																	handleArrayFilterChange(
																		'mealType',
																		tag.tagName,
																		checked as boolean,
																	)
																}
															/>
															<label
																htmlFor={`mealType-${tag.tagName}`}
																className='text-sm cursor-pointer'>
																{tag.tagName}
															</label>
														</div>
													))}
											</div>
										)}
									</div>

									{/* Dietary Preferences */}
									<div>
										<h3 className='font-medium mb-3'>Dietary Preferences</h3>
										{tagsLoading ? (
											<div className='space-y-2'>
												{Array.from({ length: 8 }).map((_, i) => (
													<div
														key={i}
														className='flex items-center space-x-2'>
														<Skeleton className='h-4 w-4' />
														<Skeleton className='h-4 w-24' />
													</div>
												))}
											</div>
										) : (
											<div className='space-y-2'>
												{tagTypes
													?.find(type => type.typeName === 'Dietary')
													?.tags.map(tag => (
														<div
															key={tag.id}
															className='flex items-center space-x-2'>
															<Checkbox
																id={`dietary-${tag.tagName}`}
																checked={filters.dietaryPreferences.includes(tag.tagName)}
																onCheckedChange={checked =>
																	handleArrayFilterChange(
																		'dietaryPreferences',
																		tag.tagName,
																		checked as boolean,
																	)
																}
															/>
															<label
																htmlFor={`dietary-${tag.tagName}`}
																className='text-sm cursor-pointer'>
																{tag.tagName}
															</label>
														</div>
													))}
											</div>
										)}
									</div>

									{/* Cuisine */}
									<div>
										<h3 className='font-medium mb-3'>Cuisine</h3>
										{tagsLoading ? (
											<div className='space-y-2'>
												{Array.from({ length: 8 }).map((_, i) => (
													<div
														key={i}
														className='flex items-center space-x-2'>
														<Skeleton className='h-4 w-4' />
														<Skeleton className='h-4 w-20' />
													</div>
												))}
											</div>
										) : (
											<div className='space-y-2'>
												{tagTypes
													?.find(type => type.typeName === 'Cuisine')
													?.tags.map(tag => (
														<div
															key={tag.id}
															className='flex items-center space-x-2'>
															<Checkbox
																id={`cuisine-${tag.tagName}`}
																checked={filters.cuisine.includes(tag.tagName)}
																onCheckedChange={checked =>
																	handleArrayFilterChange(
																		'cuisine',
																		tag.tagName,
																		checked as boolean,
																	)
																}
															/>
															<label
																htmlFor={`cuisine-${tag.tagName}`}
																className='text-sm cursor-pointer'>
																{tag.tagName}
															</label>
														</div>
													))}
											</div>
										)}
									</div>

									{/* Cooking Method */}
									<div>
										<h3 className='font-medium mb-3'>Cooking Method</h3>
										{tagsLoading ? (
											<div className='space-y-2'>
												{Array.from({ length: 6 }).map((_, i) => (
													<div
														key={i}
														className='flex items-center space-x-2'>
														<Skeleton className='h-4 w-4' />
														<Skeleton className='h-4 w-20' />
													</div>
												))}
											</div>
										) : (
											<div className='space-y-2'>
												{tagTypes
													?.find(type => type.typeName === 'Cooking Method')
													?.tags.map(tag => (
														<div
															key={tag.id}
															className='flex items-center space-x-2'>
															<Checkbox
																id={`cookingMethod-${tag.tagName}`}
																checked={filters.cookingMethod.includes(tag.tagName)}
																onCheckedChange={checked =>
																	handleArrayFilterChange(
																		'cookingMethod',
																		tag.tagName,
																		checked as boolean,
																	)
																}
															/>
															<label
																htmlFor={`cookingMethod-${tag.tagName}`}
																className='text-sm cursor-pointer'>
																{tag.tagName}
															</label>
														</div>
													))}
											</div>
										)}
									</div>

									{/* Health Benefits */}
									<div>
										<h3 className='font-medium mb-3'>Health Benefits</h3>
										{tagsLoading ? (
											<div className='space-y-2'>
												{Array.from({ length: 8 }).map((_, i) => (
													<div
														key={i}
														className='flex items-center space-x-2'>
														<Skeleton className='h-4 w-4' />
														<Skeleton className='h-4 w-24' />
													</div>
												))}
											</div>
										) : (
											<div className='space-y-2'>
												{tagTypes
													?.find(type => type.typeName === 'Health')
													?.tags.map(tag => (
														<div
															key={tag.id}
															className='flex items-center space-x-2'>
															<Checkbox
																id={`health-${tag.tagName}`}
																checked={filters.health.includes(tag.tagName)}
																onCheckedChange={checked =>
																	handleArrayFilterChange('health', tag.tagName, checked as boolean)
																}
															/>
															<label
																htmlFor={`health-${tag.tagName}`}
																className='text-sm cursor-pointer'>
																{tag.tagName}
															</label>
														</div>
													))}
											</div>
										)}
									</div>

									{/* Cooking Time */}
									<div>
										<h3 className='font-medium mb-3'>Cooking Time</h3>
										<Select
											value={filters.cookingTime || 'all'}
											onValueChange={value =>
												handleFilterChange('cookingTime', value === 'all' ? '' : value)
											}>
											<SelectTrigger>
												<SelectValue placeholder='Select cooking time' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='all'>Any time</SelectItem>
												<SelectItem value='15'>15 minutes or less</SelectItem>
												<SelectItem value='30'>30 minutes or less</SelectItem>
												<SelectItem value='60'>1 hour or less</SelectItem>
												<SelectItem value='120'>2 hours or less</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Difficulty */}
									<div>
										<h3 className='font-medium mb-3'>Difficulty</h3>
										<Select
											value={filters.difficulty || 'all'}
											onValueChange={value =>
												handleFilterChange('difficulty', value === 'all' ? '' : value)
											}>
											<SelectTrigger>
												<SelectValue placeholder='Select difficulty' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='all'>Any difficulty</SelectItem>
												{tagTypes
													?.find(type => type.typeName === 'Difficulty')
													?.tags.map(tag => (
														<SelectItem
															key={tag.id}
															value={tag.tagName}>
															{tag.tagName}
														</SelectItem>
													))}
											</SelectContent>
										</Select>
									</div>

									{/* Rating */}
									<div>
										<h3 className='font-medium mb-3'>Rating</h3>
										<Select
											value={filters.rating || 'all'}
											onValueChange={value =>
												handleFilterChange('rating', value === 'all' ? '' : value)
											}>
											<SelectTrigger>
												<SelectValue placeholder='Select minimum rating' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='all'>Any rating</SelectItem>
												<SelectItem value='4'>4+ stars</SelectItem>
												<SelectItem value='3'>3+ stars</SelectItem>
												<SelectItem value='2'>2+ stars</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Recipes Grid */}
					<div className='lg:col-span-3'>
						{/* Results Header */}
						<div className='flex items-center justify-between mb-6'>
							<div className='flex items-center gap-2'>
								<ChefHat className='h-5 w-5 text-primary' />
								<h2 className='text-xl font-semibold'>
									{isLoading ? 'Loading...' : `${totalCount} recipes found`}
								</h2>
							</div>
							<div className='flex items-center gap-4'>
								{activeFiltersCount > 0 && (
									<div className='text-sm text-muted-foreground'>
										{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
									</div>
								)}
								{activeFiltersCount > 0 && (
									<Button
										variant='outline'
										size='sm'
										onClick={() => {
											setFilters({
												search: '',
												mealType: [],
												dietaryPreferences: [],
												cuisine: [],
												cookingTime: '',
												difficulty: '',
												rating: '',
												cookingMethod: [],
												health: [],
											});
										}}
										className='text-sm'>
										Clear all
									</Button>
								)}
							</div>
						</div>

						{/* Active Filters Display */}
						{activeFiltersCount > 0 && (
							<div className='flex flex-wrap gap-2 mb-6'>
								{/* Meal Type Badges */}
								{filters.mealType.map(item => (
									<Badge
										key={`mealType-${item}`}
										variant='secondary'
										className='gap-1'>
										{item}
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={e => {
												e.stopPropagation();
												handleArrayFilterChange('mealType', item, false);
											}}
										/>
									</Badge>
								))}
								{/* Dietary Preferences Badges */}
								{filters.dietaryPreferences.map(item => (
									<Badge
										key={`dietaryPreferences-${item}`}
										variant='secondary'
										className='gap-1'>
										{item}
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={e => {
												e.stopPropagation();
												handleArrayFilterChange('dietaryPreferences', item, false);
											}}
										/>
									</Badge>
								))}
								{/* Cuisine Badges */}
								{filters.cuisine.map(item => (
									<Badge
										key={`cuisine-${item}`}
										variant='secondary'
										className='gap-1'>
										{item}
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={e => {
												e.stopPropagation();
												handleArrayFilterChange('cuisine', item, false);
											}}
										/>
									</Badge>
								))}
								{/* Cooking Method Badges */}
								{filters.cookingMethod.map(item => (
									<Badge
										key={`cookingMethod-${item}`}
										variant='secondary'
										className='gap-1'>
										{item}
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={e => {
												e.stopPropagation();
												handleArrayFilterChange('cookingMethod', item, false);
											}}
										/>
									</Badge>
								))}
								{/* Health Badges */}
								{filters.health.map(item => (
									<Badge
										key={`health-${item}`}
										variant='secondary'
										className='gap-1'>
										{item}
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={e => {
												e.stopPropagation();
												handleArrayFilterChange('health', item, false);
											}}
										/>
									</Badge>
								))}
								{/* Cooking Time Badge */}
								{filters.cookingTime && (
									<Badge
										variant='secondary'
										className='gap-1'>
										{filters.cookingTime} min or less
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={() => handleFilterChange('cookingTime', 'all')}
										/>
									</Badge>
								)}
								{/* Difficulty Badge */}
								{filters.difficulty && (
									<Badge
										variant='secondary'
										className='gap-1'>
										{filters.difficulty}
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={() => handleFilterChange('difficulty', 'all')}
										/>
									</Badge>
								)}
								{/* Rating Badge */}
								{filters.rating && (
									<Badge
										variant='secondary'
										className='gap-1'>
										{filters.rating}+ stars
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={() => handleFilterChange('rating', 'all')}
										/>
									</Badge>
								)}
							</div>
						)}

						{/* Loading State */}
						{isLoading && (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{Array.from({ length: 6 }).map((_, i) => (
									<Card key={i}>
										<CardContent className='p-4'>
											<Skeleton className='h-48 w-full mb-4' />
											<Skeleton className='h-4 w-3/4 mb-2' />
											<Skeleton className='h-3 w-1/2' />
										</CardContent>
									</Card>
								))}
							</div>
						)}

						{/* Error State */}
						{error && (
							<div className='text-center py-12'>
								<p className='text-muted-foreground'>Failed to load recipes. Please try again.</p>
								<Button
									onClick={() => window.location.reload()}
									className='mt-4'>
									Retry
								</Button>
							</div>
						)}

						{/* Recipes Grid */}
						{!isLoading && !error && recipes.length > 0 && (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{recipes.map(recipe => (
									<RecipeCard
										key={recipe.id}
										recipe={recipe}
										onTagClick={(tagType, tagValue) => {
											// Add the clicked tag as a filter
											if (tagType === 'Meal Type') {
												handleArrayFilterChange('mealType', tagValue, true);
											} else if (tagType === 'Dietary') {
												handleArrayFilterChange('dietaryPreferences', tagValue, true);
											} else if (tagType === 'Cuisine') {
												handleArrayFilterChange('cuisine', tagValue, true);
											} else if (tagType === 'Difficulty') {
												handleFilterChange('difficulty', tagValue);
											} else if (tagType === 'Cooking Method') {
												handleArrayFilterChange('cookingMethod', tagValue, true);
											} else if (tagType === 'Health') {
												handleArrayFilterChange('health', tagValue, true);
											}
										}}
									/>
								))}
							</div>
						)}

						{/* Empty State */}
						{!isLoading && !error && recipes.length === 0 && (
							<div className='text-center py-12'>
								<ChefHat className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
								<h3 className='text-lg font-semibold mb-2'>No recipes found</h3>
								<p className='text-muted-foreground mb-4'>
									Try adjusting your filters or search terms
								</p>
								<Button
									onClick={() => {
										setFilters({
											search: '',
											mealType: [],
											dietaryPreferences: [],
											cuisine: [],
											cookingTime: '',
											difficulty: '',
											rating: '',
											cookingMethod: [],
											health: [],
										});
									}}
									variant='outline'>
									Clear all filters
								</Button>
							</div>
						)}

						{/* Pagination */}
						{totalPages > 1 && (
							<div className='flex justify-center mt-8'>
								<div className='flex items-center space-x-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}>
										Previous
									</Button>
									{Array.from({ length: totalPages }, (_, i) => i + 1)
										.filter(page => {
											if (totalPages <= 7) return true;
											if (page === 1 || page === totalPages) return true;
											if (page >= currentPage - 1 && page <= currentPage + 1) return true;
											return false;
										})
										.map((page, index, array) => (
											<div
												key={page}
												className='flex items-center'>
												{index > 0 && array[index - 1] !== page - 1 && (
													<span className='px-2 text-gray-500'>...</span>
												)}
												<Button
													variant={currentPage === page ? 'default' : 'outline'}
													size='sm'
													onClick={() => handlePageChange(page)}
													className='w-10 h-10 p-0'>
													{page}
												</Button>
											</div>
										))}
									<Button
										variant='outline'
										size='sm'
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}>
										Next
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function RecipesPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<RecipesPageContent />
		</Suspense>
	);
}
