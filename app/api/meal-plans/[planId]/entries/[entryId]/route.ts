import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/meal-plans/[planId]/entries/[entryId] - Remove a recipe from a meal plan
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ planId: string; entryId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { planId, entryId } = await params;

		// Verify the meal plan entry belongs to the user
		const entry = await prisma.mealPlanEntry.findFirst({
			where: {
				id: parseInt(entryId),
				plan: {
					id: parseInt(planId),
					userId: parseInt(session.user.id),
				},
			},
		});

		if (!entry) {
			return NextResponse.json({ error: 'Meal plan entry not found' }, { status: 404 });
		}

		await prisma.mealPlanEntry.delete({
			where: {
				id: parseInt(entryId),
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting meal plan entry:', error);
		return NextResponse.json({ error: 'Failed to delete meal plan entry' }, { status: 500 });
	}
}
