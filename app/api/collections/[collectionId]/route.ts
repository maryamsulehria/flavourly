import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/collections/[collectionId] - Fetch collection details with recipes
export async function GET(
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

		const collection = await prisma.collection.findFirst({
			where: {
				id: collectionIdNum,
				userId: parseInt(session.user.id),
			},
			include: {
				recipes: {
					include: {
						recipe: {
							include: {
								media: true,
								nutritionalInfo: true,
								author: {
									select: {
										id: true,
										username: true,
										fullName: true,
									},
								},
								verifiedBy: {
									select: {
										id: true,
										username: true,
										fullName: true,
										profilePicture: true,
									},
								},
								ingredients: {
									include: {
										ingredient: true,
										unit: true,
									},
								},
								steps: {
									orderBy: {
										stepNumber: 'asc',
									},
								},
							},
						},
					},
					orderBy: {
						recipe: {
							createdAt: 'desc',
						},
					},
				},
			},
		});

		if (!collection) {
			return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
		}

		return NextResponse.json(collection);
	} catch (error) {
		console.error('Error fetching collection:', error);
		return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
	}
}

// PUT /api/collections/[collectionId] - Update collection
export async function PUT(
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
		const { collectionName, description } = body;

		// Validate input
		if (
			!collectionName ||
			typeof collectionName !== 'string' ||
			collectionName.trim().length === 0
		) {
			return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
		}

		if (collectionName.trim().length > 100) {
			return NextResponse.json(
				{ error: 'Collection name must be 100 characters or less' },
				{ status: 400 },
			);
		}

		if (description && description.length > 500) {
			return NextResponse.json(
				{ error: 'Description must be 500 characters or less' },
				{ status: 400 },
			);
		}

		// Check if collection exists and belongs to user
		const existingCollection = await prisma.collection.findFirst({
			where: {
				id: collectionIdNum,
				userId: parseInt(session.user.id),
			},
		});

		if (!existingCollection) {
			return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
		}

		// Check if new name conflicts with another collection
		const nameConflict = await prisma.collection.findFirst({
			where: {
				userId: parseInt(session.user.id),
				collectionName: collectionName.trim(),
				id: { not: collectionIdNum },
			},
		});

		if (nameConflict) {
			return NextResponse.json(
				{ error: 'A collection with this name already exists' },
				{ status: 409 },
			);
		}

		// Update the collection
		const updatedCollection = await prisma.collection.update({
			where: { id: collectionIdNum },
			data: {
				collectionName: collectionName.trim(),
				description: description?.trim() || null,
			},
		});

		return NextResponse.json(updatedCollection);
	} catch (error) {
		console.error('Error updating collection:', error);
		return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
	}
}

// DELETE /api/collections/[collectionId] - Delete collection
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

		// Delete the collection (cascade will handle related records)
		await prisma.collection.delete({
			where: { id: collectionIdNum },
		});

		return NextResponse.json({ message: 'Collection deleted successfully' });
	} catch (error) {
		console.error('Error deleting collection:', error);
		return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
	}
}
