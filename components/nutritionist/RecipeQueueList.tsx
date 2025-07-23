'use client';

import { VerificationStatus } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

// Icons
import {
	Calendar,
	ChefHat,
	Clock,
	Filter,
	Search,
	SlidersHorizontal,
	Utensils,
	XCircle,
} from 'lucide-react';

export interface QueueRecipe {
	id: number;
	title: string;
	description: string | null;
	cookingTimeMinutes: number | null;
	servings: number | null;
	status: VerificationStatus;
	createdAt: string;
	author: {
		id: number;
		username: string;
		fullName: string | null;
		profilePicture: string | null;
	};
	_count: {
		ingredients: number;
		steps: number;
	};
}

export default function RecipeQueueList() {
	const router = useRouter();
	const [inputValue, setInputValue] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState('newest');

	// Create a debounced search function
	const debouncedSearch = useCallback(
		debounce((value: string) => {
			setSearchQuery(value);
		}, 500),
		[],
	);

	// Update search query when input changes
	useEffect(() => {
		debouncedSearch(inputValue);
		return () => {
			debouncedSearch.cancel();
		};
	}, [inputValue, debouncedSearch]);

	// Fetch all pending recipes
	const { data, isLoading, error } = useQuery({
		queryKey: ['nutritionist', 'queue', 'recipes', searchQuery, sortBy],
		queryFn: async () => {
			const response = await axios.get(
				`/api/nutritionist/pending-recipes?limit=100&search=${encodeURIComponent(searchQuery)}`,
			);
			return response.data;
		},
		staleTime: 60 * 1000, // 1 minute
		refetchInterval: 3 * 60 * 1000, // 3 minutes
	});

	const recipes = data?.recipes || [];

	// Handle recipe review
	const handleReviewRecipe = (recipeId: number) => {
		router.push(`/nutritionist/review/${recipeId}`);
	};

	// Sort recipes
	const sortedRecipes = [...recipes].sort((a, b) => {
		switch (sortBy) {
			case 'newest':
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			case 'oldest':
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			case 'ingredients-asc':
				return a._count.ingredients - b._count.ingredients;
			case 'ingredients-desc':
				return b._count.ingredients - a._count.ingredients;
			default:
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		}
	});

	if (error) {
		return (
			<Card className='border-destructive'>
				<CardHeader>
					<CardTitle className='text-destructive'>Error Loading Recipes</CardTitle>
					<CardDescription>
						There was a problem loading the recipe queue. Please try refreshing the page.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
				<div className='relative w-full md:w-96'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search recipes, ingredients, or authors...'
						className='pl-10'
						value={inputValue}
						onChange={e => setInputValue(e.target.value)}
					/>
					{inputValue && (
						<Button
							variant='ghost'
							size='icon'
							className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6'
							onClick={() => {
								setInputValue('');
								setSearchQuery('');
							}}>
							<XCircle className='h-4 w-4' />
						</Button>
					)}
				</div>

				<div className='flex items-center gap-2 w-full md:w-auto'>
					<SlidersHorizontal className='h-4 w-4 text-muted-foreground' />
					<Select
						value={sortBy}
						onValueChange={setSortBy}>
						<SelectTrigger className='w-full md:w-[200px]'>
							<SelectValue placeholder='Sort by' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='newest'>Newest First</SelectItem>
							<SelectItem value='oldest'>Oldest First</SelectItem>
							<SelectItem value='ingredients-asc'>Fewest Ingredients</SelectItem>
							<SelectItem value='ingredients-desc'>Most Ingredients</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<Tabs
				defaultValue='cards'
				className='w-full'>
				<TabsList className='grid w-full md:w-auto grid-cols-2'>
					<TabsTrigger value='cards'>Card View</TabsTrigger>
					<TabsTrigger value='table'>Table View</TabsTrigger>
				</TabsList>

				<TabsContent
					value='table'
					className='border rounded-lg'>
					{isLoading ? (
						<div className='p-4'>
							<div className='space-y-4'>
								{[1, 2, 3, 4].map(i => (
									<div
										key={i}
										className='flex items-center space-x-4'>
										<Skeleton className='h-12 w-12 rounded-lg' />
										<div className='flex-1 space-y-2'>
											<Skeleton className='h-4 w-3/4' />
											<Skeleton className='h-4 w-1/2' />
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Recipe</TableHead>
									<TableHead className='hidden md:table-cell'>Author</TableHead>
									<TableHead className='hidden md:table-cell'>Date Submitted</TableHead>
									<TableHead className='hidden md:table-cell'>Details</TableHead>
									<TableHead className='text-right'>Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedRecipes.length > 0 ? (
									sortedRecipes.map(recipe => (
										<TableRow
											key={recipe.id}
											className='cursor-pointer hover:bg-muted/50'
											onClick={() => handleReviewRecipe(recipe.id)}>
											<TableCell className='font-medium'>
												<div className='flex items-start gap-3'>
													<div className='w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center'>
														<ChefHat className='h-5 w-5 text-primary-foreground' />
													</div>
													<div>
														<div className='font-medium'>{recipe.title}</div>
														{recipe.description && (
															<div className='text-xs text-muted-foreground line-clamp-1 mt-1'>
																{recipe.description}
															</div>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell className='hidden md:table-cell'>
												<div className='flex items-center'>
													<Avatar className='h-6 w-6 mr-2'>
														<AvatarImage src={recipe.author.profilePicture || undefined} />
														<AvatarFallback className='text-xs'>
															{recipe.author.fullName
																? recipe.author.fullName
																		.split(' ')
																		.map((n: string) => n[0])
																		.join('')
																		.toUpperCase()
																: recipe.author.username.charAt(0).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<Link
														href={`/users/${recipe.author.id}`}
														className='hover:underline'
														onClick={e => e.stopPropagation()}>
														{recipe.author.fullName || recipe.author.username}
													</Link>
												</div>
											</TableCell>
											<TableCell className='hidden md:table-cell'>
												<div className='flex items-center'>
													<Calendar className='h-3.5 w-3.5 mr-1.5 text-muted-foreground' />
													<span>{format(new Date(recipe.createdAt), 'MMM d, yyyy')}</span>
												</div>
											</TableCell>
											<TableCell className='hidden md:table-cell'>
												<div className='flex flex-wrap gap-2'>
													<Badge
														variant='outline'
														className='flex items-center'>
														<Utensils className='h-3 w-3 mr-1' />
														{recipe._count.ingredients} ingredients
													</Badge>
													{recipe.cookingTimeMinutes && (
														<Badge
															variant='outline'
															className='flex items-center'>
															<Clock className='h-3 w-3 mr-1' />
															{recipe.cookingTimeMinutes} min
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className='text-right'>
												<Button
													size='sm'
													onClick={e => {
														e.stopPropagation();
														handleReviewRecipe(recipe.id);
													}}>
													Review
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={5}
											className='text-center py-8'>
											<div className='flex flex-col items-center justify-center text-muted-foreground'>
												<Filter className='h-12 w-12 mb-3' />
												{searchQuery ? (
													<>
														<p className='text-base font-medium'>No matching recipes found</p>
														<p className='text-sm mt-1'>Try using different search terms</p>
													</>
												) : (
													<>
														<p className='text-base font-medium'>All caught up!</p>
														<p className='text-sm mt-1'>No pending recipes to review</p>
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</TabsContent>

				<TabsContent value='cards'>
					{isLoading ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{[1, 2, 3, 4, 5, 6].map(i => (
								<Card
									key={i}
									className='overflow-hidden'>
									<div className='p-6'>
										<Skeleton className='h-5 w-3/4 mb-4' />
										<Skeleton className='h-4 w-full mb-2' />
										<Skeleton className='h-4 w-2/3 mb-4' />
										<div className='flex justify-between mt-4'>
											<Skeleton className='h-4 w-1/3' />
											<Skeleton className='h-8 w-20' />
										</div>
									</div>
								</Card>
							))}
						</div>
					) : sortedRecipes.length > 0 ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{sortedRecipes.map(recipe => (
								<Card
									key={recipe.id}
									className='overflow-hidden cursor-pointer hover:border-primary/50 transition-colors'
									onClick={() => handleReviewRecipe(recipe.id)}>
									<CardHeader className='pb-2'>
										<CardTitle className='text-lg'>{recipe.title}</CardTitle>
										<CardDescription className='line-clamp-2'>
											{recipe.description || 'No description provided'}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className='flex flex-wrap gap-2 mb-4'>
											<Badge
												variant='outline'
												className='flex items-center'>
												<Utensils className='h-3 w-3 mr-1' />
												{recipe._count.ingredients} ingredients
											</Badge>
											{recipe.cookingTimeMinutes && (
												<Badge
													variant='outline'
													className='flex items-center'>
													<Clock className='h-3 w-3 mr-1' />
													{recipe.cookingTimeMinutes} min
												</Badge>
											)}
											{recipe._count.steps > 0 && (
												<Badge
													variant='outline'
													className='flex items-center'>
													{recipe._count.steps} steps
												</Badge>
											)}
										</div>

										<div className='flex items-center justify-between'>
											<div className='flex items-center text-sm text-muted-foreground'>
												<Avatar className='h-5 w-5 mr-2'>
													<AvatarImage src={recipe.author.profilePicture || undefined} />
													<AvatarFallback className='text-xs'>
														{recipe.author.fullName
															? recipe.author.fullName
																	.split(' ')
																	.map((n: string) => n[0])
																	.join('')
																	.toUpperCase()
															: recipe.author.username.charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<Link
													href={`/users/${recipe.author.id}`}
													className='hover:underline'
													onClick={e => e.stopPropagation()}>
													{recipe.author.fullName || recipe.author.username}
												</Link>
											</div>
											<Button
												size='sm'
												onClick={e => {
													e.stopPropagation();
													handleReviewRecipe(recipe.id);
												}}>
												Review
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<Card className='border-dashed'>
							<CardContent className='flex flex-col items-center justify-center py-8'>
								<Filter className='h-12 w-12 text-muted-foreground mb-3' />
								{searchQuery ? (
									<>
										<h3 className='text-lg font-medium'>No matching recipes found</h3>
										<p className='text-muted-foreground mt-1'>Try using different search terms</p>
									</>
								) : (
									<>
										<h3 className='text-lg font-medium'>All caught up!</h3>
										<p className='text-muted-foreground mt-1'>No pending recipes to review</p>
									</>
								)}
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
