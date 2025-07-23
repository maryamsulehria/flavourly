import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeed() {
	console.log('Verifying seed data...\n');

	// Check users
	const users = await prisma.user.findMany({
		include: {
			role: true,
		},
	});
	console.log(`✅ Users: ${users.length}`);
	users.forEach(user => {
		console.log(`  - ${user.fullName} (${user.role.name})`);
	});

	// Check recipes
	const recipes = await prisma.recipe.findMany({
		include: {
			author: true,
			verifiedBy: true,
		},
	});
	console.log(`\n✅ Recipes: ${recipes.length}`);
	recipes.forEach(recipe => {
		console.log(`  - ${recipe.title} by ${recipe.author.fullName} (${recipe.status})`);
	});

	// Check ingredients
	const ingredients = await prisma.ingredient.count();
	console.log(`\n✅ Ingredients: ${ingredients}`);

	// Check tags
	const tags = await prisma.tag.count();
	console.log(`✅ Tags: ${tags}`);

	// Check nutritional information
	const nutritionalInfo = await prisma.nutritionalInformation.count();
	console.log(`✅ Nutritional Information: ${nutritionalInfo}`);

	// Check media
	const media = await prisma.media.count();
	console.log(`✅ Media: ${media}`);

	// Check preparation steps
	const steps = await prisma.preparationStep.count();
	console.log(`✅ Preparation Steps: ${steps}`);

	// Check recipe ingredients
	const recipeIngredients = await prisma.recipeIngredient.count();
	console.log(`✅ Recipe Ingredients: ${recipeIngredients}`);

	// Check recipe tags
	const recipeTags = await prisma.recipeTag.count();
	console.log(`✅ Recipe Tags: ${recipeTags}`);

	console.log('\n🎉 Seed verification complete!');
}

verifySeed()
	.catch(e => {
		console.error('Error verifying seed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
