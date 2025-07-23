import { RoleName } from '@prisma/client';
import { prisma } from './prisma';

export async function seedRoles() {
	try {
		// Check if roles already exist
		const existingRoles = await prisma.role.findMany();

		if (existingRoles.length > 0) {
			console.log('Roles already exist in the database');
			return;
		}

		// Create all roles
		const roles = [{ name: RoleName.RecipeDeveloper }, { name: RoleName.Nutritionist }];

		for (const role of roles) {
			await prisma.role.create({
				data: role,
			});
		}

		console.log('Roles seeded successfully');
	} catch (error) {
		console.error('Error seeding roles:', error);
		throw error;
	}
}

// Helper function to get a user's role
export async function getUserRole(userId: number) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: { role: true },
		});

		return user?.role || null;
	} catch (error) {
		console.error('Error getting user role:', error);
		return null;
	}
}

// Helper function to check if user has specific role
export function hasRole(userRole: RoleName, requiredRole: RoleName): boolean {
	const roleHierarchy: Record<RoleName, number> = {
		[RoleName.RecipeDeveloper]: 1,
		[RoleName.Nutritionist]: 2,
	};

	return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
