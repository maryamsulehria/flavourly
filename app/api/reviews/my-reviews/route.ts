import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const reviews = await prisma.review.findMany({
			where: { userId: parseInt(session.user.id) },
			include: {
				recipe: {
					select: {
						id: true,
						title: true,
						description: true,
						media: {
							select: {
								url: true,
								mediaType: true,
							},
							where: {
								mediaType: 'image',
							},
							take: 1,
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		const transformedReviews = reviews.map(review => ({
			id: review.id,
			rating: review.rating,
			comment: review.comment,
			createdAt: review.createdAt.toISOString(),
			recipe: {
				id: review.recipe.id,
				title: review.recipe.title,
				description: review.recipe.description,
				image: review.recipe.media[0]?.url || null,
			},
		}));

		return NextResponse.json(transformedReviews);
	} catch (error) {
		console.error('Error fetching user reviews:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
