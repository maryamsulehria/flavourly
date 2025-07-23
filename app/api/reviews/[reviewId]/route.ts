import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ reviewId: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { reviewId: reviewIdParam } = await params;
		const reviewId = parseInt(reviewIdParam);

		if (isNaN(reviewId)) {
			return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
		}

		const { rating, comment } = await request.json();

		// Validate input
		if (!rating) {
			return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
		}

		if (rating < 1 || rating > 5) {
			return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
		}

		// Check if review exists and belongs to the user
		const existingReview = await prisma.review.findUnique({
			where: { id: reviewId },
			include: {
				user: {
					select: {
						id: true,
						username: true,
						fullName: true,
					},
				},
			},
		});

		if (!existingReview) {
			return NextResponse.json({ error: 'Review not found' }, { status: 404 });
		}

		if (existingReview.userId !== parseInt(session.user.id)) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Update the review
		const updatedReview = await prisma.review.update({
			where: { id: reviewId },
			data: {
				rating,
				comment: comment || null,
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
						fullName: true,
					},
				},
			},
		});

		return NextResponse.json({
			reviewId: updatedReview.id,
			recipeId: updatedReview.recipeId,
			review: {
				id: updatedReview.id,
				rating: updatedReview.rating,
				comment: updatedReview.comment,
				createdAt: updatedReview.createdAt.toISOString(),
				user: updatedReview.user,
			},
		});
	} catch (error) {
		console.error('Error updating review:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ reviewId: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { reviewId: reviewIdParam } = await params;
		const reviewId = parseInt(reviewIdParam);

		if (isNaN(reviewId)) {
			return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
		}

		// Check if review exists and belongs to the user
		const existingReview = await prisma.review.findUnique({
			where: { id: reviewId },
		});

		if (!existingReview) {
			return NextResponse.json({ error: 'Review not found' }, { status: 404 });
		}

		if (existingReview.userId !== parseInt(session.user.id)) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Delete the review
		await prisma.review.delete({
			where: { id: reviewId },
		});

		return NextResponse.json({
			message: 'Review deleted successfully',
			recipeId: existingReview.recipeId,
		});
	} catch (error) {
		console.error('Error deleting review:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
