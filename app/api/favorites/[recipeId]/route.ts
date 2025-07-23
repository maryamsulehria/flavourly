import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ recipeId: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { recipeId: recipeIdParam } = await params;
		const recipeId = parseInt(recipeIdParam);
		if (isNaN(recipeId)) {
			return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
		}

		// Check if the recipe is favorited by the user
		const favorite = await prisma.favoriteRecipe.findFirst({
			where: {
				userId: parseInt(session.user.id),
				recipeId,
			},
		});

		return NextResponse.json({ isFavorited: !!favorite });
	} catch (error) {
		console.error('Error checking favorite status:', error);
		return NextResponse.json({ error: 'Failed to check favorite status' }, { status: 500 });
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ recipeId: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user is a Recipe Developer
		if (session.user.role !== 'RecipeDeveloper') {
			return NextResponse.json(
				{ error: 'Only Recipe Developers can favorite recipes' },
				{ status: 403 },
			);
		}

		const { recipeId: recipeIdParam } = await params;
		const recipeId = parseInt(recipeIdParam);
		if (isNaN(recipeId)) {
			return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
		}

		// Check if the recipe exists
		const recipe = await prisma.recipe.findUnique({
			where: { id: recipeId },
		});

		if (!recipe) {
			return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
		}

		// Check if already favorited
		const existingFavorite = await prisma.favoriteRecipe.findFirst({
			where: {
				userId: parseInt(session.user.id),
				recipeId,
			},
		});

		if (existingFavorite) {
			return NextResponse.json({ error: 'Recipe already in favorites' }, { status: 400 });
		}

		// Add to favorites
		await prisma.favoriteRecipe.create({
			data: {
				userId: parseInt(session.user.id),
				recipeId,
			},
		});

		return NextResponse.json({ message: 'Recipe added to favorites' });
	} catch (error) {
		console.error('Error adding favorite:', error);
		return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ recipeId: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user is a Recipe Developer
		if (session.user.role !== 'RecipeDeveloper') {
			return NextResponse.json(
				{ error: 'Only Recipe Developers can manage favorites' },
				{ status: 403 },
			);
		}

		const { recipeId: recipeIdParam } = await params;
		const recipeId = parseInt(recipeIdParam);
		if (isNaN(recipeId)) {
			return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
		}

		// Check if the favorite exists
		const existingFavorite = await prisma.favoriteRecipe.findFirst({
			where: {
				userId: parseInt(session.user.id),
				recipeId,
			},
		});

		if (!existingFavorite) {
			return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
		}

		// Remove the favorite
		await prisma.favoriteRecipe.delete({
			where: {
				userId_recipeId: {
					userId: parseInt(session.user.id),
					recipeId,
				},
			},
		});

		return NextResponse.json({ message: 'Recipe removed from favorites' });
	} catch (error) {
		console.error('Error removing favorite:', error);
		return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
	}
}
