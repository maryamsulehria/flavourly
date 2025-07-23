import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RoleName } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
	try {
		const session = await auth();

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const resolvedParams = await params;
		const userId = parseInt(resolvedParams.userId);

		// Check if the user is trying to access their own profile or if they're a nutritionist
		const canAccess =
			parseInt(session.user.id) === userId || session.user.role === RoleName.Nutritionist;

		if (!canAccess) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Get the nutritionist's profile data with verified recipes
		const nutritionist = await prisma.user.findUnique({
			where: {
				id: userId,
				role: { name: RoleName.Nutritionist },
			},
			include: {
				verifiedRecipes: {
					include: {
						nutritionalInfo: true,
						reviews: true,
						_count: {
							select: {
								reviews: true,
								favoritedBy: true,
							},
						},
					},
					orderBy: {
						verifiedAt: 'desc',
					},
				},
			},
		});

		if (!nutritionist) {
			return NextResponse.json({ error: 'Nutritionist not found' }, { status: 404 });
		}

		return NextResponse.json(nutritionist);
	} catch (error) {
		console.error('Error fetching nutritionist profile:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
