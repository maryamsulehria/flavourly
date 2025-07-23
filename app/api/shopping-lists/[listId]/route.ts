import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ listId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { listId } = await params;
		const userId = parseInt(session.user.id);

		const shoppingList = await prisma.shoppingList.findFirst({
			where: {
				id: parseInt(listId),
				userId,
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

		if (!shoppingList) {
			return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
		}

		return NextResponse.json(shoppingList);
	} catch (error) {
		console.error('Error fetching shopping list:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ listId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { listId } = await params;
		const userId = parseInt(session.user.id);
		const body = await request.json();
		const { listName, items } = body;

		// Check if shopping list exists and belongs to user
		const existingList = await prisma.shoppingList.findFirst({
			where: {
				id: parseInt(listId),
				userId,
			},
		});

		if (!existingList) {
			return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
		}

		// Update shopping list
		const updatedList = await prisma.shoppingList.update({
			where: {
				id: parseInt(listId),
			},
			data: {
				listName: listName || existingList.listName,
				items: {
					deleteMany: {},
					create:
						items?.map((item: any, index: number) => ({
							itemName: item.itemName,
							quantity: item.quantity,
							unit: item.unit,
							notes: item.notes,
							isCompleted: item.isCompleted || false,
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

		return NextResponse.json(updatedList);
	} catch (error) {
		console.error('Error updating shopping list:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ listId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { listId } = await params;
		const userId = parseInt(session.user.id);

		// Check if shopping list exists and belongs to user
		const existingList = await prisma.shoppingList.findFirst({
			where: {
				id: parseInt(listId),
				userId,
			},
		});

		if (!existingList) {
			return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
		}

		// Delete the shopping list (items will be deleted automatically due to CASCADE)
		await prisma.shoppingList.delete({
			where: {
				id: parseInt(listId),
			},
		});

		return NextResponse.json({ message: 'Shopping list deleted successfully' });
	} catch (error) {
		console.error('Error deleting shopping list:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
