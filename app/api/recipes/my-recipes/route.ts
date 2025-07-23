import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const recipes = await prisma.recipe.findMany({
			where: {
				authorId: parseInt(session.user.id),
			},
			select: {
				id: true,
				title: true,
				description: true,
				cookingTimeMinutes: true,
				servings: true,
				status: true,
				healthTips: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: {
						id: true,
						username: true,
						fullName: true,
					},
				},
				verifiedBy: {
					select: {
						id: true,
						username: true,
						fullName: true,
						profilePicture: true,
					},
				},
				media: {
					take: 1,
					select: {
						id: true,
						url: true,
						caption: true,
						mediaType: true,
					},
				},
				reviews: {
					select: {
						rating: true,
					},
				},
				nutritionalInfo: {
					select: {
						calories: true,
						dataSource: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Calculate average rating for each recipe
		const recipesWithStats = recipes.map(recipe => {
			const averageRating =
				recipe.reviews.length > 0
					? recipe.reviews.reduce(
							(sum: number, review: { rating: number }) => sum + review.rating,
							0,
					  ) / recipe.reviews.length
					: null;

			return {
				...recipe,
				averageRating,
				reviewCount: recipe.reviews.length,
				reviews: undefined, // Remove reviews array from response
			};
		});

		return NextResponse.json(recipesWithStats);
	} catch (error) {
		console.error('Error fetching user recipes:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
