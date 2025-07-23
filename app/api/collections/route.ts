import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/collections - Fetch user's collections
export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const collections = await prisma.collection.findMany({
			where: {
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
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Transform the data to include recipe count and first image
		const transformedCollections = collections.map(collection => ({
			id: collection.id,
			collectionName: collection.collectionName,
			description: collection.description,
			createdAt: collection.createdAt,
			recipeCount: collection.recipes.length,
			firstImage: collection.recipes[0]?.recipe.media[0]?.url || null,
		}));

		return NextResponse.json(transformedCollections);
	} catch (error) {
		console.error('Error fetching collections:', error);
		return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
	}
}

// POST /api/collections - Create a new collection
export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

		// Check if collection name already exists for this user
		const existingCollection = await prisma.collection.findFirst({
			where: {
				userId: parseInt(session.user.id),
				collectionName: collectionName.trim(),
			},
		});

		if (existingCollection) {
			return NextResponse.json(
				{ error: 'A collection with this name already exists' },
				{ status: 409 },
			);
		}

		// Create the collection
		const collection = await prisma.collection.create({
			data: {
				collectionName: collectionName.trim(),
				description: description?.trim() || null,
				userId: parseInt(session.user.id),
			},
		});

		return NextResponse.json(collection, { status: 201 });
	} catch (error) {
		console.error('Error creating collection:', error);
		return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
	}
}
