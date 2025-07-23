import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixNeedsRevisionRecipes() {
	try {
		console.log('🔧 Fixing needs_revision recipes...\n');

		// Find all needs_revision recipes that don't have verifiedBy data
		const needsRevisionRecipes = await prisma.recipe.findMany({
			where: {
				status: 'needs_revision',
				verifiedById: null,
			},
			include: {
				author: {
					select: {
						id: true,
						username: true,
						fullName: true,
					},
				},
			},
		});

		console.log(
			`📊 Found ${needsRevisionRecipes.length} needs_revision recipes without verifiedBy data:\n`,
		);

		if (needsRevisionRecipes.length === 0) {
			console.log('✅ All needs_revision recipes already have verifiedBy data!');
			return;
		}

		// Find a nutritionist to assign as the reviewer
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
			},
		});

		if (!nutritionist) {
			console.log('❌ No nutritionist found in the database');
			return;
		}

		console.log(
			`👨‍⚕️ Using nutritionist: ${nutritionist.fullName || nutritionist.username} (ID: ${
				nutritionist.id
			})\n`,
		);

		// Update each recipe to have the nutritionist as verifiedBy
		for (const recipe of needsRevisionRecipes) {
			console.log(`🔧 Updating recipe: "${recipe.title}" (ID: ${recipe.id})`);

			await prisma.recipe.update({
				where: { id: recipe.id },
				data: {
					verifiedById: nutritionist.id,
					verifiedAt: new Date(),
				},
			});

			console.log(`   ✅ Updated verifiedById to ${nutritionist.id}`);
		}

		console.log('\n🎉 Successfully updated all needs_revision recipes!');

		// Verify the fix
		const updatedRecipes = await prisma.recipe.findMany({
			where: {
				status: 'needs_revision',
			},
			include: {
				verifiedBy: {
					select: {
						id: true,
						username: true,
						fullName: true,
					},
				},
			},
		});

		console.log('\n📋 Verification - All needs_revision recipes now have verifiedBy data:');
		updatedRecipes.forEach((recipe, index) => {
			console.log(
				`${index + 1}. "${recipe.title}" - Verified by: ${
					recipe.verifiedBy?.fullName || recipe.verifiedBy?.username
				}`,
			);
		});
	} catch (error) {
		console.error('❌ Error fixing recipes:', error);
	} finally {
		await prisma.$disconnect();
	}
}

fixNeedsRevisionRecipes();
