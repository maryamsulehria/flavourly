import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ recipeId: string }> },
) {
	try {
		const { recipeId: recipeIdParam } = await params;
		const recipeId = parseInt(recipeIdParam);

		if (isNaN(recipeId)) {
			return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
		}

		const reviews = await prisma.review.findMany({
			where: { recipeId },
			include: {
				user: {
					select: {
						id: true,
						username: true,
						fullName: true,
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
			user: review.user,
		}));

		return NextResponse.json(transformedReviews);
	} catch (error) {
		console.error('Error fetching reviews:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
