import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ planId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { planId } = await params;
		const userId = parseInt(session.user.id);

		const mealPlan = await prisma.mealPlan.findFirst({
			where: {
				id: parseInt(planId),
				userId,
			},
			include: {
				entries: {
					include: {
						recipe: {
							select: {
								id: true,
								title: true,
								cookingTimeMinutes: true,
							},
						},
					},
				},
			},
		});

		if (!mealPlan) {
			return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
		}

		return NextResponse.json(mealPlan);
	} catch (error) {
		console.error('Error fetching meal plan:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ planId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { planId } = await params;
		const userId = parseInt(session.user.id);

		// Check if meal plan exists and belongs to user
		const existingMealPlan = await prisma.mealPlan.findFirst({
			where: {
				id: parseInt(planId),
				userId,
			},
		});

		if (!existingMealPlan) {
			return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
		}

		// Delete the meal plan (entries will be deleted automatically due to CASCADE)
		await prisma.mealPlan.delete({
			where: {
				id: parseInt(planId),
			},
		});

		return NextResponse.json({ message: 'Meal plan deleted successfully' });
	} catch (error) {
		console.error('Error deleting meal plan:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
