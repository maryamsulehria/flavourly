'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import {
	ArrowLeft,
	BookOpen,
	Calendar,
	CheckCircle,
	Clock,
	Eye,
	Filter,
	Search,
	Star,
	TrendingUp,
	Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface VerifiedRecipe {
	id: number;
	title: string;
	description: string | null;
	cookingTimeMinutes: number | null;
	servings: number | null;
	verifiedAt: string;
	healthTips: string | null;
	author: {
		id: number;
		username: string;
		fullName: string | null;
		profilePicture: string | null;
	};
	_count: {
		ingredients: number;
		steps: number;
		reviews: number;
		favoritedBy: number;
	};
	averageRating: number | null;
	tags: Array<{
		tag: {
			id: number;
			tagName: string;
			tagType: {
				typeName: string;
			};
		};
	}>;
}

interface VerifiedRecipesResponse {
	recipes: VerifiedRecipe[];
	totalCount: number;
	stats: {
		totalVerified: number;
		thisMonth: number;
		averageRating: number;
		pendingReviews: number;
	};
}

export default function NutritionistVerifiedRecipes() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState('verifiedAt');
	const [sortOrder, setSortOrder] = useState('desc');
	const [activeTab, setActiveTab] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12;

	// Fetch verified recipes
	const {
		data: verifiedData,
		isLoading,
		error,
		refetch,
	} = useQuery<VerifiedRecipesResponse>({
		queryKey: ['nutritionist', 'verified', searchTerm, sortBy, sortOrder, currentPage],
		queryFn: async () => {
			const response = await axios.get('/api/nutritionist/verified-recipes', {
				params: {
					search: searchTerm,
					sortBy,
					sortOrder,
					page: currentPage,
					limit: itemsPerPage,
				},
			});
			return response.data;
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
	});

	const handleRecipeClick = (recipeId: number) => {
		router.push(`/nutritionist/review/${recipeId}`);
	};

	const handleViewPublicRecipe = (recipeId: number) => {
		window.open(`/recipes/${recipeId}`, '_blank');
	};

	const handleBackToDashboard = () => {
		router.push('/nutritionist');
	};

	const filteredRecipes =
		verifiedData?.recipes?.filter(recipe => {
			if (activeTab === 'all') return true;
			if (activeTab === 'recent') {
				const verifiedDate = new Date(recipe.verifiedAt);
				const oneWeekAgo = new Date();
				oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
				return verifiedDate >= oneWeekAgo;
			}
			if (activeTab === 'popular') {
				return (recipe.averageRating || 0) >= 4.0;
			}
			return true;
		}) || [];

	if (error) {
		return (
			<Alert className='border-destructive'>
				<AlertDescription>Failed to load verified recipes. Please try again.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col items-start gap-4'>
				<Button
					variant='outline'
					size='sm'
					onClick={handleBackToDashboard}
					className='flex items-center'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Dashboard
				</Button>
				<div className='flex items-center justify-between w-full'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>My Verified Recipes</h1>
						<p className='text-muted-foreground'>
							View and manage all recipes you've verified as a nutritionist
						</p>
					</div>
					<Button
						variant='outline'
						onClick={() => router.push('/nutritionist/queue')}
						className='flex items-center'>
						<BookOpen className='h-4 w-4 mr-2' />
						Review Queue
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			{verifiedData?.stats && (
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
					<Card>
						<CardContent className='p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm text-muted-foreground'>Total Verified</p>
									<p className='text-2xl font-bold'>{verifiedData.stats.totalVerified}</p>
								</div>
								<CheckCircle className='h-8 w-8 text-green-500' />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className='p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm text-muted-foreground'>This Month</p>
									<p className='text-2xl font-bold'>{verifiedData.stats.thisMonth}</p>
								</div>
								<TrendingUp className='h-8 w-8 text-blue-500' />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className='p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm text-muted-foreground'>Pending Reviews</p>
									<p className='text-2xl font-bold'>{verifiedData.stats.pendingReviews}</p>
								</div>
								<Clock className='h-8 w-8 text-orange-500' />
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Search and Filters */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<Filter className='h-5 w-5 mr-2' />
						Search & Filter
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='flex-1 space-y-2'>
							<Label htmlFor='search'>Search Recipes</Label>
							<div className='relative mt-1'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
								<Input
									id='search'
									placeholder='Search by recipe title, author, or tags...'
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className='pl-10'
								/>
							</div>
						</div>
						<div className='w-48 space-y-2'>
							<Label htmlFor='sort'>Sort By</Label>
							<Select
								value={`${sortBy}-${sortOrder}`}
								onValueChange={value => {
									const [field, order] = value.split('-');
									setSortBy(field);
									setSortOrder(order);
								}}>
								<SelectTrigger className='mt-1'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='verifiedAt-desc'>Recently Verified</SelectItem>
									<SelectItem value='verifiedAt-asc'>Oldest First</SelectItem>
									<SelectItem value='title-asc'>Title A-Z</SelectItem>
									<SelectItem value='title-desc'>Title Z-A</SelectItem>
									<SelectItem value='averageRating-desc'>Highest Rated</SelectItem>
									<SelectItem value='averageRating-asc'>Lowest Rated</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}>
				<TabsList className='grid w-full grid-cols-3'>
					<TabsTrigger value='all'>All Recipes</TabsTrigger>
					<TabsTrigger value='recent'>Recent (7 days)</TabsTrigger>
					<TabsTrigger value='popular'>Popular (4+ stars)</TabsTrigger>
				</TabsList>

				<TabsContent
					value={activeTab}
					className='space-y-4'>
					{/* Recipe Grid */}
					{isLoading ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{Array.from({ length: 6 }).map((_, index) => (
								<Card key={index}>
									<CardContent className='p-4'>
										<Skeleton className='h-4 w-3/4 mb-2' />
										<Skeleton className='h-3 w-full mb-2' />
										<Skeleton className='h-3 w-2/3 mb-4' />
										<div className='flex gap-2'>
											<Skeleton className='h-6 w-16' />
											<Skeleton className='h-6 w-16' />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : filteredRecipes.length === 0 ? (
						<div className='text-center py-12'>
							<CheckCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
							<h3 className='text-lg font-semibold mb-2'>No verified recipes found</h3>
							<p className='text-muted-foreground'>
								{searchTerm
									? 'Try adjusting your search terms'
									: 'Start verifying recipes from the queue'}
							</p>
							<Button
								onClick={() => router.push('/nutritionist/queue')}
								className='mt-4'>
								Go to Review Queue
							</Button>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{filteredRecipes.map(recipe => (
								<Card
									key={recipe.id}
									className='hover:shadow-lg transition-shadow flex flex-col h-full'>
									<CardContent className='p-4 flex flex-col flex-1'>
										<div className='flex items-start justify-between mb-3'>
											<h3 className='font-semibold text-lg line-clamp-2'>{recipe.title}</h3>
											<div className='flex items-center space-x-1'>
												{recipe.averageRating && (
													<div className='flex items-center'>
														<Star className='h-4 w-4 text-yellow-500 fill-current' />
														<span className='text-sm font-medium ml-1'>
															{recipe.averageRating.toFixed(1)}
														</span>
													</div>
												)}
											</div>
										</div>

										{recipe.description && (
											<p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
												{recipe.description}
											</p>
										)}

										<div className='flex items-center text-sm text-muted-foreground mb-3'>
											<Clock className='h-4 w-4 mr-1' />
											<span>{recipe.cookingTimeMinutes || 'N/A'} min</span>
											<Users className='h-4 w-4 ml-3 mr-1' />
											<span>{recipe.servings || 'N/A'} servings</span>
										</div>

										<div className='flex items-center text-sm text-muted-foreground mb-3'>
											<Calendar className='h-4 w-4 mr-1' />
											<span>Verified {format(new Date(recipe.verifiedAt), 'MMM d, yyyy')}</span>
										</div>

										<div className='flex items-center text-sm text-muted-foreground mb-3'>
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
											<span>By {recipe.author.fullName || recipe.author.username}</span>
										</div>

										{recipe.tags.length > 0 && (
											<div className='flex flex-wrap gap-1 mb-3'>
												{recipe.tags.slice(0, 3).map(({ tag }) => (
													<Badge
														key={tag.id}
														variant='secondary'
														className='text-xs'>
														{tag.tagName}
													</Badge>
												))}
												{recipe.tags.length > 3 && (
													<Badge
														variant='outline'
														className='text-xs'>
														+{recipe.tags.length - 3} more
													</Badge>
												)}
											</div>
										)}

										<div className='flex items-center justify-between text-sm text-muted-foreground mb-4'>
											<span>{recipe._count.reviews} reviews</span>
										</div>

										{/* Spacer to push buttons to bottom */}
										<div className='flex-1' />

										<div className='flex gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleRecipeClick(recipe.id)}
												className='flex-1'>
												<Eye className='h-4 w-4 mr-2' />
												Review
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() => (window.location.href = `/recipes/${recipe.id}`)}
												className='flex-1'>
												View Public
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{/* Pagination */}
					{verifiedData && verifiedData.totalCount > itemsPerPage && (
						<div className='flex justify-center mt-6'>
							<div className='flex items-center space-x-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
									disabled={currentPage === 1}>
									Previous
								</Button>
								<span className='text-sm text-muted-foreground'>
									Page {currentPage} of {Math.ceil(verifiedData.totalCount / itemsPerPage)}
								</span>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setCurrentPage(prev => prev + 1)}
									disabled={currentPage >= Math.ceil(verifiedData.totalCount / itemsPerPage)}>
									Next
								</Button>
							</div>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
