import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> },
) {
	try {
		const { userId } = await params;
		const nutritionistId = parseInt(userId);

		if (isNaN(nutritionistId)) {
			return NextResponse.json({ error: 'Invalid nutritionist ID' }, { status: 400 });
		}

		// Get nutritionist profile with verified recipes
		const nutritionist = await prisma.user.findFirst({
			where: {
				id: nutritionistId,
				role: {
					name: 'Nutritionist',
				},
			},
			include: {
				role: true,
				verifiedRecipes: {
					where: {
						status: {
							in: ['verified', 'needs_revision'],
						},
					},
					include: {
						media: {
							select: {
								id: true,
								url: true,
								mediaType: true,
							},
							take: 1,
						},
						nutritionalInfo: {
							select: {
								calories: true,
								dataSource: true,
							},
						},
						_count: {
							select: {
								reviews: true,
							},
						},
					},
					orderBy: {
						verifiedAt: 'desc',
					},
				},
				_count: {
					select: {
						verifiedRecipes: {
							where: {
								status: {
									in: ['verified', 'needs_revision'],
								},
							},
						},
						reviews: true,
					},
				},
			},
		});

		if (!nutritionist) {
			return NextResponse.json({ error: 'Nutritionist not found' }, { status: 404 });
		}

		// Transform the data to match the expected interface
		const transformedNutritionist = {
			id: nutritionist.id,
			username: nutritionist.username,
			fullName: nutritionist.fullName,
			email: nutritionist.email,
			profilePicture: nutritionist.profilePicture,
			createdAt: nutritionist.createdAt.toISOString(),
			role: nutritionist.role,
			_count: {
				verifiedRecipes: nutritionist._count.verifiedRecipes,
				reviews: nutritionist._count.reviews,
			},
			verifiedRecipes: nutritionist.verifiedRecipes.map(recipe => ({
				id: recipe.id,
				title: recipe.title,
				description: recipe.description,
				status: recipe.status,
				createdAt: recipe.createdAt.toISOString(),
				verifiedAt: recipe.verifiedAt?.toISOString() || null,
				cookingTimeMinutes: recipe.cookingTimeMinutes,
				nutritionalInfo: recipe.nutritionalInfo,
				media: recipe.media,
				_count: recipe._count,
			})),
		};

		return NextResponse.json(transformedNutritionist);
	} catch (error) {
		console.error('Error fetching nutritionist profile:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
