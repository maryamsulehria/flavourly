'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthRedirectPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === 'loading') {
			// Still loading, wait
			return;
		}

		if (!session) {
			// No session, redirect to signin
			router.push('/signin');
			return;
		}

		// Session is available, redirect based on role
		if (session.user?.role === 'Nutritionist') {
			router.push('/nutritionist');
		} else {
			// RecipeDeveloper goes to dashboard
			router.push('/dashboard');
		}
	}, [session, status, router]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-background px-4'>
			<div className='w-full max-w-2xl space-y-4'>
				<Card>
					<CardHeader className='text-center'>
						<CardTitle>Redirecting...</CardTitle>
						<CardDescription>Please wait while we redirect you to your dashboard</CardDescription>
					</CardHeader>
					<CardContent className='text-center'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
						<p className='mt-4 text-sm text-muted-foreground'>
							{status === 'loading' ? 'Loading session...' : 'Preparing your dashboard...'}
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
