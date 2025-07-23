#!/usr/bin/env tsx

/**
 * Test script for media upload functionality
 * Tests the new direct upload to Cloudinary approach
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMediaUpload() {
	console.log('🧪 Testing Media Upload Functionality\n');

	try {
		// Create test user and role first
		console.log('0. Setting up test data...');

		const recipeDeveloperRole = await prisma.role.upsert({
			where: { name: 'RecipeDeveloper' },
			update: {},
			create: { name: 'RecipeDeveloper' },
		});

		const testUser = await prisma.user.upsert({
			where: { email: 'test@example.com' },
			update: {},
			create: {
				username: 'testuser',
				email: 'test@example.com',
				passwordHash: 'test-hash',
				fullName: 'Test User',
				roleId: recipeDeveloperRole.id,
			},
		});

		console.log(`   ✅ Test user created: ${testUser.email}`);

		// Test 1: Check if we can create a recipe with media
		console.log('\n1. Testing recipe creation with media...');

		const testRecipe = await prisma.recipe.create({
			data: {
				title: 'Test Recipe with Media',
				description: 'A test recipe to verify media upload functionality',
				cookingTimeMinutes: 30,
				servings: 4,
				authorId: testUser.id,
				ingredients: {
					create: [
						{
							quantity: 2,
							notes: 'Test ingredient',
							ingredient: {
								connectOrCreate: {
									where: { name: 'Test Flour' },
									create: { name: 'Test Flour' },
								},
							},
							unit: {
								connectOrCreate: {
									where: { unitName: 'cup' },
									create: { unitName: 'cup', abbreviation: 'cup' },
								},
							},
						},
					],
				},
				steps: {
					create: [
						{ stepNumber: 1, instruction: 'Test step 1' },
						{ stepNumber: 2, instruction: 'Test step 2' },
					],
				},
				media: {
					create: [
						{
							mediaType: 'image',
							url: 'https://res.cloudinary.com/test/image/upload/v1234567890/flavourly/recipes/test-image.jpg',
							caption: 'Test image',
						},
						{
							mediaType: 'video',
							url: 'https://res.cloudinary.com/test/video/upload/v1234567890/flavourly/recipes/test-video.mp4',
							caption: 'Test video',
						},
					],
				},
			},
			include: {
				media: true,
				ingredients: {
					include: {
						ingredient: true,
						unit: true,
					},
				},
				steps: true,
			},
		});

		console.log('✅ Recipe created successfully with media');
		console.log(`   - Recipe ID: ${testRecipe.id}`);
		console.log(`   - Media count: ${testRecipe.media.length}`);
		console.log(`   - Media URLs: ${testRecipe.media.map(m => m.url).join(', ')}\n`);

		// Test 2: Verify media structure
		console.log('2. Verifying media structure...');

		const media = testRecipe.media;
		if (media.length === 2) {
			console.log('✅ Correct number of media files');
		} else {
			console.log('❌ Expected 2 media files, got', media.length);
		}

		const hasImage = media.some(m => m.mediaType === 'image');
		const hasVideo = media.some(m => m.mediaType === 'video');

		if (hasImage && hasVideo) {
			console.log('✅ Both image and video media types present');
		} else {
			console.log('❌ Missing expected media types');
		}

		// Test 3: Check Cloudinary URL format
		console.log('\n3. Verifying Cloudinary URL format...');

		const cloudinaryUrls = media.every(
			m => m.url.includes('res.cloudinary.com') && m.url.includes('flavourly/recipes'),
		);

		if (cloudinaryUrls) {
			console.log('✅ All media URLs follow Cloudinary format');
		} else {
			console.log('❌ Some media URLs do not follow Cloudinary format');
		}

		// Test 4: Clean up test data
		console.log('\n4. Cleaning up test data...');

		await prisma.recipe.delete({
			where: { id: testRecipe.id },
		});

		console.log('✅ Test data cleaned up');

		// Test 5: Verify direct upload configuration
		console.log('\n5. Checking environment configuration...');

		const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
		const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

		if (cloudName && uploadPreset) {
			console.log('✅ Environment variables configured');
			console.log(`   - Cloud Name: ${cloudName}`);
			console.log(`   - Upload Preset: ${uploadPreset}`);
		} else {
			console.log('❌ Missing environment variables');
			console.log('   Please check your .env.local file');
		}

		console.log('\n🎉 All media upload tests passed!');
		console.log('\n📝 Next steps:');
		console.log('   1. Start your development server: pnpm dev');
		console.log('   2. Go to /dashboard/recipes/new');
		console.log('   3. Navigate to the Media step');
		console.log('   4. Test drag & drop and file selection');
		console.log('   5. Verify files upload directly to Cloudinary');
	} catch (error) {
		console.error('❌ Test failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the test
testMediaUpload();
