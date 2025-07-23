#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

function disableCloudinary() {
	console.log('🔧 Temporarily disabling Cloudinary uploads...\n');

	// Read current .env.local file
	const envPath = path.join(process.cwd(), '.env.local');
	let envContent = '';

	try {
		envContent = fs.readFileSync(envPath, 'utf8');
	} catch (error) {
		console.log('❌ Could not read .env.local file');
		return;
	}

	// Add a flag to disable Cloudinary
	const disableFlag = '\n# Temporarily disable Cloudinary uploads\nDISABLE_CLOUDINARY=true\n';

	// Check if the flag already exists
	if (!envContent.includes('DISABLE_CLOUDINARY=true')) {
		envContent += disableFlag;
	}

	// Write updated content back to file
	try {
		fs.writeFileSync(envPath, envContent);
		console.log('✅ Cloudinary uploads temporarily disabled!');
		console.log('\n📝 To re-enable:');
		console.log('1. Run: pnpm run setup:cloudinary');
		console.log('2. Or remove the DISABLE_CLOUDINARY=true line from .env.local\n');
	} catch (error) {
		console.log('\n❌ Failed to update .env.local file');
		console.error(error);
	}
}

disableCloudinary();
