import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ recipeId: string }> },
) {
	try {
		const { recipeId: recipeIdParam } = await params;
		const recipeId = parseInt(recipeIdParam);

		if (isNaN(recipeId)) {
			return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
		}

		const recipe = await prisma.recipe.findUnique({
			where: { id: recipeId },
			include: {
				author: {
					select: {
						id: true,
						username: true,
						fullName: true,
						profilePicture: true,
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
				media: {
					select: {
						id: true,
						url: true,
						caption: true,
						mediaType: true,
					},
				},
				nutritionalInfo: true,
				steps: {
					orderBy: { stepNumber: 'asc' },
					select: {
						id: true,
						stepNumber: true,
						instruction: true,
					},
				},
				ingredients: {
					include: {
						ingredient: {
							select: {
								id: true,
								name: true,
							},
						},
						unit: {
							select: {
								id: true,
								unitName: true,
								abbreviation: true,
							},
						},
					},
				},
				tags: {
					include: {
						tag: {
							include: {
								tagType: {
									select: {
										id: true,
										typeName: true,
									},
								},
							},
						},
					},
				},
				reviews: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
								fullName: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
				},
				_count: {
					select: {
						reviews: true,
						ingredients: true,
						steps: true,
					},
				},
			},
		});

		if (!recipe) {
			return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
		}

		// Calculate average rating
		const totalRating = recipe.reviews.reduce((sum, review) => sum + review.rating, 0);
		const averageRating = recipe.reviews.length > 0 ? totalRating / recipe.reviews.length : null;

		// Transform the data to match the expected interface
		const transformedRecipe = {
			id: recipe.id,
			title: recipe.title,
			description: recipe.description,
			cookingTimeMinutes: recipe.cookingTimeMinutes,
			servings: recipe.servings,
			status: recipe.status,
			verifiedAt: recipe.verifiedAt?.toISOString() || null,
			healthTips: recipe.healthTips,
			createdAt: recipe.createdAt.toISOString(),
			updatedAt: recipe.updatedAt.toISOString(),
			authorId: recipe.authorId,
			verifiedById: recipe.verifiedById,
			author: recipe.author,
			verifiedBy: recipe.verifiedBy,
			media: recipe.media,
			nutritionalInfo: recipe.nutritionalInfo,
			steps: recipe.steps,
			ingredients: recipe.ingredients,
			tags: recipe.tags.map(rt => ({
				tag: {
					id: rt.tag.id,
					tagName: rt.tag.tagName,
					tagType: {
						id: rt.tag.tagType.id,
						typeName: rt.tag.tagType.typeName,
					},
				},
			})),
			reviews: recipe.reviews.map(review => ({
				id: review.id,
				rating: review.rating,
				comment: review.comment,
				createdAt: review.createdAt.toISOString(),
				user: review.user,
			})),
			averageRating,
			reviewCount: recipe._count.reviews,
			_count: {
				ingredients: recipe._count.ingredients,
				steps: recipe._count.steps,
				reviews: recipe._count.reviews,
			},
		};

		return NextResponse.json(transformedRecipe);
	} catch (error) {
		console.error('Error fetching recipe:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(
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

		const body = await request.json();
		const { title, description, cookingTimeMinutes, servings, ingredients, steps, media } = body;

		// Validate required fields
		if (!title?.trim()) {
			return NextResponse.json({ error: 'Recipe title is required' }, { status: 400 });
		}

		if (!ingredients?.length || !steps?.length) {
			return NextResponse.json(
				{ error: 'At least one ingredient and step is required' },
				{ status: 400 },
			);
		}

		// Check if recipe exists and belongs to user
		const existingRecipe = await prisma.recipe.findFirst({
			where: {
				id: recipeId,
				authorId: parseInt(session.user.id),
			},
		});

		if (!existingRecipe) {
			return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
		}

		// Update recipe in a transaction with increased timeout
		const updatedRecipe = await prisma.$transaction(
			async tx => {
				// Update main recipe data
				const recipe = await tx.recipe.update({
					where: { id: recipeId },
					data: {
						title: title.trim(),
						description: description?.trim() || null,
						cookingTimeMinutes: cookingTimeMinutes ? parseInt(cookingTimeMinutes) : null,
						servings: servings ? parseInt(servings) : null,
						updatedAt: new Date(),
					},
				});

				// Delete existing ingredients and steps
				await tx.recipeIngredient.deleteMany({
					where: { recipeId },
				});
				await tx.preparationStep.deleteMany({
					where: { recipeId },
				});

				// Batch upsert ingredients and units for better performance
				const uniqueIngredients = [
					...new Set(ingredients.map((i: any) => i.name?.trim()).filter(Boolean)),
				];
				const uniqueUnits = [...new Set(ingredients.map((i: any) => i.unit).filter(Boolean))];

				// Upsert all ingredients at once
				const ingredientMap = new Map<string, number>();
				for (const ingredientName of uniqueIngredients) {
					const ingredientRecord = await tx.ingredient.upsert({
						where: { name: ingredientName as string },
						update: {},
						create: { name: ingredientName as string },
					});
					ingredientMap.set(ingredientName as string, ingredientRecord.id);
				}

				// Upsert all units at once
				const unitMap = new Map<string, number>();
				for (const unitName of uniqueUnits) {
					const unitRecord = await tx.measurementUnit.upsert({
						where: { unitName: unitName as string },
						update: {},
						create: { unitName: unitName as string, abbreviation: unitName as string },
					});
					unitMap.set(unitName as string, unitRecord.id);
				}

				// Create all recipe ingredients at once
				const recipeIngredientsData = ingredients
					.filter((ingredient: any) => ingredient.name?.trim() && ingredient.quantity?.trim())
					.map((ingredient: any) => {
						const ingredientId = ingredientMap.get(ingredient.name.trim());
						const unitId = unitMap.get(ingredient.unit);

						if (!ingredientId || !unitId) {
							throw new Error(`Missing ingredient or unit mapping for ${ingredient.name}`);
						}

						return {
							recipeId,
							ingredientId,
							unitId,
							quantity: parseFloat(ingredient.quantity),
							notes: ingredient.notes?.trim() || null,
						};
					});

				if (recipeIngredientsData.length > 0) {
					await tx.recipeIngredient.createMany({
						data: recipeIngredientsData,
					});
				}

				// Create all steps at once
				const stepsData = steps
					.filter((step: any) => step?.trim())
					.map((step: any, index: number) => ({
						recipeId,
						stepNumber: index + 1,
						instruction: step.trim(),
					}));

				if (stepsData.length > 0) {
					await tx.preparationStep.createMany({
						data: stepsData,
					});
				}

				// Update media (keep existing media, only update if new media is provided)
				if (media && Array.isArray(media)) {
					// Delete existing media
					await tx.media.deleteMany({
						where: { recipeId },
					});

					// Add new media
					const mediaData = media
						.filter(mediaItem => mediaItem.url)
						.map(mediaItem => ({
							recipeId,
							mediaType: mediaItem.type,
							url: mediaItem.url,
							caption: null,
						}));

					if (mediaData.length > 0) {
						await tx.media.createMany({
							data: mediaData,
						});
					}
				}

				return recipe;
			},
			{
				timeout: 30000, // 30 seconds timeout
			},
		);

		return NextResponse.json({
			message: 'Recipe updated successfully',
			recipeId: updatedRecipe.id,
		});
	} catch (error) {
		console.error('Error updating recipe:', error);
		return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
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

		const { recipeId: recipeIdParam } = await params;
		const recipeId = parseInt(recipeIdParam);
		if (isNaN(recipeId)) {
			return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
		}

		// Check if recipe exists and belongs to user
		const existingRecipe = await prisma.recipe.findFirst({
			where: {
				id: recipeId,
				authorId: parseInt(session.user.id),
			},
			include: {
				media: true,
			},
		});

		if (!existingRecipe) {
			return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
		}

		// Delete images from Cloudinary if they exist
		if (existingRecipe.media && existingRecipe.media.length > 0) {
			const { extractPublicIdFromUrl, deleteFromCloudinary } = require('@/lib/cloudinary');

			// Delete each media file from Cloudinary
			for (const media of existingRecipe.media) {
				try {
					// Extract public ID from URL
					const publicId = extractPublicIdFromUrl(media.url);

					if (publicId) {
						// Delete from Cloudinary
						await deleteFromCloudinary(publicId);
						console.log(`Successfully deleted from Cloudinary: ${publicId} (${media.url})`);
					} else {
						console.warn(`Could not extract public ID from URL: ${media.url}`);
					}
				} catch (cloudinaryError) {
					console.error(`Failed to delete image from Cloudinary: ${media.url}`, cloudinaryError);
					// Continue with deletion even if Cloudinary deletion fails
				}
			}
		}

		// Delete recipe (cascade will handle related data)
		await prisma.recipe.delete({
			where: { id: recipeId },
		});

		return NextResponse.json({ message: 'Recipe deleted successfully' });
	} catch (error) {
		console.error('Error deleting recipe:', error);
		return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
	}
}
