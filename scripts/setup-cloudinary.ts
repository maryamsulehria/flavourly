#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function question(prompt: string): Promise<string> {
	return new Promise(resolve => {
		rl.question(prompt, resolve);
	});
}

async function setupCloudinary() {
	console.log('🌤️  Cloudinary Setup for Flavourly\n');
	console.log('This script will help you configure Cloudinary for media uploads.\n');

	console.log('📋 Prerequisites:');
	console.log('1. Create a free account at https://cloudinary.com/');
	console.log('2. Get your credentials from the Cloudinary dashboard\n');

	console.log("🔑 You'll need these from your Cloudinary dashboard:");
	console.log('- Cloud Name (found in dashboard overview)');
	console.log('- API Key (found in dashboard overview)');
	console.log('- API Secret (found in dashboard overview)\n');

	const cloudName = await question('Enter your Cloudinary Cloud Name: ');
	const apiKey = await question('Enter your Cloudinary API Key: ');
	const apiSecret = await question('Enter your Cloudinary API Secret: ');

	if (!cloudName || !apiKey || !apiSecret) {
		console.log('\n❌ All fields are required. Please run the script again.');
		rl.close();
		return;
	}

	// Read current .env.local file
	const envPath = path.join(process.cwd(), '.env.local');
	let envContent = '';

	try {
		envContent = fs.readFileSync(envPath, 'utf8');
	} catch (error) {
		console.log('❌ Could not read .env.local file');
		rl.close();
		return;
	}

	// Update Cloudinary variables
	const updatedContent = envContent
		.replace(/CLOUDINARY_CLOUD_NAME=.*/g, `CLOUDINARY_CLOUD_NAME=${cloudName}`)
		.replace(/CLOUDINARY_API_KEY=.*/g, `CLOUDINARY_API_KEY=${apiKey}`)
		.replace(/CLOUDINARY_API_SECRET=.*/g, `CLOUDINARY_API_SECRET=${apiSecret}`)
		.replace(
			/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=.*/g,
			`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${cloudName}`,
		);

	// Write updated content back to file
	try {
		fs.writeFileSync(envPath, updatedContent);
		console.log('\n✅ Cloudinary configuration updated successfully!');
		console.log('\n📝 Next steps:');
		console.log('1. Restart your development server');
		console.log('2. Try uploading a profile picture or recipe media');
		console.log('3. Check that uploads work correctly\n');
	} catch (error) {
		console.log('\n❌ Failed to update .env.local file');
		console.error(error);
	}

	rl.close();
}

setupCloudinary().catch(console.error);
