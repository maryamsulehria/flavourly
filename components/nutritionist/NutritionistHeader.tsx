'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Settings, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface NutritionistHeaderProps {
	userName: string;
	userEmail: string;
}

export default function NutritionistHeader({ userName, userEmail }: NutritionistHeaderProps) {
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut({ callbackUrl: '/' });
	};

	return (
		<header className='bg-card shadow-sm border-b'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center py-4'>
					<div className='flex items-center'>
						<div className='flex-shrink-0'>
							<h1 className='text-2xl font-bold text-foreground'>Nutritionist Dashboard</h1>
						</div>
					</div>

					<nav className='hidden md:flex space-x-8'>
						<button
							onClick={() => router.push('/nutritionist')}
							className='text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors'>
							Dashboard
						</button>
						<button
							onClick={() => router.push('/nutritionist/queue')}
							className='text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors'>
							Review Queue
						</button>
						<button
							onClick={() => router.push('/nutritionist/verified')}
							className='text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors'>
							My Verified
						</button>
					</nav>

					<div className='flex items-center space-x-4'>
						<div className='flex items-center space-x-2'>
							<div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
								<User className='w-4 h-4 text-primary-foreground' />
							</div>
							<div className='hidden md:block'>
								<div className='text-sm font-medium text-foreground'>{userName}</div>
								<div className='text-xs text-muted-foreground'>{userEmail}</div>
							</div>
						</div>

						<Button
							variant='ghost'
							size='sm'
							onClick={() => router.push('/nutritionist/settings')}
							className='text-muted-foreground hover:text-foreground'>
							<Settings className='w-4 h-4' />
						</Button>

						<Button
							variant='ghost'
							size='sm'
							onClick={handleSignOut}
							className='text-muted-foreground hover:text-destructive'>
							<LogOut className='w-4 h-4' />
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
