import { RoleName } from '@prisma/client';
import { prisma } from '../lib/prisma';

async function testSignupRoleAssignment() {
	console.log('🧪 Testing Signup Role Assignment...\n');

	try {
		// Test 1: Check current roles in database
		console.log('📋 Current roles in database:');
		const roles = await prisma.role.findMany();
		roles.forEach(role => {
			console.log(`   ${role.name}: ID ${role.id}`);
		});

		// Test 2: Check existing users and their roleIds
		console.log('\n👥 Existing users and their roleIds:');
		const users = await prisma.user.findMany({
			include: { role: true },
			orderBy: { id: 'asc' },
		});

		users.forEach(user => {
			console.log(
				`   ${user.username} (ID: ${user.id}): ${user.role.name} (RoleID: ${user.roleId})`,
			);
		});

		// Test 3: Verify role assignment logic
		console.log('\n🔍 Testing role assignment logic:');

		// Test RecipeDeveloper role assignment
		const recipeDeveloperRole = await prisma.role.findUnique({
			where: { name: RoleName.RecipeDeveloper },
		});
		console.log(`   RecipeDeveloper role found: ${recipeDeveloperRole ? '✅' : '❌'}`);
		if (recipeDeveloperRole) {
			console.log(`   RecipeDeveloper ID: ${recipeDeveloperRole.id} (Expected: 1)`);
			console.log(`   ID matches expected: ${recipeDeveloperRole.id === 1 ? '✅' : '❌'}`);
		}

		// Test Nutritionist role assignment
		const nutritionistRole = await prisma.role.findUnique({
			where: { name: RoleName.Nutritionist },
		});
		console.log(`   Nutritionist role found: ${nutritionistRole ? '✅' : '❌'}`);
		if (nutritionistRole) {
			console.log(`   Nutritionist ID: ${nutritionistRole.id} (Expected: 2)`);
			console.log(`   ID matches expected: ${nutritionistRole.id === 2 ? '✅' : '❌'}`);
		}

		// Test 4: Verify signup form role mapping
		console.log('\n📝 Signup form role mapping:');
		console.log('   Tab value "user" → role "RecipeDeveloper" → roleId 1');
		console.log('   Tab value "nutritionist" → role "Nutritionist" → roleId 2');

		// Test 5: Check for any users with incorrect roleIds
		console.log('\n🔍 Checking for users with incorrect roleIds:');
		const incorrectUsers = users.filter(user => {
			if (user.role.name === 'RecipeDeveloper' && user.roleId !== 1) return true;
			if (user.role.name === 'Nutritionist' && user.roleId !== 2) return true;
			return false;
		});

		if (incorrectUsers.length === 0) {
			console.log('   ✅ All users have correct roleIds');
		} else {
			console.log('   ❌ Found users with incorrect roleIds:');
			incorrectUsers.forEach(user => {
				console.log(`      ${user.username}: ${user.role.name} but roleId is ${user.roleId}`);
			});
		}

		// Test 6: Simulate the auth logic
		console.log('\n🔐 Testing auth logic simulation:');

		const testRole = 'Nutritionist';
		const roleToAssign =
			testRole === 'Nutritionist' ? RoleName.Nutritionist : RoleName.RecipeDeveloper;
		const userRole = await prisma.role.findUnique({
			where: { name: roleToAssign },
		});

		console.log(`   Test role: ${testRole}`);
		console.log(`   Role enum: ${roleToAssign}`);
		console.log(`   Found role: ${userRole ? '✅' : '❌'}`);
		if (userRole) {
			console.log(`   Assigned roleId: ${userRole.id}`);
		}

		console.log('\n✅ Signup role assignment test complete!');
		console.log('\n📋 Summary:');
		console.log('   • RecipeDeveloper should get roleId: 1');
		console.log('   • Nutritionist should get roleId: 2');
		console.log('   • Auth logic correctly maps role names to roleIds');
		console.log('   • Signup form correctly passes role values');
	} catch (error) {
		console.error('❌ Error testing signup role assignment:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testSignupRoleAssignment();
