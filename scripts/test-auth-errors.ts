#!/usr/bin/env tsx

import { RoleName } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function testAuthErrors() {
	console.log('🧪 Testing authentication error messages...\n');

	try {
		// Check if test user exists
		const existingUser = await prisma.user.findUnique({
			where: { email: 'test@test.com' },
		});

		if (!existingUser) {
			console.log('📝 Creating test user...');

			// Get the Recipe Developer role
			const role = await prisma.role.findUnique({
				where: { name: RoleName.RecipeDeveloper },
			});

			if (!role) {
				console.error('❌ Recipe Developer role not found. Please run: pnpm run db:seed');
				process.exit(1);
			}

			// Create test user
			const hashedPassword = await bcrypt.hash('testpass123', 12);
			await prisma.user.create({
				data: {
					email: 'test@test.com',
					username: 'testuser',
					fullName: 'Test User',
					passwordHash: hashedPassword,
					roleId: role.id,
				},
			});
			console.log('✅ Test user created: test@test.com / testpass123');
		} else {
			console.log('✅ Test user already exists: test@test.com / testpass123');
		}

		console.log('\n📋 Test Cases:');
		console.log('1. ✅ Valid credentials: test@test.com / testpass123');
		console.log('2. ❌ Wrong password: test@test.com / wrongpassword');
		console.log('3. ❌ Non-existent user: nonexistent@test.com / anypassword');
		console.log('4. ❌ Empty email: (empty) / anypassword');
		console.log('5. ❌ Empty password: test@test.com / (empty)');

		console.log('\n🎯 Now test these scenarios in your browser:');
		console.log('   - Go to http://localhost:3000/signin');
		console.log('   - Try the different combinations above');
		console.log('   - You should see specific error messages instead of "Configuration"');
	} catch (error) {
		console.error('❌ Error setting up test:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

testAuthErrors();
