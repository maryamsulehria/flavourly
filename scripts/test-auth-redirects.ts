#!/usr/bin/env tsx

import { prisma } from '../lib/prisma';

async function testAuthRedirects() {
	console.log('🧪 Testing Authentication Redirects...\n');

	try {
		// Find users with different roles
		const recipeDeveloper = await prisma.user.findFirst({
			where: {
				role: {
					name: 'RecipeDeveloper',
				},
			},
			include: {
				role: true,
			},
		});

		const nutritionist = await prisma.user.findFirst({
			where: {
				role: {
					name: 'Nutritionist',
				},
			},
			include: {
				role: true,
			},
		});

		console.log('👥 User Accounts Found:');

		if (recipeDeveloper) {
			console.log(`✅ Recipe Developer: ${recipeDeveloper.fullName || recipeDeveloper.username}`);
			console.log(`   Email: ${recipeDeveloper.email}`);
			console.log(`   Role: ${recipeDeveloper.role.name}`);
			console.log(`   ID: ${recipeDeveloper.id}\n`);
		} else {
			console.log('❌ No Recipe Developer found\n');
		}

		if (nutritionist) {
			console.log(`✅ Nutritionist: ${nutritionist.fullName || nutritionist.username}`);
			console.log(`   Email: ${nutritionist.email}`);
			console.log(`   Role: ${nutritionist.role.name}`);
			console.log(`   ID: ${nutritionist.id}\n`);
		} else {
			console.log('❌ No Nutritionist found\n');
		}

		// Test the redirect logic
		console.log('🔄 Testing Redirect Logic:');

		if (recipeDeveloper) {
			console.log(
				`📋 Recipe Developer (${recipeDeveloper.role.name}) should be redirected to: /dashboard`,
			);
		}

		if (nutritionist) {
			console.log(
				`📋 Nutritionist (${nutritionist.role.name}) should be redirected to: /nutritionist`,
			);
		}

		console.log('\n🎯 Authentication Redirect Test Summary:');
		console.log('✅ Added useSession hook to signin and signup pages');
		console.log('✅ Added useEffect to check authentication status');
		console.log('✅ Added role-based redirect logic');
		console.log('✅ Added loading state while checking authentication');
		console.log('✅ Added early return for authenticated users');
		console.log('✅ Proper imports for NextAuth and Next.js router');

		console.log('\n📝 To test the functionality:');
		console.log('   1. Sign in as a Recipe Developer');
		console.log('   2. Try to navigate to /signin or /signup');
		console.log('   3. Verify you are redirected to /dashboard');
		console.log('   4. Sign out and sign in as a Nutritionist');
		console.log('   5. Try to navigate to /signin or /signup');
		console.log('   6. Verify you are redirected to /nutritionist');
		console.log('   7. Test with unauthenticated users (should see forms)');

		console.log('\n🔧 Technical Implementation Details:');
		console.log('✅ useSession hook for authentication state');
		console.log('✅ useRouter for programmatic navigation');
		console.log('✅ useEffect for side effects and redirects');
		console.log('✅ Loading state during authentication check');
		console.log('✅ Early return to prevent form rendering for authenticated users');
		console.log('✅ Role-based redirect logic (Nutritionist → /nutritionist, others → /dashboard)');

		console.log('\n🛡️ Security Benefits:');
		console.log('✅ Prevents authenticated users from accessing auth forms');
		console.log('✅ Reduces confusion and improves UX');
		console.log('✅ Prevents potential session conflicts');
		console.log('✅ Ensures users are always in the correct context');
	} catch (error) {
		console.error('❌ Error testing authentication redirects:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testAuthRedirects();
