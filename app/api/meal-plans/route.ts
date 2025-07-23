import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/meal-plans - Get user's meal plans
export async function GET() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const mealPlans = await prisma.mealPlan.findMany({
			where: {
				userId: parseInt(session.user.id),
			},
			include: {
				entries: {
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
				},
			},
			orderBy: {
				startDate: 'desc',
			},
		});

		return NextResponse.json(mealPlans);
	} catch (error) {
		console.error('Error fetching meal plans:', error);
		return NextResponse.json({ error: 'Failed to fetch meal plans' }, { status: 500 });
	}
}

// POST /api/meal-plans - Create a new meal plan
export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { planName, startDate, endDate } = body;

		if (!planName || !startDate || !endDate) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Ensure dates are handled as local dates without timezone conversion
		const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
		const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
		const localStartDate = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed
		const localEndDate = new Date(endYear, endMonth - 1, endDay); // month is 0-indexed

		const mealPlan = await prisma.mealPlan.create({
			data: {
				planName,
				startDate: localStartDate,
				endDate: localEndDate,
				userId: parseInt(session.user.id),
			},
			include: {
				entries: {
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
				},
			},
		});

		return NextResponse.json(mealPlan);
	} catch (error) {
		console.error('Error creating meal plan:', error);
		return NextResponse.json({ error: 'Failed to create meal plan' }, { status: 500 });
	}
}
