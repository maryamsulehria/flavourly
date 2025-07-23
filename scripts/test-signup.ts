import { PrismaClient, RoleName } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testSignup() {
	try {
		console.log('Testing signup process...\n');

		// Test Recipe Developer signup
		console.log('1. Testing Recipe Developer signup:');
		const recipeDevRole = await prisma.role.findUnique({
			where: { name: RoleName.RecipeDeveloper },
		});
		console.log('Found RecipeDeveloper role:', recipeDevRole);

		// Test Nutritionist signup
		console.log('\n2. Testing Nutritionist signup:');
		const nutritionistRole = await prisma.role.findUnique({
			where: { name: RoleName.Nutritionist },
		});
		console.log('Found Nutritionist role:', nutritionistRole);

		// Test creating users with different roles
		const hashedPassword = await bcrypt.hash('password123', 12);

		// Create Recipe Developer
		const recipeDev = await prisma.user.create({
			data: {
				email: 'test.recipe@example.com',
				username: 'test_recipe_dev',
				fullName: 'Test Recipe Developer',
				passwordHash: hashedPassword,
				roleId: recipeDevRole!.id,
			},
			include: { role: true },
		});
		console.log('Created Recipe Developer:', {
			id: recipeDev.id,
			role: recipeDev.role.name,
			roleId: recipeDev.roleId,
		});

		// Create Nutritionist
		const nutritionist = await prisma.user.create({
			data: {
				email: 'test.nutritionist@example.com',
				username: 'test_nutritionist',
				fullName: 'Test Nutritionist',
				passwordHash: hashedPassword,
				roleId: nutritionistRole!.id,
			},
			include: { role: true },
		});
		console.log('Created Nutritionist:', {
			id: nutritionist.id,
			role: nutritionist.role.name,
			roleId: nutritionist.roleId,
		});

		// Clean up test users
		await prisma.user.deleteMany({
			where: {
				email: { in: ['test.recipe@example.com', 'test.nutritionist@example.com'] },
			},
		});
		console.log('\nTest users cleaned up successfully!');
	} catch (error) {
		console.error('Error testing signup:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testSignup();
