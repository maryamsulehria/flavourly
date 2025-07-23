import { Navbar } from '@/components/navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-background'>
			<Navbar />
			<main className='container mx-auto py-6 px-4'>{children}</main>
		</div>
	);
}
