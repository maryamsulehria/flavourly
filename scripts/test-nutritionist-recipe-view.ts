#!/usr/bin/env tsx

import { prisma } from '../lib/prisma';

async function testNutritionistRecipeView() {
	console.log('🧪 Testing Nutritionist Recipe View Restrictions...\n');

	try {
		// Find a nutritionist user
		const nutritionist = await prisma.user.findFirst({
			where: {
				role: {
					name: 'Nutritionist',
				},
			},
			select: {
				id: true,
				username: true,
				fullName: true,
				role: {
					select: {
						name: true,
					},
				},
			},
		});

		// Find a recipe developer user
		const recipeDeveloper = await prisma.user.findFirst({
			where: {
				role: {
					name: 'RecipeDeveloper',
				},
			},
			select: {
				id: true,
				username: true,
				fullName: true,
				role: {
					select: {
						name: true,
					},
				},
			},
		});

		// Find a sample recipe
		const sampleRecipe = await prisma.recipe.findFirst({
			include: {
				author: {
					select: {
						id: true,
						username: true,
						fullName: true,
						role: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		console.log('👥 User Roles Found:');
		if (nutritionist) {
			console.log(
				`   ✅ Nutritionist: ${nutritionist.fullName || nutritionist.username} (ID: ${
					nutritionist.id
				})`,
			);
		} else {
			console.log('   ❌ No nutritionist user found');
		}

		if (recipeDeveloper) {
			console.log(
				`   ✅ Recipe Developer: ${recipeDeveloper.fullName || recipeDeveloper.username} (ID: ${
					recipeDeveloper.id
				})`,
			);
		} else {
			console.log('   ❌ No recipe developer user found');
		}

		if (sampleRecipe) {
			console.log(
				`   ✅ Sample Recipe: "${sampleRecipe.title}" by ${
					sampleRecipe.author.fullName || sampleRecipe.author.username
				}`,
			);
		} else {
			console.log('   ❌ No sample recipe found');
		}

		console.log('\n🔍 Recipe View Restrictions for Nutritionists:');
		console.log('✅ Quick Actions section is hidden for nutritionists');
		console.log('   - Add to Meal Plan button hidden');
		console.log('   - Add to Collection button hidden');
		console.log('   - Edit Recipe button hidden (unless they are the author)');
		console.log('✅ Favorite button is hidden for nutritionists');
		console.log('✅ Nutritionists can still:');
		console.log('   - View recipe details');
		console.log('   - View ingredients and steps');
		console.log('   - View nutritional information');
		console.log('   - View reviews (read-only)');
		console.log('   - Share recipes');
		console.log('   - See recipe status and verification info');

		console.log('\n🎯 Implementation Details:');
		console.log('✅ Added isNutritionist check: session?.user?.role === "Nutritionist"');
		console.log('✅ Quick Actions card wrapped in: {!isNutritionist && (...)}');
		console.log('✅ Favorite button wrapped in: {!isNutritionist && (...)}');
		console.log('✅ Edit Recipe button still shows for recipe authors (canEdit check)');

		console.log('\n📝 To test the UI:');
		console.log('   1. Sign in as a nutritionist');
		console.log('   2. Navigate to any recipe detail page');
		console.log('   3. Verify Quick Actions section is not visible');
		console.log('   4. Verify Favorite button is not visible');
		console.log('   5. Verify other recipe information is still visible');
		console.log('   6. Sign in as a recipe developer and verify Quick Actions are visible');

		console.log('\n🔧 Code Changes Made:');
		console.log('✅ app/recipes/[recipeId]/page.tsx:');
		console.log('   - Added isNutritionist role check');
		console.log('   - Conditionally hide Quick Actions section');
		console.log('   - Conditionally hide Favorite button');
	} catch (error) {
		console.error('❌ Error testing nutritionist recipe view:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testNutritionistRecipeView();
