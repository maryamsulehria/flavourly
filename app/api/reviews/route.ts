import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { recipeId, rating, comment } = await request.json();

		// Validate input
		if (!recipeId || !rating) {
			return NextResponse.json({ error: 'Recipe ID and rating are required' }, { status: 400 });
		}

		if (rating < 1 || rating > 5) {
			return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
		}

		// Check if recipe exists
		const recipe = await prisma.recipe.findUnique({
			where: { id: recipeId },
		});

		if (!recipe) {
			return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
		}

		// Check if user has already reviewed this recipe
		const existingReview = await prisma.review.findUnique({
			where: {
				recipeId_userId: {
					recipeId,
					userId: parseInt(session.user.id),
				},
			},
		});

		if (existingReview) {
			return NextResponse.json({ error: 'You have already reviewed this recipe' }, { status: 400 });
		}

		// Create the review
		const review = await prisma.review.create({
			data: {
				recipeId,
				userId: parseInt(session.user.id),
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

		// Update recipe's average rating and review count
		const allReviews = await prisma.review.findMany({
			where: { recipeId },
			select: { rating: true },
		});

		const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

		// Note: We'll update the recipe's averageRating and reviewCount in the recipe API
		// This is handled by the recipe detail API which calculates these values dynamically

		return NextResponse.json({
			reviewId: review.id,
			recipeId: review.recipeId,
			review: {
				id: review.id,
				rating: review.rating,
				comment: review.comment,
				createdAt: review.createdAt.toISOString(),
				user: review.user,
			},
		});
	} catch (error) {
		console.error('Error creating review:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
