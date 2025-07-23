import { prisma } from '@/lib/prisma';
import { VerificationStatus } from '@prisma/client';

export async function getNutritionistStats(nutritionistId: number) {
	const [pendingCount, verifiedCount, totalRecipes] = await Promise.all([
		// Count pending recipes
		prisma.recipe.count({
			where: { status: VerificationStatus.pending_verification },
		}),

		// Count recipes verified by this nutritionist
		prisma.recipe.count({
			where: {
				verifiedById: nutritionistId,
				status: VerificationStatus.verified,
			},
		}),

		// Total recipes in the system
		prisma.recipe.count(),
	]);

	return {
		pendingReviews: pendingCount,
		verifiedRecipes: verifiedCount,
		totalRecipes,
	};
}

export async function getRecentPendingRecipes(limit: number = 5) {
	return prisma.recipe.findMany({
		where: { status: VerificationStatus.pending_verification },
		include: {
			author: {
				select: {
					username: true,
					fullName: true,
				},
			},
			_count: {
				select: {
					ingredients: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
		take: limit,
	});
}

export async function getRecentVerifiedRecipes(nutritionistId: number, limit: number = 5) {
	return prisma.recipe.findMany({
		where: {
			verifiedById: nutritionistId,
			status: VerificationStatus.verified,
		},
		include: {
			author: {
				select: {
					username: true,
					fullName: true,
				},
			},
			_count: {
				select: {
					reviews: true,
				},
			},
		},
		orderBy: { verifiedAt: 'desc' },
		take: limit,
	});
}
