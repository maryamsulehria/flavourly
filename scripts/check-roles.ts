import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRoles() {
	try {
		const roles = await prisma.role.findMany();
		console.log('Current roles in database:');
		roles.forEach(role => {
			console.log(`ID: ${role.id}, Name: ${role.name}`);
		});
	} catch (error) {
		console.error('Error checking roles:', error);
	} finally {
		await prisma.$disconnect();
	}
}

checkRoles();
