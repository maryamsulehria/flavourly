'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Navbar } from '@/components/navbar';
import { RoleName } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (!session) {
		redirect('/signin');
	}

	// Role-based access control
	if (session.user.role === RoleName.Nutritionist) {
		redirect('/nutritionist');
	}

	if (session.user.role !== RoleName.RecipeDeveloper) {
		redirect('/unauthorized');
	}

	return (
		<div className='min-h-screen bg-background'>
			<Navbar />

			{/* Dashboard Content */}
			<div className='flex'>
				<DashboardSidebar />
				<main className='flex-1 p-6'>{children}</main>
			</div>
		</div>
	);
}
