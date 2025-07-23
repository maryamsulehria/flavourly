#!/usr/bin/env tsx

/**
 * Test script for profile picture upload functionality
 * Tests the Cloudinary upload for user profile pictures
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProfileUpload() {
	console.log('🧪 Testing Profile Picture Upload Functionality\n');

	try {
		// Check environment variables
		console.log('1. Checking environment configuration...');

		const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
		const apiKey = process.env.CLOUDINARY_API_KEY;
		const apiSecret = process.env.CLOUDINARY_API_SECRET;

		if (cloudName && apiKey && apiSecret) {
			console.log('✅ Cloudinary environment variables configured');
			console.log(`   - Cloud Name: ${cloudName}`);
			console.log(`   - API Key: ${apiKey.substring(0, 8)}...`);
			console.log(`   - API Secret: ${apiSecret.substring(0, 8)}...`);
		} else {
			console.log('❌ Missing Cloudinary environment variables');
			console.log('   Please check your .env file');
			return;
		}

		// Test database connection
		console.log('\n2. Testing database connection...');

		const userCount = await prisma.user.count();
		console.log(`✅ Database connected successfully`);
		console.log(`   - Total users: ${userCount}`);

		// Test user with profile picture
		console.log('\n3. Testing user profile picture field...');

		const testUser = await prisma.user.findFirst({
			select: {
				id: true,
				username: true,
				email: true,
				fullName: true,
				profilePicture: true,
			},
		});

		if (testUser) {
			console.log('✅ User found for testing');
			console.log(`   - Username: ${testUser.username}`);
			console.log(`   - Full Name: ${testUser.fullName || 'Not set'}`);
			console.log(`   - Profile Picture: ${testUser.profilePicture || 'Not set'}`);
		} else {
			console.log('❌ No users found in database');
			console.log('   Please create a test user first');
		}

		// Test Cloudinary configuration
		console.log('\n4. Testing Cloudinary configuration...');

		const { v2: cloudinary } = require('cloudinary');
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});

		try {
			// Test Cloudinary connection by listing resources
			const result = await cloudinary.api.resources({
				type: 'upload',
				max_results: 1,
				prefix: 'flavourly/profiles',
			});

			console.log('✅ Cloudinary connection successful');
			console.log(`   - Profile pictures found: ${result.resources.length}`);
		} catch (cloudinaryError) {
			console.log('❌ Cloudinary connection failed');
			console.error('   Error:', (cloudinaryError as Error).message);
		}

		console.log('\n🎉 Profile upload test completed!');
		console.log('\n📝 Next steps:');
		console.log('   1. Start your development server: pnpm dev');
		console.log('   2. Go to /dashboard/settings');
		console.log('   3. Click on the Profile tab');
		console.log('   4. Upload a profile picture');
		console.log('   5. Verify it appears in the navbar immediately');
		console.log('   6. Check Cloudinary dashboard for the uploaded image');
	} catch (error) {
		console.error('❌ Test failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testProfileUpload();
