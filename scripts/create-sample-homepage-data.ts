import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleHomepageData() {
	try {
		console.log('Creating sample homepage data...');

		// Get or create roles first
		const recipeDeveloperRole = await prisma.role.findUnique({
			where: { name: 'RecipeDeveloper' },
		});

		const nutritionistRole = await prisma.role.findUnique({
			where: { name: 'Nutritionist' },
		});

		if (!recipeDeveloperRole || !nutritionistRole) {
			throw new Error('Required roles not found. Please run the seed script first.');
		}

		// Create sample users if they don't exist
		const recipeDeveloper = await prisma.user.upsert({
			where: { email: 'developer@flavourly.com' },
			update: {},
			create: {
				username: 'recipe_developer',
				email: 'developer@flavourly.com',
				passwordHash: 'dummy_hash',
				fullName: 'Recipe Developer',
				bio: 'Passionate home cook who loves creating delicious recipes',
				roleId: recipeDeveloperRole.id,
			},
		});

		const nutritionist = await prisma.user.upsert({
			where: { email: 'nutritionist@flavourly.com' },
			update: {},
			create: {
				username: 'nutritionist_expert',
				email: 'nutritionist@flavourly.com',
				passwordHash: 'dummy_hash',
				fullName: 'Dr. Sarah Johnson',
				bio: 'Certified nutritionist with 10+ years of experience',
				roleId: nutritionistRole.id,
			},
		});

		// Create sample ingredients
		const ingredients = [
			{ name: 'chicken breast', unit: 'pieces' },
			{ name: 'olive oil', unit: 'tablespoons' },
			{ name: 'garlic', unit: 'cloves' },
			{ name: 'onion', unit: 'medium' },
			{ name: 'tomatoes', unit: 'pieces' },
			{ name: 'basil', unit: 'cups' },
			{ name: 'mozzarella cheese', unit: 'cups' },
			{ name: 'pasta', unit: 'cups' },
			{ name: 'salmon fillet', unit: 'pieces' },
			{ name: 'lemon', unit: 'pieces' },
			{ name: 'quinoa', unit: 'cups' },
			{ name: 'avocado', unit: 'pieces' },
		];

		for (const ing of ingredients) {
			await prisma.ingredient.upsert({
				where: { name: ing.name },
				update: {},
				create: { name: ing.name },
			});

			await prisma.measurementUnit.upsert({
				where: { unitName: ing.unit },
				update: {},
				create: { unitName: ing.unit },
			});
		}

		// Create sample recipes
		const sampleRecipes = [
			{
				title: 'Grilled Chicken with Mediterranean Vegetables',
				description:
					'A healthy and flavorful grilled chicken dish with fresh Mediterranean vegetables. Perfect for a light dinner or lunch.',
				cookingTimeMinutes: 35,
				servings: 4,
				status: 'verified' as const,
				verifiedAt: new Date(),
				healthTips:
					'This recipe is high in protein and low in carbs, making it perfect for a healthy diet.',
				ingredients: [
					{ name: 'chicken breast', quantity: 4, unit: 'pieces', notes: 'boneless, skinless' },
					{ name: 'olive oil', quantity: 3, unit: 'tablespoons' },
					{ name: 'garlic', quantity: 4, unit: 'cloves', notes: 'minced' },
					{ name: 'tomatoes', quantity: 6, unit: 'pieces', notes: 'cherry tomatoes' },
				],
				steps: [
					'Preheat grill to medium-high heat',
					'Season chicken breasts with salt and pepper',
					'Brush chicken with olive oil and minced garlic',
					'Grill chicken for 6-8 minutes per side until cooked through',
					'Add cherry tomatoes to grill for the last 2 minutes',
					'Serve hot with fresh basil garnish',
				],
				nutritionalInfo: {
					calories: 320,
					proteinGrams: 35,
					carbohydratesGrams: 8,
					fatGrams: 18,
					fiberGrams: 3,
					sugarGrams: 4,
					sodiumMg: 450,
					dataSource: 'verified_nutritionist' as const,
				},
			},
			{
				title: 'Creamy Avocado Pasta',
				description:
					'A delicious and creamy pasta dish made with fresh avocados, perfect for a quick vegetarian meal.',
				cookingTimeMinutes: 20,
				servings: 2,
				status: 'verified' as const,
				verifiedAt: new Date(),
				healthTips:
					'Avocados provide healthy fats and fiber. This dish is naturally vegetarian and can be made vegan.',
				ingredients: [
					{ name: 'pasta', quantity: 8, unit: 'cups', notes: 'cooked' },
					{ name: 'avocado', quantity: 2, unit: 'pieces', notes: 'ripe' },
					{ name: 'garlic', quantity: 2, unit: 'cloves', notes: 'minced' },
					{ name: 'olive oil', quantity: 2, unit: 'tablespoons' },
					{ name: 'lemon', quantity: 1, unit: 'pieces', notes: 'juiced' },
				],
				steps: [
					'Cook pasta according to package directions',
					'Mash avocados in a large bowl',
					'Add minced garlic, olive oil, and lemon juice to avocados',
					'Mix until creamy and well combined',
					'Toss hot pasta with avocado mixture',
					'Season with salt and pepper to taste',
				],
				nutritionalInfo: {
					calories: 480,
					proteinGrams: 12,
					carbohydratesGrams: 65,
					fatGrams: 22,
					fiberGrams: 8,
					sugarGrams: 3,
					sodiumMg: 320,
					dataSource: 'verified_nutritionist' as const,
				},
			},
			{
				title: 'Lemon Herb Salmon with Quinoa',
				description:
					'A light and healthy salmon dish with fluffy quinoa and fresh herbs. Packed with omega-3 fatty acids.',
				cookingTimeMinutes: 25,
				servings: 2,
				status: 'verified' as const,
				verifiedAt: new Date(),
				healthTips:
					'Salmon is rich in omega-3 fatty acids which are great for heart health. Quinoa provides complete protein.',
				ingredients: [
					{ name: 'salmon fillet', quantity: 2, unit: 'pieces', notes: '6 oz each' },
					{ name: 'quinoa', quantity: 1, unit: 'cups', notes: 'uncooked' },
					{ name: 'lemon', quantity: 2, unit: 'pieces', notes: 'zested and juiced' },
					{ name: 'olive oil', quantity: 2, unit: 'tablespoons' },
					{ name: 'garlic', quantity: 2, unit: 'cloves', notes: 'minced' },
				],
				steps: [
					'Cook quinoa according to package directions',
					'Preheat oven to 400°F (200°C)',
					'Place salmon on a baking sheet lined with parchment paper',
					'Drizzle with olive oil, lemon juice, and minced garlic',
					'Bake for 12-15 minutes until salmon flakes easily',
					'Serve over quinoa with lemon zest garnish',
				],
				nutritionalInfo: {
					calories: 420,
					proteinGrams: 38,
					carbohydratesGrams: 25,
					fatGrams: 18,
					fiberGrams: 4,
					sugarGrams: 2,
					sodiumMg: 380,
					dataSource: 'verified_nutritionist' as const,
				},
			},
		];

		for (const recipeData of sampleRecipes) {
			// Create the recipe
			const recipe = await prisma.recipe.create({
				data: {
					title: recipeData.title,
					description: recipeData.description,
					cookingTimeMinutes: recipeData.cookingTimeMinutes,
					servings: recipeData.servings,
					status: recipeData.status,
					verifiedAt: recipeData.verifiedAt,
					healthTips: recipeData.healthTips,
					authorId: recipeDeveloper.id,
					verifiedById: nutritionist.id,
				},
			});

			// Create ingredients
			for (const ing of recipeData.ingredients) {
				const ingredient = await prisma.ingredient.findUnique({
					where: { name: ing.name },
				});

				const unit = await prisma.measurementUnit.findUnique({
					where: { unitName: ing.unit },
				});

				if (ingredient && unit) {
					await prisma.recipeIngredient.create({
						data: {
							recipeId: recipe.id,
							ingredientId: ingredient.id,
							unitId: unit.id,
							quantity: ing.quantity,
							notes: ing.notes,
						},
					});
				}
			}

			// Create steps
			for (let i = 0; i < recipeData.steps.length; i++) {
				await prisma.preparationStep.create({
					data: {
						recipeId: recipe.id,
						stepNumber: i + 1,
						instruction: recipeData.steps[i],
					},
				});
			}

			// Create nutritional information
			await prisma.nutritionalInformation.create({
				data: {
					recipeId: recipe.id,
					calories: recipeData.nutritionalInfo.calories,
					proteinGrams: recipeData.nutritionalInfo.proteinGrams,
					carbohydratesGrams: recipeData.nutritionalInfo.carbohydratesGrams,
					fatGrams: recipeData.nutritionalInfo.fatGrams,
					fiberGrams: recipeData.nutritionalInfo.fiberGrams,
					sugarGrams: recipeData.nutritionalInfo.sugarGrams,
					sodiumMg: recipeData.nutritionalInfo.sodiumMg,
					dataSource: recipeData.nutritionalInfo.dataSource,
				},
			});

			// Add some reviews and favorites to make recipes popular
			for (let i = 0; i < 3; i++) {
				await prisma.review.create({
					data: {
						recipeId: recipe.id,
						userId: recipeDeveloper.id,
						rating: 4 + Math.floor(Math.random() * 2), // 4-5 stars
						comment: 'Delicious recipe! Highly recommend.',
					},
				});

				await prisma.favoriteRecipe.create({
					data: {
						recipeId: recipe.id,
						userId: recipeDeveloper.id,
					},
				});
			}
		}

		console.log('Sample homepage data created successfully!');
		console.log(`Created ${sampleRecipes.length} verified recipes`);
		console.log('You can now test the homepage with real data');
	} catch (error) {
		console.error('Error creating sample data:', error);
	} finally {
		await prisma.$disconnect();
	}
}

createSampleHomepageData();
