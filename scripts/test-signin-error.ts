#!/usr/bin/env tsx

import { prisma } from '../lib/prisma';

async function testSigninError() {
	console.log('🔍 Testing Sign In Error Handling...\n');

	try {
		// Test database connection
		console.log('Testing database connection...');
		const userCount = await prisma.user.count();
		console.log(`✅ Database connected. Total users: ${userCount}`);

		// Get existing users for testing
		const existingUsers = await prisma.user.findMany({
			include: {
				role: true,
			},
			take: 3,
		});

		console.log('\n📋 Existing users for testing:');
		existingUsers.forEach(user => {
			console.log(`- ${user.username} (${user.email}) - ${user.role.name}`);
		});

		console.log('\n🎯 Test Scenarios:');
		console.log('\n1. **Non-existent email:**');
		console.log('   - Try signing in with: nonexistent@example.com');
		console.log(
			'   - Expected error: "No account found with this email address. Please check your email or create a new account."',
		);

		console.log('\n2. **Wrong password:**');
		console.log('   - Try signing in with existing email but wrong password');
		console.log('   - Expected error: "Incorrect password. Please try again."');

		console.log('\n3. **Empty fields:**');
		console.log('   - Try signing in with empty email or password');
		console.log('   - Expected error: Form validation errors');

		console.log('\n🔧 Debug Information:');
		console.log('- Check browser console for debug logs');
		console.log('- Look for "Attempting sign in with:" logs');
		console.log('- Look for "Sign in result:" logs');
		console.log('- Look for "Caught error in sign in mutation:" logs');
		console.log('- Look for "User friendly error message:" logs');

		console.log('\n📝 Manual Testing Steps:');
		console.log('1. Open browser developer tools (F12)');
		console.log('2. Go to Console tab');
		console.log('3. Navigate to /signin page');
		console.log('4. Try signing in with non-existent email');
		console.log('5. Check console logs for error handling');
		console.log('6. Verify error message is displayed correctly');

		console.log('\n✅ Expected Behavior:');
		console.log('- Error should be caught by the mutation');
		console.log('- Error should be converted to user-friendly message');
		console.log('- Error should be displayed in the ErrorDisplay component');
		console.log('- No generic "Sign In Failed" message should appear');
	} catch (error) {
		console.error('❌ Error during testing:', error);
	}
}

testSigninError()
	.catch(console.error)
	.finally(() => process.exit(0));
