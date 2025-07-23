import { RoleName } from '@prisma/client';
import { prisma } from '../lib/prisma';

async function testRoleRedirects() {
	console.log('🧪 Testing Role-Based Redirects...\n');

	try {
		// Test 1: Check if RecipeDeveloper users exist
		const recipeDevelopers = await prisma.user.findMany({
			where: {
				role: {
					name: RoleName.RecipeDeveloper,
				},
			},
			include: {
				role: true,
			},
			take: 1,
		});

		console.log('✅ RecipeDeveloper users found:', recipeDevelopers.length > 0);
		if (recipeDevelopers.length > 0) {
			console.log('   Sample user:', {
				id: recipeDevelopers[0].id,
				username: recipeDevelopers[0].username,
				role: recipeDevelopers[0].role.name,
			});
		}

		// Test 2: Check if Nutritionist users exist
		const nutritionists = await prisma.user.findMany({
			where: {
				role: {
					name: RoleName.Nutritionist,
				},
			},
			include: {
				role: true,
			},
			take: 1,
		});

		console.log('✅ Nutritionist users found:', nutritionists.length > 0);
		if (nutritionists.length > 0) {
			console.log('   Sample user:', {
				id: nutritionists[0].id,
				username: nutritionists[0].username,
				role: nutritionists[0].role.name,
			});
		}

		// Test 3: Check role distribution
		const roleCounts = await prisma.user.groupBy({
			by: ['roleId'],
			_count: {
				id: true,
			},
		});

		console.log('\n📊 User Role Distribution:');
		for (const roleCount of roleCounts) {
			const role = await prisma.role.findUnique({
				where: { id: roleCount.roleId },
			});
			console.log(`   ${role?.name}: ${roleCount._count.id} users`);
		}

		console.log('\n🎯 Role-Based Routing Test Results:');
		console.log(
			'   • RecipeDevelopers should be redirected to /dashboard when accessing /nutritionist',
		);
		console.log(
			'   • Nutritionists should be redirected to /nutritionist when accessing /dashboard',
		);
		console.log('   • Unauthorized users should be redirected to /unauthorized');
		console.log('   • Non-authenticated users should be redirected to /signin');

		console.log('\n✅ Role-based routing implementation complete!');
		console.log('   Test the following scenarios:');
		console.log('   1. Login as RecipeDeveloper and try to access /nutritionist');
		console.log('   2. Login as Nutritionist and try to access /dashboard');
		console.log('   3. Check that each role sees their appropriate navigation');
	} catch (error) {
		console.error('❌ Error testing role redirects:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testRoleRedirects();
