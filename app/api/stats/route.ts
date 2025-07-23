import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		// Get count of verified recipes
		const verifiedRecipesCount = await prisma.recipe.count({
			where: {
				status: 'verified',
			},
		});

		// Get count of nutritionists
		const nutritionistsCount = await prisma.user.count({
			where: {
				role: {
					name: 'Nutritionist',
				},
			},
		});

		return NextResponse.json({
			verifiedRecipes: verifiedRecipesCount,
			nutritionists: nutritionistsCount,
		});
	} catch (error) {
		console.error('Error fetching stats:', error);
		return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
	}
}
