import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = parseInt(session.user.id);
		const { searchParams } = new URL(request.url);
		const mealPlanId = searchParams.get('mealPlanId');

		const where: any = { userId };
		if (mealPlanId) {
			where.mealPlanId = parseInt(mealPlanId);
		}

		const shoppingLists = await prisma.shoppingList.findMany({
			where,
			include: {
				mealPlan: {
					select: {
						id: true,
						planName: true,
					},
				},
				items: {
					orderBy: {
						sortOrder: 'asc',
					},
				},
			},
			orderBy: {
				updatedAt: 'desc',
			},
		});

		return NextResponse.json(shoppingLists);
	} catch (error) {
		console.error('Error fetching shopping lists:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = parseInt(session.user.id);
		const body = await request.json();
		const { listName, mealPlanId, items } = body;

		if (!listName) {
			return NextResponse.json({ error: 'List name is required' }, { status: 400 });
		}

		// If mealPlanId is provided, verify it belongs to the user
		if (mealPlanId) {
			const mealPlan = await prisma.mealPlan.findFirst({
				where: {
					id: parseInt(mealPlanId),
					userId,
				},
			});

			if (!mealPlan) {
				return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
			}
		}

		const shoppingList = await prisma.shoppingList.create({
			data: {
				listName,
				userId,
				mealPlanId: mealPlanId ? parseInt(mealPlanId) : null,
				items: {
					create:
						items?.map((item: any, index: number) => ({
							itemName: item.itemName,
							quantity: item.quantity,
							unit: item.unit,
							notes: item.notes,
							sortOrder: index,
						})) || [],
				},
			},
			include: {
				mealPlan: {
					select: {
						id: true,
						planName: true,
					},
				},
				items: {
					orderBy: {
						sortOrder: 'asc',
					},
				},
			},
		});

		return NextResponse.json(shoppingList, { status: 201 });
	} catch (error) {
		console.error('Error creating shopping list:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
