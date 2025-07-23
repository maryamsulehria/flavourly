import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ listId: string; itemId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { listId, itemId } = await params;
		const { isCompleted } = await request.json();

		// Verify the shopping list belongs to the user
		const shoppingList = await prisma.shoppingList.findFirst({
			where: {
				id: parseInt(listId),
				userId: parseInt(session.user.id),
			},
		});

		if (!shoppingList) {
			return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
		}

		// Update the item
		const updatedItem = await prisma.shoppingListItem.update({
			where: {
				id: parseInt(itemId),
				listId: parseInt(listId),
			},
			data: {
				isCompleted,
			},
		});

		return NextResponse.json(updatedItem);
	} catch (error) {
		console.error('Error updating shopping list item:', error);
		return NextResponse.json({ error: 'Failed to update shopping list item' }, { status: 500 });
	}
}
