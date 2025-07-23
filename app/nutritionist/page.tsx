'use client';

import NutritionistDashboard from '@/components/nutritionist/NutritionistDashboard';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// Loading component for the dashboard
function DashboardLoading() {
	return (
		<div className='space-y-6'>
			{/* Welcome Section */}
			<div className='mb-8'>
				<div className='flex items-center justify-between'>
					<div>
						<div className='h-8 w-64 bg-muted animate-pulse rounded mb-2' />
						<div className='h-4 w-48 bg-muted animate-pulse rounded' />
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				{[1, 2, 3, 4].map(i => (
					<div
						key={i}
						className='border rounded-lg p-6'>
						<div className='h-4 w-20 bg-muted animate-pulse rounded mb-4' />
						<div className='h-8 w-16 bg-muted animate-pulse rounded mb-2' />
						<div className='h-3 w-24 bg-muted animate-pulse rounded' />
					</div>
				))}
			</div>

			{/* Quick Actions */}
			<div className='border rounded-lg p-6 mb-8'>
				<div className='h-6 w-32 bg-muted animate-pulse rounded mb-4' />
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					{[1, 2, 3].map(i => (
						<div
							key={i}
							className='h-20 border rounded-lg bg-muted animate-pulse'
						/>
					))}
				</div>
			</div>

			{/* Recent Activities */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{[1, 2].map(i => (
					<div
						key={i}
						className='border rounded-lg p-6'>
						<div className='h-6 w-40 bg-muted animate-pulse rounded mb-4' />
						<div className='space-y-4'>
							{[1, 2, 3].map(j => (
								<div
									key={j}
									className='flex items-center space-x-4'>
									<div className='h-12 w-12 bg-muted animate-pulse rounded-lg' />
									<div className='flex-1'>
										<div className='h-4 w-32 bg-muted animate-pulse rounded mb-2' />
										<div className='h-3 w-24 bg-muted animate-pulse rounded' />
									</div>
									<div className='h-8 w-16 bg-muted animate-pulse rounded' />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function NutritionistPage() {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return <DashboardLoading />;
	}

	if (!session) {
		redirect('/signin');
	}

	return (
		<Suspense fallback={<DashboardLoading />}>
			<NutritionistDashboard />
		</Suspense>
	);
}
