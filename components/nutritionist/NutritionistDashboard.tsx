'use client';

import RecentRecipes from '@/components/nutritionist/RecentRecipes';
import StatsCard from '@/components/nutritionist/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	useNutritionistStats,
	usePendingRecipes,
	useVerifiedRecipes,
} from '@/lib/hooks/useNutritionistData';
import { BarChart3, CheckCircle, ClipboardList, Target, TrendingUp, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NutritionistDashboard() {
	const router = useRouter();
	const { data: session } = useSession();

	const { data: stats, isLoading: statsLoading } = useNutritionistStats();
	const { data: pendingRecipes, isLoading: pendingLoading } = usePendingRecipes(5);
	const { data: verifiedRecipes, isLoading: verifiedLoading } = useVerifiedRecipes(5);

	const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

	if (!session?.user) {
		return null;
	}

	const handleQuickAction = (action: string) => {
		switch (action) {
			case 'review':
				router.push('/nutritionist/queue');
				break;
			case 'verified':
				router.push('/nutritionist/verified');
				break;
			default:
				break;
		}
	};

	return (
		<div className='space-y-6'>
			{/* Welcome Section */}
			<div className='mb-8'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-foreground'>
							Welcome back, {session.user.name || session.user.username}!
						</h1>
						<p className='text-muted-foreground mt-2'>
							Here's your nutritionist dashboard overview for today.
						</p>
					</div>
					<div className='flex items-center space-x-2'>
						<Badge
							variant='outline'
							className='text-green-600 border-green-600'>
							<div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
							Active
						</Badge>
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<StatsCard
					title='Pending Reviews'
					value={stats?.pendingReviews || 0}
					icon={ClipboardList}
					description='Recipes awaiting verification'
					isLoading={statsLoading}
					badge={
						stats?.pendingReviews && stats.pendingReviews > 0
							? { text: 'Action needed', variant: 'destructive' }
							: undefined
					}
				/>
				<StatsCard
					title='Verified Recipes'
					value={stats?.verifiedRecipes || 0}
					icon={CheckCircle}
					description="Recipes you've verified"
					isLoading={statsLoading}
					trend={{ value: 12, isPositive: true }}
				/>
				<StatsCard
					title='Total Recipes'
					value={stats?.totalRecipes || 0}
					icon={BarChart3}
					description='All recipes in system'
					isLoading={statsLoading}
				/>
				<StatsCard
					title='Efficiency Rate'
					value={
						stats?.totalRecipes && stats.verifiedRecipes
							? `${Math.round((stats.verifiedRecipes / stats.totalRecipes) * 100)}%`
							: '0%'
					}
					icon={TrendingUp}
					description='Your verification rate'
					isLoading={statsLoading}
					trend={{ value: 8, isPositive: true }}
				/>
			</div>

			{/* Quick Actions */}
			<Card className='mb-8'>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<Zap className='h-5 w-5 mr-2' />
						Quick Actions
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<Button
							className='h-20 flex flex-col items-center justify-center space-y-2'
							variant='outline'
							onClick={() => handleQuickAction('review')}>
							<ClipboardList className='h-6 w-6' />
							<div className='flex items-center space-x-2'>
								<span className='text-sm'>Review Queue</span>
								{stats?.pendingReviews && stats.pendingReviews > 0 && (
									<Badge
										variant='destructive'
										className='text-xs'>
										{stats.pendingReviews}
									</Badge>
								)}
							</div>
						</Button>

						<Button
							className='h-20 flex flex-col items-center justify-center space-y-2'
							variant='outline'
							onClick={() => handleQuickAction('verified')}>
							<CheckCircle className='h-6 w-6' />
							<span className='text-sm'>My Verified</span>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Recent Activities */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
				<RecentRecipes
					title='Recent Pending Reviews'
					recipes={pendingRecipes || []}
					isLoading={pendingLoading}
					type='pending'
					onViewAll={() => router.push('/nutritionist/queue')}
				/>

				<RecentRecipes
					title='Recently Verified'
					recipes={verifiedRecipes || []}
					isLoading={verifiedLoading}
					type='verified'
					onViewAll={() => router.push('/nutritionist/verified')}
				/>
			</div>

			{/* Today's Goals */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<Target className='h-5 w-5 mr-2' />
						Today's Goals
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center space-x-3'>
								<div className='w-3 h-3 bg-green-500 rounded-full'></div>
								<span className='text-sm'>Review 5 pending recipes</span>
							</div>
							<span className='text-sm text-muted-foreground'>
								{stats?.pendingReviews || 0} remaining
							</span>
						</div>
						<div className='flex items-center justify-between'>
							<div className='flex items-center space-x-3'>
								<div className='w-3 h-3 bg-blue-500 rounded-full'></div>
								<span className='text-sm'>Verify 3 recipes</span>
							</div>
							<span className='text-sm text-muted-foreground'>
								{stats?.verifiedRecipes || 0} completed
							</span>
						</div>
						<div className='flex items-center justify-between'>
							<div className='flex items-center space-x-3'>
								<div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
								<span className='text-sm'>Update nutrition data</span>
							</div>
							<span className='text-sm text-muted-foreground'>In progress</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
