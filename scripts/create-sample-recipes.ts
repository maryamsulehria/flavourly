import { VerificationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

async function createSampleRecipes() {
	console.log('🍳 Creating sample recipes for testing...\n');

	try {
		// Get the test user (Recipe Developer)
		const testUser = await prisma.user.findUnique({
			where: { username: 'test' },
		});

		if (!testUser) {
			console.log('❌ Test user not found. Please create a user first.');
			return;
		}

		// Get the nutritionist user
		const nutritionist = await prisma.user.findUnique({
			where: { username: 'ammar' },
		});

		if (!nutritionist) {
			console.log('❌ Nutritionist user not found. Please create a nutritionist first.');
			return;
		}

		// Create sample recipes
		const sampleRecipes = [
			{
				title: 'Classic Margherita Pizza',
				description: 'A traditional Italian pizza with fresh mozzarella, basil, and tomato sauce.',
				cookingTimeMinutes: 25,
				servings: 4,
				status: VerificationStatus.verified,
				verifiedAt: new Date(),
				verifiedById: nutritionist.id,
				healthTips:
					'Use whole wheat crust for added fiber and choose low-fat mozzarella for a healthier option.',
			},
			{
				title: 'Chocolate Chip Cookies',
				description: 'Soft and chewy chocolate chip cookies with a golden brown exterior.',
				cookingTimeMinutes: 15,
				servings: 24,
				status: VerificationStatus.pending_verification,
			},
			{
				title: 'Grilled Chicken Salad',
				description:
					'Fresh mixed greens with grilled chicken breast, cherry tomatoes, and balsamic vinaigrette.',
				cookingTimeMinutes: 20,
				servings: 2,
				status: VerificationStatus.needs_revision,
				healthTips:
					'Consider adding more vegetables and reducing the dressing amount for a healthier meal.',
			},
			{
				title: 'Spaghetti Carbonara',
				description: 'Creamy pasta dish with eggs, cheese, pancetta, and black pepper.',
				cookingTimeMinutes: 30,
				servings: 4,
				status: VerificationStatus.verified,
				verifiedAt: new Date(),
				verifiedById: nutritionist.id,
				healthTips: 'Use whole grain pasta and turkey bacon as healthier alternatives.',
			},
			{
				title: 'Vegetable Stir Fry',
				description: 'Quick and healthy stir-fried vegetables with soy sauce and ginger.',
				cookingTimeMinutes: 15,
				servings: 3,
				status: VerificationStatus.pending_verification,
			},
		];

		console.log('📝 Creating recipes...');
		const createdRecipes = [];

		for (const recipeData of sampleRecipes) {
			const recipe = await prisma.recipe.create({
				data: {
					...recipeData,
					authorId: testUser.id,
				},
				include: {
					author: true,
					verifiedBy: true,
				},
			});

			createdRecipes.push(recipe);
			console.log(`  ✅ Created: "${recipe.title}" - Status: ${recipe.status}`);
		}

		// Add some nutritional information
		console.log('\n🥗 Adding nutritional information...');
		for (const recipe of createdRecipes) {
			if (recipe.status === 'verified') {
				await prisma.nutritionalInformation.create({
					data: {
						recipeId: recipe.id,
						calories: Math.floor(Math.random() * 400) + 200, // 200-600 calories
						proteinGrams: Math.floor(Math.random() * 30) + 10, // 10-40g protein
						carbohydratesGrams: Math.floor(Math.random() * 50) + 20, // 20-70g carbs
						fatGrams: Math.floor(Math.random() * 20) + 5, // 5-25g fat
						dataSource: 'verified_nutritionist',
					},
				});
				console.log(`  ✅ Added nutrition info for: "${recipe.title}"`);
			}
		}

		// Add some reviews
		console.log('\n⭐ Adding sample reviews...');
		const reviewRecipes = createdRecipes.slice(0, 3); // Add reviews to first 3 recipes
		for (const recipe of reviewRecipes) {
			await prisma.review.create({
				data: {
					recipeId: recipe.id,
					userId: testUser.id,
					rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
					comment: 'Great recipe! Will definitely make again.',
				},
			});
			console.log(`  ✅ Added review for: "${recipe.title}"`);
		}

		console.log('\n🎉 Sample recipes created successfully!');
		console.log('\n📊 Summary:');
		console.log(`  - Total recipes: ${createdRecipes.length}`);
		console.log(`  - Verified: ${createdRecipes.filter(r => r.status === 'verified').length}`);
		console.log(
			`  - Pending: ${createdRecipes.filter(r => r.status === 'pending_verification').length}`,
		);
		console.log(
			`  - Needs revision: ${createdRecipes.filter(r => r.status === 'needs_revision').length}`,
		);

		console.log('\n🔗 You can now test the dashboard:');
		console.log('1. Start the dev server: pnpm dev');
		console.log('2. Sign in as "test" user');
		console.log('3. Navigate to /dashboard');
		console.log('4. You should see all the sample recipes with proper status indicators');
	} catch (error) {
		console.error('❌ Error creating sample recipes:', error);
	} finally {
		await prisma.$disconnect();
	}
}

createSampleRecipes();
