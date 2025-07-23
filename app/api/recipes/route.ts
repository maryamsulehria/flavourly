import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const recipes = await prisma.recipe.findMany({
			where: {
				authorId: parseInt(session.user.id),
			},
			include: {
				author: {
					select: {
						id: true,
						fullName: true,
						username: true,
					},
				},
				media: {
					select: {
						id: true,
						url: true,
						caption: true,
						mediaType: true,
					},
				},
			},
			orderBy: [{ verifiedAt: 'desc' }, { createdAt: 'desc' }],
		});

		return NextResponse.json(recipes);
	} catch (error) {
		console.error('Error fetching recipes:', error);
		return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { title, description, cookingTimeMinutes, servings, ingredients, steps, media } = body;

		// Validate required fields
		if (!title || !ingredients || !steps) {
			return NextResponse.json(
				{ error: 'Title, ingredients, and steps are required' },
				{ status: 400 },
			);
		}

		// Validate ingredients structure
		if (!Array.isArray(ingredients) || ingredients.length === 0) {
			return NextResponse.json({ error: 'At least one ingredient is required' }, { status: 400 });
		}

		// Validate steps structure
		if (!Array.isArray(steps) || steps.length === 0) {
			return NextResponse.json(
				{ error: 'At least one preparation step is required' },
				{ status: 400 },
			);
		}

		// Create recipe with transaction to handle related data
		const recipe = await prisma.$transaction(async tx => {
			// Create the main recipe
			const newRecipe = await tx.recipe.create({
				data: {
					title,
					description: description || null,
					cookingTimeMinutes: cookingTimeMinutes || null,
					servings: servings || null,
					authorId: parseInt(session.user.id),
				},
			});

			// Process ingredients
			for (const ingredientData of ingredients) {
				const { name, quantity, unit, notes } = ingredientData;

				// Find or create ingredient
				let ingredient = await tx.ingredient.findUnique({
					where: { name: name.toLowerCase() },
				});

				if (!ingredient) {
					ingredient = await tx.ingredient.create({
						data: { name: name.toLowerCase() },
					});
				}

				// Find or create measurement unit
				let unitRecord = await tx.measurementUnit.findFirst({
					where: { unitName: unit },
				});

				if (!unitRecord) {
					unitRecord = await tx.measurementUnit.create({
						data: { unitName: unit },
					});
				}

				// Create recipe ingredient relationship
				await tx.recipeIngredient.create({
					data: {
						recipeId: newRecipe.id,
						ingredientId: ingredient.id,
						unitId: unitRecord.id,
						quantity: parseFloat(quantity),
						notes: notes || null,
					},
				});
			}

			// Process preparation steps
			for (let i = 0; i < steps.length; i++) {
				await tx.preparationStep.create({
					data: {
						recipeId: newRecipe.id,
						stepNumber: i + 1,
						instruction: steps[i],
					},
				});
			}

			// Process media uploads
			if (media && Array.isArray(media) && media.length > 0) {
				for (const mediaItem of media) {
					if (mediaItem.url && mediaItem.type) {
						await tx.media.create({
							data: {
								recipeId: newRecipe.id,
								mediaType: mediaItem.type,
								url: mediaItem.url,
								caption: mediaItem.caption || null,
							},
						});
					}
				}
			}

			return newRecipe;
		});

		return NextResponse.json({
			success: true,
			recipe: { id: recipe.id, title: recipe.title },
		});
	} catch (error) {
		console.error('Error creating recipe:', error);
		return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
	}
}
