'use client';

import RecipeVerificationForm from '@/components/nutritionist/RecipeVerificationForm';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RecipeReviewPageProps {
	params: Promise<{
		recipeId: string;
	}>;
}

export default function RecipeReviewPage({ params }: RecipeReviewPageProps) {
	const { data: session, status } = useSession();
	const [recipeId, setRecipeId] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getParams = async () => {
			try {
				const resolvedParams = await params;
				const id = parseInt(resolvedParams.recipeId);
				if (isNaN(id)) {
					redirect('/nutritionist/queue');
					return;
				}
				setRecipeId(id);
			} catch (error) {
				redirect('/nutritionist/queue');
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

	if (!recipeId) {
		return null;
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-foreground'>Recipe Verification</h1>
				<p className='text-muted-foreground mt-2'>
					Review and verify recipe details and nutritional information
				</p>
			</div>

			{/* Recipe Verification Form */}
			<RecipeVerificationForm recipeId={recipeId} />
		</div>
	);
}
