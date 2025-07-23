#!/usr/bin/env tsx

import { RoleName } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function testSpecificAuthErrors() {
	console.log('🧪 Testing Specific Authentication Error Messages...\n');

	try {
		// Ensure test users exist
		const testUsers = [
			{
				email: 'test@test.com',
				username: 'testuser',
				fullName: 'Test User',
				password: 'testpass123',
			},
			{
				email: 'existing@test.com',
				username: 'existinguser',
				fullName: 'Existing User',
				password: 'existingpass123',
			},
		];

		for (const userData of testUsers) {
			const existingUser = await prisma.user.findUnique({
				where: { email: userData.email },
			});

			if (!existingUser) {
				console.log(`📝 Creating test user: ${userData.email}`);

				// Get the Recipe Developer role
				const role = await prisma.role.findUnique({
					where: { name: RoleName.RecipeDeveloper },
				});

				if (!role) {
					console.error('❌ Recipe Developer role not found. Please run: pnpm run db:seed');
					process.exit(1);
				}

				// Create test user
				const hashedPassword = await bcrypt.hash(userData.password, 12);
				await prisma.user.create({
					data: {
						email: userData.email,
						username: userData.username,
						fullName: userData.fullName,
						passwordHash: hashedPassword,
						roleId: role.id,
					},
				});
				console.log(`✅ Created test user: ${userData.email} / ${userData.password}`);
			} else {
				console.log(`✅ Test user already exists: ${userData.email} / ${userData.password}`);
			}
		}

		console.log('\n📋 Expected Error Messages:');
		console.log('\n1. **Non-existent email:**');
		console.log('   - Try: nonexistent@test.com / anypassword');
		console.log(
			'   - Expected: "No account found with this email address. Please check your email or create a new account."',
		);

		console.log('\n2. **Wrong password:**');
		console.log('   - Try: test@test.com / wrongpassword');
		console.log('   - Expected: "Incorrect password. Please try again."');

		console.log('\n3. **Empty email:**');
		console.log('   - Try: (empty) / anypassword');
		console.log('   - Expected: "Please enter both email and password."');

		console.log('\n4. **Empty password:**');
		console.log('   - Try: test@test.com / (empty)');
		console.log('   - Expected: "Please enter both email and password."');

		console.log('\n5. **Valid credentials:**');
		console.log('   - Try: test@test.com / testpass123');
		console.log('   - Expected: Successful sign-in and redirect');

		console.log('\n🎯 Testing Instructions:');
		console.log('1. Open your browser and go to http://localhost:3000/signin');
		console.log('2. Try each scenario above');
		console.log('3. Verify that you see the specific error messages instead of "Configuration"');
		console.log('4. Check the browser console for any additional error information');

		console.log('\n🔧 Debug Information:');
		console.log('- The "Configuration" error should no longer appear');
		console.log('- Each error should be specific to the actual problem');
		console.log('- Error messages should be user-friendly and actionable');
	} catch (error) {
		console.error('❌ Error setting up test:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

testSpecificAuthErrors();
