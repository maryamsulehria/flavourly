'use client';

import { Navbar } from '@/components/navbar';

export default function NutritionistProfileLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-background'>
			<Navbar />
			<main className='flex-1'>{children}</main>
		</div>
	);
}
