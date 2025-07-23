import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickFix() {
	try {
		// Find a nutritionist
		const nutritionist = await prisma.user.findFirst({
			where: {
				role: {
					name: 'Nutritionist',
				},
			},
		});

		if (!nutritionist) {
			console.log('No nutritionist found');
			return;
		}

		// Update all needs_revision recipes that don't have verifiedById
		const result = await prisma.recipe.updateMany({
			where: {
				status: 'needs_revision',
				verifiedById: null,
			},
			data: {
				verifiedById: nutritionist.id,
				verifiedAt: new Date(),
			},
		});

		console.log(`Fixed ${result.count} needs_revision recipes`);
		console.log(`Assigned nutritionist: ${nutritionist.fullName || nutritionist.username}`);
	} catch (error) {
		console.error('Error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

quickFix();
