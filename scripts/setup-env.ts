#!/usr/bin/env tsx

import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🔧 Setting up environment variables for Flavourly...\n');

const envPath = join(process.cwd(), '.env.local');
const envContent = `# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flavourly"

# Cloudinary (for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=flavourly_uploads
`;

if (existsSync(envPath)) {
	console.log('⚠️  .env.local already exists. Skipping creation.');
	console.log('   Please check that your environment variables are properly configured.');
} else {
	try {
		writeFileSync(envPath, envContent, 'utf8');
		console.log('✅ Created .env.local file');
		console.log('📝 Please update the following variables:');
		console.log('   - NEXTAUTH_SECRET: Generate a random secret key');
		console.log('   - DATABASE_URL: Your PostgreSQL connection string');
		console.log(
			'   - CLOUDINARY_*: Your Cloudinary credentials (optional for basic functionality)',
		);
		console.log('\n🔑 To generate a NEXTAUTH_SECRET, you can use:');
		console.log('   openssl rand -base64 32');
	} catch (error) {
		console.error('❌ Failed to create .env.local file:', error);
		process.exit(1);
	}
}

console.log('\n📋 Next steps:');
console.log('1. Update the environment variables in .env.local');
console.log('2. Run: pnpm run db:push (or pnpm run db:migrate)');
console.log('3. Run: pnpm run db:seed');
console.log('4. Run: pnpm run dev');
console.log('\n�� Happy coding!');
