import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/meal-plans/[planId]/entries - Get entries for a specific meal plan
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

		const entries = await prisma.mealPlanEntry.findMany({
			where: {
				planId: parseInt(planId),
				plan: {
					userId: parseInt(session.user.id),
				},
			},
			include: {
				recipe: {
					include: {
						media: true,
						author: {
							select: {
								fullName: true,
							},
						},
					},
				},
			},
			orderBy: {
				mealDate: 'asc',
			},
		});

		return NextResponse.json(entries);
	} catch (error) {
		console.error('Error fetching meal plan entries:', error);
		return NextResponse.json({ error: 'Failed to fetch meal plan entries' }, { status: 500 });
	}
}

// POST /api/meal-plans/[planId]/entries - Add a recipe to a meal plan
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ planId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { planId } = await params;
		const body = await request.json();
		const { recipeId, mealDate, mealType, servingsToPrepare } = body;

		if (!recipeId || !mealDate || !mealType) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Verify the meal plan belongs to the user
		const mealPlan = await prisma.mealPlan.findFirst({
			where: {
				id: parseInt(planId),
				userId: parseInt(session.user.id),
			},
		});

		if (!mealPlan) {
			return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
		}

		// Ensure the date is handled as a local date without timezone conversion
		const [year, month, day] = mealDate.split('-').map(Number);
		const localDate = new Date(year, month - 1, day); // month is 0-indexed

		const entry = await prisma.mealPlanEntry.create({
			data: {
				planId: parseInt(planId),
				recipeId: parseInt(recipeId),
				mealDate: localDate,
				mealType,
				servingsToPrepare: servingsToPrepare || 1,
			},
			include: {
				recipe: {
					include: {
						media: true,
						author: {
							select: {
								fullName: true,
							},
						},
					},
				},
			},
		});

		return NextResponse.json(entry);
	} catch (error) {
		console.error('Error adding meal plan entry:', error);
		return NextResponse.json({ error: 'Failed to add meal plan entry' }, { status: 500 });
	}
}
