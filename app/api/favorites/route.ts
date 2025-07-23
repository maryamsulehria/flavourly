import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const favorites = await prisma.favoriteRecipe.findMany({
			where: {
				userId: parseInt(session.user.id),
			},
			include: {
				recipe: {
					include: {
						author: {
							select: {
								id: true,
								fullName: true,
								username: true,
							},
						},
						media: {
							select: {
								id: true,
								url: true,
								caption: true,
								mediaType: true,
							},
						},
						ingredients: {
							include: {
								ingredient: true,
								unit: true,
							},
						},
						reviews: {
							select: {
								rating: true,
							},
						},
						nutritionalInfo: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Transform the data to include computed fields
		const transformedFavorites = favorites.map(favorite => {
			const recipe = favorite.recipe;
			const averageRating =
				recipe.reviews.length > 0
					? recipe.reviews.reduce((sum, review) => sum + review.rating, 0) / recipe.reviews.length
					: null;

			return {
				...favorite,
				recipe: {
					...recipe,
					averageRating,
					reviewCount: recipe.reviews.length,
					// Remove the raw reviews array since we have computed values
					reviews: undefined,
				},
			};
		});

		return NextResponse.json(transformedFavorites);
	} catch (error) {
		console.error('Error fetching favorites:', error);
		return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
	}
}
