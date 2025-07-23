'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import {
	Activity,
	ArrowLeft,
	BookOpen,
	Calendar,
	CheckCircle,
	Mail,
	MapPin,
	Stethoscope,
	Target,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NutritionistProfileProps {
	params: Promise<{
		userId: string;
	}>;
}

interface NutritionistData {
	id: number;
	username: string;
	email: string;
	fullName?: string;
	profilePicture?: string;
	createdAt: string;
	verifiedRecipes: Array<{
		id: number;
		title: string;
		verifiedAt: string;
		nutritionalInfo?: {
			calories?: number;
		};
		reviews: Array<{
			rating: number;
		}>;
		_count: {
			reviews: number;
			favoritedBy: number;
		};
	}>;
}

export default function NutritionistProfilePage({ params }: NutritionistProfileProps) {
	const { data: session, status } = useSession();
	const [nutritionist, setNutritionist] = useState<NutritionistData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [userId, setUserId] = useState<number | null>(null);

	useEffect(() => {
		const getParams = async () => {
			try {
				const resolvedParams = await params;
				const id = parseInt(resolvedParams.userId);
				if (isNaN(id)) {
					redirect('/not-found');
					return;
				}
				setUserId(id);

				// Fetch nutritionist data
				const response = await fetch(`/api/nutritionist/profile/${id}`);
				if (!response.ok) {
					redirect('/not-found');
					return;
				}
				const data = await response.json();
				setNutritionist(data);
			} catch (error) {
				redirect('/not-found');
			} finally {
				setIsLoading(false);
			}
		};

		getParams();
	}, [params]);

	if (status === 'loading' || isLoading) {
		return (
			<div className='space-y-6'>
				<div className='mb-8'>
					<div className='h-8 w-48 bg-muted animate-pulse rounded mb-2' />
					<div className='h-4 w-64 bg-muted animate-pulse rounded' />
				</div>
				<div className='space-y-4'>
					{[1, 2, 3].map(i => (
						<div
							key={i}
							className='h-20 bg-muted animate-pulse rounded'
						/>
					))}
				</div>
			</div>
		);
	}

	if (!session) {
		redirect('/signin');
	}

	if (!nutritionist) {
		return null;
	}

	// Calculate statistics
	const totalVerified = nutritionist.verifiedRecipes.length;
	const thisMonth = new Date();
	thisMonth.setDate(1);
	const verifiedThisMonth = nutritionist.verifiedRecipes.filter(
		recipe => recipe.verifiedAt && new Date(recipe.verifiedAt) >= thisMonth,
	).length;

	const totalCaloriesVerified = nutritionist.verifiedRecipes.reduce((sum, recipe) => {
		return sum + (recipe.nutritionalInfo?.calories ? Number(recipe.nutritionalInfo.calories) : 0);
	}, 0);

	// Get recent verifications
	const recentVerifications = nutritionist.verifiedRecipes.slice(0, 6);

	// Get top rated recipes
	const topRatedRecipes = nutritionist.verifiedRecipes
		.filter(recipe => recipe.reviews.length > 0)
		.sort((a, b) => {
			const avgA = a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length;
			const avgB = b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length;
			return avgB - avgA;
		})
		.slice(0, 5);

	// Check if current user is viewing their own profile
	const isOwnProfile = session?.user?.id === userId?.toString();

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex items-center justify-between mb-4'>
					<Button
						variant='outline'
						size='sm'
						asChild>
						<Link href={isOwnProfile ? '/nutritionist' : '/nutritionist/queue'}>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back
						</Link>
					</Button>
					{isOwnProfile && (
						<Button asChild>
							<Link href='/nutritionist/queue'>
								<Target className='w-4 h-4 mr-2' />
								Review Queue
							</Link>
						</Button>
					)}
				</div>
				<h1 className='text-3xl font-bold text-foreground'>Nutritionist Profile</h1>
				<p className='text-muted-foreground mt-2'>
					View nutritionist information and verified recipes
				</p>
			</div>

			{/* Profile Header */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6'>
						<Avatar className='w-24 h-24'>
							<AvatarImage
								src={nutritionist.profilePicture || undefined}
								alt={nutritionist.fullName || nutritionist.username}
							/>
							<AvatarFallback className='text-lg bg-primary text-primary-foreground'>
								{nutritionist.fullName
									? nutritionist.fullName
											.split(' ')
											.map(n => n[0])
											.join('')
											.toUpperCase()
									: nutritionist.username.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>

						<div className='flex-1 text-center md:text-left'>
							<div className='flex flex-col md:flex-row md:items-center md:justify-between'>
								<div>
									<h2 className='text-2xl font-bold'>
										{nutritionist.fullName || nutritionist.username}
									</h2>
									<div className='flex items-center justify-center md:justify-start space-x-2 mt-2'>
										<Badge className='flex items-center'>
											<Stethoscope className='w-3 h-3 mr-1' />
											Certified Nutritionist
										</Badge>
										<Badge
											variant='secondary'
											className='flex items-center'>
											<Calendar className='w-3 h-3 mr-1' />
											Joined {format(new Date(nutritionist.createdAt), 'MMM yyyy')}
										</Badge>
									</div>
								</div>

								<div className='flex items-center space-x-8 mt-4 md:mt-0'>
									<div className='text-center'>
										<div className='text-2xl font-bold text-primary'>{totalVerified}</div>
										<div className='text-sm text-muted-foreground'>Verified</div>
									</div>
								</div>
							</div>

							<div className='mt-4 space-y-2'>
								<div className='flex items-center justify-center md:justify-start space-x-2 text-sm text-muted-foreground'>
									<Mail className='w-4 h-4' />
									<span>{nutritionist.email}</span>
								</div>
								<div className='flex items-center justify-center md:justify-start space-x-2 text-sm text-muted-foreground'>
									<MapPin className='w-4 h-4' />
									<span>Professional Nutritionist</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Statistics Overview */}
			<div className='grid grid-cols-2 md:grid-cols-2 gap-6'>
				<Card>
					<CardContent className='pt-6'>
						<div className='flex items-center space-x-2'>
							<CheckCircle className='h-4 w-4 text-green-600' />
							<div>
								<p className='text-sm font-medium text-muted-foreground'>Total Verified</p>
								<p className='text-2xl font-bold'>{totalVerified}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='pt-6'>
						<div className='flex items-center space-x-2'>
							<Activity className='h-4 w-4 text-blue-600' />
							<div>
								<p className='text-sm font-medium text-muted-foreground'>This Month</p>
								<p className='text-2xl font-bold'>{verifiedThisMonth}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Verifications */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<BookOpen className='h-5 w-5 mr-2' />
						Recent Verifications
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{recentVerifications.length > 0 ? (
							recentVerifications.map(recipe => (
								<div
									key={recipe.id}
									className='flex items-center justify-between p-4 border rounded-lg'>
									<div>
										<h3 className='font-medium'>{recipe.title}</h3>
										<p className='text-sm text-muted-foreground'>
											Verified {format(new Date(recipe.verifiedAt), 'MMM d, yyyy')}
										</p>
									</div>
									<div className='flex items-center space-x-2'>
										<Badge variant='outline'>{recipe._count.reviews} reviews</Badge>
									</div>
								</div>
							))
						) : (
							<div className='text-center py-8'>
								<BookOpen className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
								<p className='text-muted-foreground'>No verified recipes yet</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
