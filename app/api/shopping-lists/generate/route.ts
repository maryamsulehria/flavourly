import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = parseInt(session.user.id);
		const body = await request.json();
		const { mealPlanId, listName } = body;

		if (!mealPlanId) {
			return NextResponse.json({ error: 'Meal plan ID is required' }, { status: 400 });
		}

		// Verify meal plan exists and belongs to user
		const mealPlan = await prisma.mealPlan.findFirst({
			where: {
				id: parseInt(mealPlanId),
				userId,
			},
			include: {
				entries: {
					include: {
						recipe: {
							include: {
								ingredients: {
									include: {
										ingredient: true,
										unit: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!mealPlan) {
			return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
		}

		// Generate shopping list items from meal plan
		const ingredientMap = new Map();

		mealPlan.entries.forEach(entry => {
			entry.recipe.ingredients.forEach(recipeIngredient => {
				const key = `${recipeIngredient.ingredient.name}-${recipeIngredient.unit.unitName}`;
				const scaledQuantity = Number(recipeIngredient.quantity) * entry.servingsToPrepare;

				if (ingredientMap.has(key)) {
					ingredientMap.get(key).quantity += scaledQuantity;
				} else {
					ingredientMap.set(key, {
						itemName: recipeIngredient.ingredient.name,
						quantity: scaledQuantity,
						unit: recipeIngredient.unit.unitName,
						notes: recipeIngredient.notes,
					});
				}
			});
		});

		const shoppingListItems = Array.from(ingredientMap.values()).map((item, index) => ({
			...item,
			sortOrder: index,
		}));

		// Create shopping list
		const shoppingList = await prisma.shoppingList.create({
			data: {
				listName: listName || `Shopping List - ${mealPlan.planName}`,
				userId,
				mealPlanId: parseInt(mealPlanId),
				items: {
					create: shoppingListItems,
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
		console.error('Error generating shopping list:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
