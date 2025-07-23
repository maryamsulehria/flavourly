'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, BookOpen, Calendar, CheckCircle, Clock, Eye, Star, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthorProfile {
	id: number;
	username: string;
	fullName: string | null;
	email: string;
	profilePicture: string | null;
	createdAt: string;
	role: {
		name: string;
	};
	_count: {
		recipes: number;
		reviews: number;
	};
	recipes: Array<{
		id: number;
		title: string;
		description: string | null;
		status: string;
		createdAt: string;
		verifiedAt: string | null;
		cookingTimeMinutes: number | null;
		nutritionalInfo: {
			calories: string | null;
			dataSource: string;
		} | null;
		media: Array<{
			id: number;
			url: string;
			mediaType: string;
		}>;
		_count: {
			reviews: number;
		};
		averageRating?: number;
	}>;
}

interface AuthorProfilePageProps {
	params: Promise<{
		userId: string;
	}>;
}

export default function AuthorProfilePage({ params }: AuthorProfilePageProps) {
	const router = useRouter();
	const [userId, setUserId] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getParams = async () => {
			try {
				const resolvedParams = await params;
				const id = parseInt(resolvedParams.userId);
				if (isNaN(id)) {
					router.push('/');
					return;
				}
				setUserId(id);
			} catch (error) {
				router.push('/');
			} finally {
				setIsLoading(false);
			}
		};

		getParams();
	}, [params]); // Removed router from dependency array to prevent infinite re-renders

	const {
		data: author,
		isLoading: isLoadingAuthor,
		error,
	} = useQuery<AuthorProfile>({
		queryKey: ['author-profile', userId],
		queryFn: async () => {
			if (!userId) throw new Error('No user ID');
			const response = await axios.get(`/api/users/${userId}/profile`);
			return response.data;
		},
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
	});

	if (isLoading || isLoadingAuthor) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center gap-4'>
					<Skeleton className='h-10 w-24' />
					<Skeleton className='h-8 w-48' />
				</div>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					<div className='md:col-span-1'>
						<Card>
							<CardHeader>
								<Skeleton className='h-6 w-32' />
							</CardHeader>
							<CardContent className='space-y-4'>
								<Skeleton className='h-20 w-20 rounded-full mx-auto' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-3/4' />
								<Skeleton className='h-4 w-1/2' />
							</CardContent>
						</Card>
					</div>
					<div className='md:col-span-2 space-y-6'>
						<Card>
							<CardHeader>
								<Skeleton className='h-6 w-32' />
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									{[1, 2, 3, 4, 5, 6].map(i => (
										<Skeleton
											key={i}
											className='h-32 w-full'
										/>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (error || !author) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center gap-4'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => router.back()}
						className='flex items-center'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Go Back
					</Button>
				</div>
				<Card>
					<CardContent className='pt-6'>
						<div className='text-center py-12'>
							<User className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
							<h2 className='text-xl font-semibold mb-2'>Author Not Found</h2>
							<p className='text-muted-foreground'>
								The author profile you're looking for doesn't exist or is not available.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'verified':
				return (
					<Badge
						variant='secondary'
						className='text-green-600 border-green-200'>
						<CheckCircle className='w-3 h-3 mr-1' />
						Verified
					</Badge>
				);
			case 'pending_verification':
				return (
					<Badge
						variant='secondary'
						className='text-yellow-600 border-yellow-200'>
						<Clock className='w-3 h-3 mr-1' />
						Pending
					</Badge>
				);
			case 'needs_revision':
				return (
					<Badge
						variant='secondary'
						className='text-red-600 border-red-200'>
						<Clock className='w-3 h-3 mr-1' />
						Needs Revision
					</Badge>
				);
			default:
				return null;
		}
	};

	return (
		<div className='container mx-auto px-4 py-6 max-w-7xl'>
			{/* Header */}
			<div className='flex items-center gap-4 mb-8'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => router.back()}
					className='flex items-center'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Go Back
				</Button>
				<h1 className='text-3xl font-bold tracking-tight'>Author Profile</h1>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				{/* Author Info Card */}
				<div className='md:col-span-1'>
					<Card>
						<CardHeader>
							<CardTitle>Author Information</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Profile Picture */}
							<div className='flex justify-center'>
								<Avatar className='h-24 w-24'>
									<AvatarImage src={author.profilePicture || undefined} />
									<AvatarFallback className='text-2xl'>
										{author.fullName
											? author.fullName
													.split(' ')
													.map(n => n[0])
													.join('')
													.toUpperCase()
											: author.username.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</div>

							{/* Author Details */}
							<div className='space-y-3 text-center'>
								<h2 className='text-xl font-semibold'>{author.fullName || author.username}</h2>
								{author.fullName && <p className='text-muted-foreground'>@{author.username}</p>}
								<Badge variant='outline'>{author.role.name}</Badge>
							</div>

							{/* Stats */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
									<div className='flex items-center gap-2'>
										<BookOpen className='h-4 w-4 text-muted-foreground' />
										<span className='text-sm'>Recipes</span>
									</div>
									<span className='font-semibold'>{author._count.recipes}</span>
								</div>
								<div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
									<div className='flex items-center gap-2'>
										<Star className='h-4 w-4 text-muted-foreground' />
										<span className='text-sm'>Reviews</span>
									</div>
									<span className='font-semibold'>{author._count.reviews}</span>
								</div>
								<div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
									<div className='flex items-center gap-2'>
										<Calendar className='h-4 w-4 text-muted-foreground' />
										<span className='text-sm'>Member Since</span>
									</div>
									<span className='font-semibold text-sm'>
										{new Date(author.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Recipes Grid */}
				<div className='md:col-span-2'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<BookOpen className='h-5 w-5' />
								Recipes by {author.fullName || author.username}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{author.recipes.length > 0 ? (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									{author.recipes.map(recipe => (
										<Card
											key={recipe.id}
											className='overflow-hidden flex flex-col h-full'>
											{recipe.media.length > 0 && (
												<div className='aspect-video overflow-hidden flex-shrink-0'>
													<img
														src={recipe.media[0].url}
														alt={recipe.title}
														className='w-full h-full object-cover'
													/>
												</div>
											)}
											<CardContent className='p-4 flex-1 flex flex-col'>
												<div className='space-y-2 flex-1'>
													<h3 className='font-semibold line-clamp-2'>{recipe.title}</h3>
													{recipe.description && (
														<p className='text-sm text-muted-foreground line-clamp-2'>
															{recipe.description}
														</p>
													)}
													<div className='flex items-center justify-between text-sm'>
														<div className='flex items-center gap-4'>
															{recipe.cookingTimeMinutes && (
																<div className='flex items-center gap-1'>
																	<Clock className='w-3 h-3' />
																	<span>{recipe.cookingTimeMinutes}m</span>
																</div>
															)}
															{recipe._count.reviews > 0 && (
																<div className='flex items-center gap-1'>
																	<Eye className='w-3 h-3' />
																	<span>{recipe._count.reviews}</span>
																</div>
															)}
														</div>
														{getStatusBadge(recipe.status)}
													</div>
													{recipe.nutritionalInfo?.calories && (
														<div className='text-xs text-muted-foreground'>
															{recipe.nutritionalInfo.calories} calories
														</div>
													)}
												</div>
												<Button
													asChild
													variant='outline'
													size='sm'
													className='w-full mt-3 flex-shrink-0'>
													<Link href={`/recipes/${recipe.id}`}>
														<Eye className='w-3 h-3 mr-1' />
														View Recipe
													</Link>
												</Button>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<BookOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
									<h3 className='text-lg font-semibold mb-2'>No recipes yet</h3>
									<p className='text-muted-foreground'>
										This author hasn't published any recipes yet.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
