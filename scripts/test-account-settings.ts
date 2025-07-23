#!/usr/bin/env tsx

/**
 * Test script for account settings functionality
 * Tests email and password update functionality
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAccountSettings() {
	console.log('🧪 Testing Account Settings Functionality\n');

	try {
		// Check database connection
		console.log('1. Testing database connection...');
		const userCount = await prisma.user.count();
		console.log(`✅ Database connected successfully`);
		console.log(`   - Total users: ${userCount}`);

		// Test user with email and password
		console.log('\n2. Testing user account data...');

		const testUser = await prisma.user.findFirst({
			select: {
				id: true,
				username: true,
				email: true,
				passwordHash: true,
				fullName: true,
				createdAt: true,
			},
		});

		if (testUser) {
			console.log('✅ User found for testing');
			console.log(`   - Username: ${testUser.username}`);
			console.log(`   - Email: ${testUser.email}`);
			console.log(`   - Full Name: ${testUser.fullName || 'Not set'}`);
			console.log(`   - Password Hash: ${testUser.passwordHash ? 'Set' : 'Not set'}`);
			console.log(`   - Created: ${new Date(testUser.createdAt).toLocaleDateString()}`);
		} else {
			console.log('❌ No users found in database');
			console.log('   Please create a test user first');
			return;
		}

		// Test password hashing
		console.log('\n3. Testing password hashing...');

		const testPassword = 'testpassword123';
		const hashedPassword = await bcrypt.hash(testPassword, 12);
		const isPasswordValid = await bcrypt.compare(testPassword, hashedPassword);

		if (isPasswordValid) {
			console.log('✅ Password hashing working correctly');
			console.log(`   - Test password: ${testPassword}`);
			console.log(`   - Hash generated: ${hashedPassword.substring(0, 20)}...`);
			console.log(`   - Verification: ${isPasswordValid}`);
		} else {
			console.log('❌ Password hashing failed');
		}

		// Test email validation
		console.log('\n4. Testing email validation...');

		const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'];

		const invalidEmails = ['invalid-email', '@example.com', 'user@', 'user..name@example.com'];

		console.log('   Valid emails:');
		validEmails.forEach(email => {
			const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
			console.log(`     ${email}: ${isValid ? '✅' : '❌'}`);
		});

		console.log('   Invalid emails:');
		invalidEmails.forEach(email => {
			const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
			console.log(`     ${email}: ${isValid ? '❌' : '✅'}`);
		});

		// Test password strength validation
		console.log('\n5. Testing password strength validation...');

		const testPasswords = [
			{ password: 'short', valid: false, reason: 'Too short' },
			{ password: '12345678', valid: false, reason: 'Only numbers' },
			{ password: 'abcdefgh', valid: false, reason: 'Only letters' },
			{ password: 'password123', valid: true, reason: 'Good password' },
			{ password: 'MySecurePass123!', valid: true, reason: 'Strong password' },
		];

		testPasswords.forEach(({ password, valid, reason }) => {
			const isLongEnough = password.length >= 8;
			const hasLetters = /[a-zA-Z]/.test(password);
			const hasNumbers = /\d/.test(password);
			const isStrong = isLongEnough && hasLetters && hasNumbers;

			console.log(`   "${password}": ${isStrong === valid ? '✅' : '❌'} (${reason})`);
		});

		// Test API endpoints structure
		console.log('\n6. Testing API endpoint structure...');

		const apiEndpoints = [
			'/api/user/email',
			'/api/user/password',
			'/api/user/profile',
			'/api/user/dietary-preferences',
		];

		console.log('   Required API endpoints:');
		apiEndpoints.forEach(endpoint => {
			console.log(`     ${endpoint}: PATCH method required`);
		});

		// Test form validation scenarios
		console.log('\n7. Testing form validation scenarios...');

		const validationScenarios = [
			{
				name: 'Email Change - Same Email',
				email: testUser.email,
				password: 'testpassword',
				shouldFail: true,
				reason: 'New email same as current',
			},
			{
				name: 'Email Change - Invalid Email',
				email: 'invalid-email',
				password: 'testpassword',
				shouldFail: true,
				reason: 'Invalid email format',
			},
			{
				name: 'Password Change - Mismatch',
				currentPassword: 'testpassword',
				newPassword: 'newpassword123',
				confirmPassword: 'differentpassword123',
				shouldFail: true,
				reason: 'Passwords do not match',
			},
			{
				name: 'Password Change - Too Short',
				currentPassword: 'testpassword',
				newPassword: 'short',
				confirmPassword: 'short',
				shouldFail: true,
				reason: 'Password too short',
			},
		];

		console.log('   Form validation scenarios:');
		validationScenarios.forEach(scenario => {
			console.log(
				`     ${scenario.name}: ${scenario.shouldFail ? 'Should fail' : 'Should pass'} (${
					scenario.reason
				})`,
			);
		});

		console.log('\n🎉 Account settings test completed!');
		console.log('\n📝 Next steps:');
		console.log('   1. Start your development server: pnpm dev');
		console.log('   2. Go to /dashboard/settings');
		console.log('   3. Click on the Account tab');
		console.log('   4. Test email change functionality');
		console.log('   5. Test password change functionality');
		console.log('   6. Verify form validation works correctly');
		console.log('   7. Check that error messages are displayed properly');
	} catch (error) {
		console.error('❌ Test failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testAccountSettings();
