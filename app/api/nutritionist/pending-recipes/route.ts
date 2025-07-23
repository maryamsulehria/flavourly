import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, RoleName, VerificationStatus } from '@prisma/client';
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
		const limit = parseInt(searchParams.get('limit') || '5');
		const cursor = searchParams.get('cursor');
		const searchQuery = searchParams.get('search') || '';

		// Create a where clause for filtering
		const where: Prisma.RecipeWhereInput = {
			status: VerificationStatus.pending_verification,
			...(searchQuery
				? {
						OR: [
							{
								title: {
									contains: searchQuery,
									mode: Prisma.QueryMode.insensitive,
								},
							},
							{
								description: {
									contains: searchQuery,
									mode: Prisma.QueryMode.insensitive,
								},
							},
							{
								author: {
									OR: [
										{
											username: {
												contains: searchQuery,
												mode: Prisma.QueryMode.insensitive,
											},
										},
										{
											fullName: {
												contains: searchQuery,
												mode: Prisma.QueryMode.insensitive,
											},
										},
									],
								},
							},
						],
				  }
				: {}),
		};

		// Fetch pending recipes with pagination if cursor is provided
		const recipes = await prisma.recipe.findMany({
			where,
			include: {
				author: {
					select: {
						username: true,
						fullName: true,
						profilePicture: true,
					},
				},
				_count: {
					select: {
						ingredients: true,
						steps: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
			take: limit,
			...(cursor ? { skip: 1, cursor: { id: parseInt(cursor) } } : {}),
		});

		// Get total count for pagination
		const totalCount = await prisma.recipe.count({
			where,
		});

		return NextResponse.json({
			recipes,
			totalCount,
			hasMore: recipes.length === limit,
			nextCursor: recipes.length ? recipes[recipes.length - 1].id.toString() : null,
		});
	} catch (error) {
		console.error('Error fetching pending recipes:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
