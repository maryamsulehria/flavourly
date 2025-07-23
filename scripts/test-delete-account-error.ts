#!/usr/bin/env tsx

import { prisma } from '../lib/prisma';

async function testDeleteAccountError() {
	console.log('🔍 Debugging Delete Account Error...\n');

	try {
		// Test the API endpoint directly
		console.log('Testing API endpoint structure...');

		// Check if the route file exists and is properly structured
		const fs = require('fs');
		const path = require('path');

		const routePath = path.join(process.cwd(), 'app', 'api', 'user', 'delete-account', 'route.ts');
		if (fs.existsSync(routePath)) {
			console.log('✅ Delete account route file exists');
		} else {
			console.log('❌ Delete account route file missing');
		}

		// Check if the dialog component exists
		const dialogPath = path.join(process.cwd(), 'components', 'delete-account-dialog.tsx');
		if (fs.existsSync(dialogPath)) {
			console.log('✅ Delete account dialog component exists');
		} else {
			console.log('❌ Delete account dialog component missing');
		}

		// Check if the hook exists
		const hookPath = path.join(process.cwd(), 'lib', 'hooks', 'use-user.ts');
		if (fs.existsSync(hookPath)) {
			console.log('✅ use-user hook file exists');
		} else {
			console.log('❌ use-user hook file missing');
		}

		// Test database connection
		console.log('\nTesting database connection...');
		const userCount = await prisma.user.count();
		console.log(`✅ Database connected. Total users: ${userCount}`);

		// Check for any users with roles
		const usersWithRoles = await prisma.user.findMany({
			include: {
				role: true,
			},
			take: 5,
		});

		console.log('\nSample users with roles:');
		usersWithRoles.forEach(user => {
			console.log(`- ${user.username} (${user.role.name})`);
		});

		console.log('\n🔧 Common Issues to Check:');
		console.log('1. Make sure the development server is running');
		console.log('2. Check browser console for specific error messages');
		console.log('3. Verify that you are logged in when testing');
		console.log('4. Check if there are any TypeScript compilation errors');
		console.log('5. Verify that all imports are correct');

		console.log('\n🎯 Next Steps:');
		console.log('1. Open browser developer tools (F12)');
		console.log('2. Go to Console tab');
		console.log('3. Try to delete account again');
		console.log('4. Copy the exact error message');
		console.log('5. Check Network tab for failed API calls');
	} catch (error) {
		console.error('❌ Error during testing:', error);
	}
}

testDeleteAccountError()
	.catch(console.error)
	.finally(() => process.exit(0));
