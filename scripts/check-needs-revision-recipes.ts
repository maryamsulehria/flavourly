import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNeedsRevisionRecipes() {
	try {
		console.log('🔍 Checking needs_revision recipes...\n');

		const needsRevisionRecipes = await prisma.recipe.findMany({
			where: {
				status: 'needs_revision',
			},
			include: {
				verifiedBy: {
					select: {
						id: true,
						username: true,
						fullName: true,
						profilePicture: true,
					},
				},
				author: {
					select: {
						id: true,
						username: true,
						fullName: true,
					},
				},
			},
		});

		console.log(`📊 Found ${needsRevisionRecipes.length} needs_revision recipes:\n`);

		needsRevisionRecipes.forEach((recipe, index) => {
			console.log(`${index + 1}. Recipe: "${recipe.title}"`);
			console.log(`   ID: ${recipe.id}`);
			console.log(`   Author: ${recipe.author.fullName || recipe.author.username}`);
			console.log(`   Status: ${recipe.status}`);
			console.log(`   verifiedById: ${recipe.verifiedById}`);

			if (recipe.verifiedBy) {
				console.log(
					`   ✅ Verified By: ${recipe.verifiedBy.fullName || recipe.verifiedBy.username} (ID: ${
						recipe.verifiedBy.id
					})`,
				);
			} else {
				console.log(`   ❌ No verifiedBy data found`);
			}
			console.log('');
		});

		// Also check verified recipes for comparison
		const verifiedRecipes = await prisma.recipe.findMany({
			where: {
				status: 'verified',
			},
			include: {
				verifiedBy: {
					select: {
						id: true,
						username: true,
						fullName: true,
						profilePicture: true,
					},
				},
			},
		});

		console.log(`📊 Found ${verifiedRecipes.length} verified recipes:\n`);

		verifiedRecipes.forEach((recipe, index) => {
			console.log(`${index + 1}. Recipe: "${recipe.title}"`);
			console.log(`   ID: ${recipe.id}`);
			console.log(`   Status: ${recipe.status}`);
			console.log(`   verifiedById: ${recipe.verifiedById}`);

			if (recipe.verifiedBy) {
				console.log(
					`   ✅ Verified By: ${recipe.verifiedBy.fullName || recipe.verifiedBy.username} (ID: ${
						recipe.verifiedBy.id
					})`,
				);
			} else {
				console.log(`   ❌ No verifiedBy data found`);
			}
			console.log('');
		});
	} catch (error) {
		console.error('❌ Error checking recipes:', error);
	} finally {
		await prisma.$disconnect();
	}
}

checkNeedsRevisionRecipes();
