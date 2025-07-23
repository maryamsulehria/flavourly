import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/collections/[collectionId]/recipes - Add recipe to collection
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ collectionId: string }> },
) {
	try {
		const session = await auth();
		const { collectionId } = await params;

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const collectionIdNum = parseInt(collectionId);
		if (isNaN(collectionIdNum)) {
			return NextResponse.json({ error: 'Invalid collection ID' }, { status: 400 });
		}

		const body = await request.json();
		const { recipeId } = body;

		if (!recipeId || isNaN(parseInt(recipeId))) {
			return NextResponse.json({ error: 'Valid recipe ID is required' }, { status: 400 });
		}

		const recipeIdNum = parseInt(recipeId);

		// Check if collection exists and belongs to user
		const collection = await prisma.collection.findFirst({
			where: {
				id: collectionIdNum,
				userId: parseInt(session.user.id),
			},
		});

		if (!collection) {
			return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
		}

		// Check if recipe exists
		const recipe = await prisma.recipe.findUnique({
			where: { id: recipeIdNum },
		});

		if (!recipe) {
			return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
		}

		// Check if recipe is already in collection
		const existingEntry = await prisma.collectionRecipe.findUnique({
			where: {
				collectionId_recipeId: {
					collectionId: collectionIdNum,
					recipeId: recipeIdNum,
				},
			},
		});

		if (existingEntry) {
			return NextResponse.json({ error: 'Recipe is already in this collection' }, { status: 409 });
		}

		// Add recipe to collection
		await prisma.collectionRecipe.create({
			data: {
				collectionId: collectionIdNum,
				recipeId: recipeIdNum,
			},
		});

		return NextResponse.json({ message: 'Recipe added to collection successfully' });
	} catch (error) {
		console.error('Error adding recipe to collection:', error);
		return NextResponse.json({ error: 'Failed to add recipe to collection' }, { status: 500 });
	}
}

// DELETE /api/collections/[collectionId]/recipes - Remove recipe from collection
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ collectionId: string }> },
) {
	try {
		const session = await auth();
		const { collectionId } = await params;

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const collectionIdNum = parseInt(collectionId);
		if (isNaN(collectionIdNum)) {
			return NextResponse.json({ error: 'Invalid collection ID' }, { status: 400 });
		}

		const { searchParams } = new URL(request.url);
		const recipeId = searchParams.get('recipeId');

		if (!recipeId || isNaN(parseInt(recipeId))) {
			return NextResponse.json({ error: 'Valid recipe ID is required' }, { status: 400 });
		}

		const recipeIdNum = parseInt(recipeId);

		// Check if collection exists and belongs to user
		const collection = await prisma.collection.findFirst({
			where: {
				id: collectionIdNum,
				userId: parseInt(session.user.id),
			},
		});

		if (!collection) {
			return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
		}

		// Check if recipe is in collection
		const existingEntry = await prisma.collectionRecipe.findUnique({
			where: {
				collectionId_recipeId: {
					collectionId: collectionIdNum,
					recipeId: recipeIdNum,
				},
			},
		});

		if (!existingEntry) {
			return NextResponse.json({ error: 'Recipe is not in this collection' }, { status: 404 });
		}

		// Remove recipe from collection
		await prisma.collectionRecipe.delete({
			where: {
				collectionId_recipeId: {
					collectionId: collectionIdNum,
					recipeId: recipeIdNum,
				},
			},
		});

		return NextResponse.json({ message: 'Recipe removed from collection successfully' });
	} catch (error) {
		console.error('Error removing recipe from collection:', error);
		return NextResponse.json({ error: 'Failed to remove recipe from collection' }, { status: 500 });
	}
}
