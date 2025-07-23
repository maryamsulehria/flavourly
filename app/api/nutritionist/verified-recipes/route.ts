import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RoleName } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	try {
		const session = await auth();

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (session.user.role !== RoleName.Nutritionist) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const { searchParams } = new URL(req.url);
		const search = searchParams.get('search') || '';
		const sortBy = searchParams.get('sortBy') || 'verifiedAt';
		const sortOrder = searchParams.get('sortOrder') || 'desc';
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '12');

		const skip = (page - 1) * limit;
		const nutritionistId = parseInt(session.user.id);

		// Build where clause
		const where = {
			verifiedById: nutritionistId,
			status: 'verified' as const,
			...(search && {
				OR: [
					{ title: { contains: search, mode: 'insensitive' as const } },
					{ description: { contains: search, mode: 'insensitive' as const } },
					{
						author: {
							username: { contains: search, mode: 'insensitive' as const },
						},
					},
					{
						author: {
							fullName: { contains: search, mode: 'insensitive' as const },
						},
					},
					{
						tags: {
							some: {
								tag: {
									tagName: { contains: search, mode: 'insensitive' as const },
								},
							},
						},
					},
				],
			}),
		};

		// Build orderBy clause
		let orderBy: any = {};
		switch (sortBy) {
			case 'verifiedAt':
				orderBy = { verifiedAt: sortOrder };
				break;
			case 'title':
				orderBy = { title: sortOrder };
				break;
			case 'averageRating':
				orderBy = { reviews: { _count: sortOrder } }; // This is a simplified approach
				break;
			default:
				orderBy = { verifiedAt: 'desc' };
		}

		// Get recipes
		const recipes = await prisma.recipe.findMany({
			where,
			orderBy,
			skip,
			take: limit,
			include: {
				author: {
					select: {
						id: true,
						username: true,
						fullName: true,
						profilePicture: true,
					},
				},
				tags: {
					include: {
						tag: {
							select: {
								id: true,
								tagName: true,
								tagType: {
									select: {
										typeName: true,
									},
								},
							},
						},
					},
				},
				reviews: {
					select: {
						rating: true,
					},
				},
				_count: {
					select: {
						ingredients: true,
						steps: true,
						reviews: true,
						favoritedBy: true,
					},
				},
			},
		});

		// Calculate average rating for each recipe
		const recipesWithRating = recipes.map(recipe => {
			const totalRating = recipe.reviews.reduce((sum, review) => sum + review.rating, 0);
			const averageRating = recipe.reviews.length > 0 ? totalRating / recipe.reviews.length : null;

			return {
				...recipe,
				averageRating,
				reviews: undefined, // Remove reviews from response
			};
		});

		// Get total count
		const totalCount = await prisma.recipe.count({ where });

		// Get stats
		const stats = await prisma.recipe.aggregate({
			where: {
				verifiedById: nutritionistId,
				status: 'verified',
			},
			_count: {
				id: true,
			},
		});

		// Get this month's count
		const thisMonthStart = new Date();
		thisMonthStart.setDate(1);
		thisMonthStart.setHours(0, 0, 0, 0);

		const thisMonthCount = await prisma.recipe.count({
			where: {
				verifiedById: nutritionistId,
				status: 'verified',
				verifiedAt: {
					gte: thisMonthStart,
				},
			},
		});

		// Get average rating across all verified recipes
		const allReviews = await prisma.review.findMany({
			where: {
				recipe: {
					verifiedById: nutritionistId,
					status: 'verified',
				},
			},
			select: {
				rating: true,
			},
		});

		const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
		const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

		// Get pending reviews count
		const pendingReviews = await prisma.recipe.count({
			where: {
				status: 'pending_verification',
			},
		});

		return NextResponse.json({
			recipes: recipesWithRating,
			totalCount,
			stats: {
				totalVerified: stats._count.id,
				thisMonth: thisMonthCount,
				averageRating,
				pendingReviews,
			},
		});
	} catch (error) {
		console.error('Error fetching verified recipes:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
