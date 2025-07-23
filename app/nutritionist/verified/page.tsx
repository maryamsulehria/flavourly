'use client';

import NutritionistVerifiedRecipes from '@/components/nutritionist/NutritionistVerifiedRecipes';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function VerifiedRecipesPage() {
	const { data: session, status } = useSession();

	if (status === 'loading') {
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

	return <NutritionistVerifiedRecipes />;
}
