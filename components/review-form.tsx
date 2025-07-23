'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReview, useUpdateReview } from '@/lib/hooks/use-mutations';
import { Review } from '@/lib/hooks/use-queries';
import { Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface ReviewFormProps {
	recipeId: number;
	existingReview?: Review | null;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function ReviewForm({ recipeId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
	const [rating, setRating] = useState(existingReview?.rating || 0);
	const [comment, setComment] = useState(existingReview?.comment || '');
	const [hoveredRating, setHoveredRating] = useState(0);
	const { data: session } = useSession();
	const router = useRouter();

	const createReview = useCreateReview();
	const updateReview = useUpdateReview();

	const isEditing = !!existingReview;
	const isLoading = createReview.isPending || updateReview.isPending;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Check if user is authenticated
		if (!session) {
			toast.error('Please sign in to write a review');
			// Add a small delay to allow toast to show before redirect
			setTimeout(() => {
				router.push('/signin');
			}, 1500);
			return;
		}

		// Check if user is a nutritionist
		if (session.user.role === 'Nutritionist') {
			toast.error(
				'Only Recipe Developers can write reviews. This feature is not available for Nutritionists.',
			);
			return;
		}

		if (rating === 0) {
			toast.error('Please select a rating');
			return;
		}

		try {
			if (isEditing && existingReview) {
				await updateReview.mutateAsync({
					id: existingReview.id,
					recipeId,
					rating,
					comment: comment.trim() || undefined,
				});
			} else {
				await createReview.mutateAsync({
					recipeId,
					rating,
					comment: comment.trim() || undefined,
				});
			}

			onSuccess?.();
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	const handleCancel = () => {
		if (isEditing) {
			setRating(existingReview?.rating || 0);
			setComment(existingReview?.comment || '');
		} else {
			setRating(0);
			setComment('');
		}
		onCancel?.();
	};

	// If user is not authenticated, show sign-in prompt
	if (!session) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Write a Review</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-center space-y-4'>
						<Star className='h-12 w-12 text-muted-foreground mx-auto' />
						<div>
							<p className='text-muted-foreground mb-2'>Please sign in to write a review</p>
							<Button onClick={() => router.push('/signin')}>Sign In</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// If user is a nutritionist, show restriction message
	if (session.user.role === 'Nutritionist') {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Write a Review</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-center space-y-4'>
						<Star className='h-12 w-12 text-muted-foreground mx-auto' />
						<div>
							<p className='text-muted-foreground mb-2'>
								Only Recipe Developers can write reviews. This feature is not available for
								Nutritionists.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{isEditing ? 'Edit Review' : 'Write a Review'}</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					{/* Rating Stars */}
					<div className='space-y-2'>
						<Label>Rating</Label>
						<div className='flex items-center gap-1'>
							{Array.from({ length: 5 }).map((_, index) => {
								const starValue = index + 1;
								const isFilled = starValue <= (hoveredRating || rating);
								const isHovered = starValue <= hoveredRating;

								return (
									<button
										key={index}
										type='button'
										onClick={() => setRating(starValue)}
										onMouseEnter={() => setHoveredRating(starValue)}
										onMouseLeave={() => setHoveredRating(0)}
										className='p-1 transition-colors hover:scale-110'>
										<Star
											className={`h-6 w-6 ${
												isFilled
													? 'fill-yellow-400 text-yellow-400'
													: isHovered
													? 'text-yellow-300'
													: 'text-muted-foreground'
											}`}
										/>
									</button>
								);
							})}
						</div>
						{rating > 0 && (
							<p className='text-sm text-muted-foreground'>
								You rated this recipe {rating} star{rating !== 1 ? 's' : ''}
							</p>
						)}
					</div>

					{/* Comment */}
					<div className='space-y-2'>
						<Label htmlFor='comment'>Comment (optional)</Label>
						<Textarea
							id='comment'
							placeholder='Share your thoughts about this recipe...'
							value={comment}
							onChange={e => setComment(e.target.value)}
							rows={4}
							maxLength={500}
						/>
						<p className='text-xs text-muted-foreground'>{comment.length}/500 characters</p>
					</div>

					{/* Action Buttons */}
					<div className='flex gap-2'>
						<Button
							type='submit'
							disabled={isLoading || rating === 0}
							className='flex-1'>
							{isLoading
								? isEditing
									? 'Updating...'
									: 'Submitting...'
								: isEditing
								? 'Update Review'
								: 'Submit Review'}
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={handleCancel}
							disabled={isLoading}>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
