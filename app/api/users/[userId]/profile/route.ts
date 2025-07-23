import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> },
) {
	try {
		const { userId: userIdParam } = await params;
		const userId = parseInt(userIdParam);

		if (isNaN(userId)) {
			return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
		}

		// Get user profile with public information
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				role: true,
				createdRecipes: {
					select: {
						id: true,
						title: true,
						description: true,
						status: true,
						createdAt: true,
						verifiedAt: true,
						cookingTimeMinutes: true,
						nutritionalInfo: {
							select: {
								calories: true,
								dataSource: true,
							},
						},
						media: {
							take: 1,
							select: {
								id: true,
								url: true,
								mediaType: true,
							},
						},
						_count: {
							select: {
								reviews: true,
							},
						},
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
				_count: {
					select: {
						createdRecipes: true,
						reviews: true,
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Transform the data to match the expected interface
		const transformedUser = {
			id: user.id,
			username: user.username,
			fullName: user.fullName,
			email: user.email,
			profilePicture: user.profilePicture,
			createdAt: user.createdAt.toISOString(),
			role: user.role,
			_count: {
				recipes: user._count.createdRecipes,
				reviews: user._count.reviews,
			},
			recipes: user.createdRecipes.map((recipe: any) => ({
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

		return NextResponse.json(transformedUser);
	} catch (error) {
		console.error('Error fetching user profile:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
