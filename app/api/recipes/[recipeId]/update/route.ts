import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ recipeId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user is a nutritionist
		const user = await prisma.user.findUnique({
			where: { id: parseInt(session.user.id) },
			include: { role: true },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		if (!user.role) {
			return NextResponse.json({ error: 'User role not found' }, { status: 500 });
		}

		if (user.role.name !== 'Nutritionist') {
			return NextResponse.json(
				{ error: 'Forbidden - Nutritionist access required' },
				{ status: 403 },
			);
		}

		const { recipeId: recipeIdParam } = await params;
		const recipeId = parseInt(recipeIdParam);
		if (isNaN(recipeId)) {
			return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
		}

		const body = await request.json();
		const { healthTips, nutritionalInfo, tags } = body;

		// Check if recipe exists
		const existingRecipe = await prisma.recipe.findUnique({
			where: { id: recipeId },
		});

		if (!existingRecipe) {
			return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
		}

		// Update recipe data
		const updateData: any = {
			updatedAt: new Date(),
		};

		if (healthTips !== undefined) {
			updateData.healthTips = healthTips;
		}

		if (nutritionalInfo !== undefined) {
			try {
				// Convert string values to Decimal for database storage
				const processedNutritionalInfo = {
					calories: nutritionalInfo.calories ? parseFloat(nutritionalInfo.calories) : null,
					proteinGrams: nutritionalInfo.proteinGrams
						? parseFloat(nutritionalInfo.proteinGrams)
						: null,
					carbohydratesGrams: nutritionalInfo.carbohydratesGrams
						? parseFloat(nutritionalInfo.carbohydratesGrams)
						: null,
					fatGrams: nutritionalInfo.fatGrams ? parseFloat(nutritionalInfo.fatGrams) : null,
					fiberGrams: nutritionalInfo.fiberGrams ? parseFloat(nutritionalInfo.fiberGrams) : null,
					sugarGrams: nutritionalInfo.sugarGrams ? parseFloat(nutritionalInfo.sugarGrams) : null,
					sodiumMg: nutritionalInfo.sodiumMg ? parseFloat(nutritionalInfo.sodiumMg) : null,
					dataSource: nutritionalInfo.dataSource || 'verified_nutritionist',
				};

				// Update or create nutritional info
				await prisma.nutritionalInformation.upsert({
					where: { recipeId },
					update: processedNutritionalInfo,
					create: {
						recipeId,
						...processedNutritionalInfo,
					},
				});
			} catch (nutritionError) {
				console.error('Error updating nutritional info:', nutritionError);
				return NextResponse.json(
					{ error: 'Failed to update nutritional information' },
					{ status: 500 },
				);
			}
		}

		// Update recipe
		try {
			await prisma.recipe.update({
				where: { id: recipeId },
				data: updateData,
			});
		} catch (recipeError) {
			console.error('Error updating recipe:', recipeError);
			return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
		}

		// Handle tags if provided
		if (tags !== undefined) {
			try {
				// Remove existing tags
				await prisma.recipeTag.deleteMany({
					where: { recipeId },
				});

				// Add new tags
				if (Array.isArray(tags) && tags.length > 0) {
					// Handle both array of IDs and array of objects with id property
					const tagData = tags.map((tag: any) => ({
						recipeId,
						tagId: typeof tag === 'number' ? tag : tag.id,
					}));

					await prisma.recipeTag.createMany({
						data: tagData,
					});
				}
			} catch (tagError) {
				console.error('Error updating tags:', tagError);
				return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 });
			}
		}

		return NextResponse.json({
			message: 'Recipe updated successfully',
			recipeId,
		});
	} catch (error) {
		console.error('Error updating recipe:', error);
		return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
	}
}
