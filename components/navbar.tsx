'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/hooks/use-user';
import { ChefHat, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
	const { data: session, status } = useSession();
	const { data: user } = useUser();
	const pathname = usePathname();

	// Check if user is on a public page (not dashboard or nutritionist)
	const isPublicPage = !pathname.startsWith('/dashboard') && !pathname.startsWith('/nutritionist');

	const handleLogout = async () => {
		await signOut({ callbackUrl: '/' });
	};

	const getUserInitials = (name: string) => {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<nav className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='flex h-16 items-center justify-between px-6'>
				{/* Left side - Logo and Role */}
				<div className='flex items-center gap-4'>
					<Link
						href='/'
						className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
							<ChefHat className='h-6 w-6 text-primary-foreground' />
						</div>
						<div className='flex flex-col'>
							<span className='text-xl font-bold'>Flavourly</span>
							{status === 'authenticated' && session?.user?.role && (
								<span className='text-sm text-muted-foreground capitalize'>
									{session.user.role}
								</span>
							)}
						</div>
					</Link>
				</div>

				{/* Center - Navigation Links */}
				<div className='flex-1 flex justify-center'>
					<nav className='hidden md:flex items-center gap-6'>
						{/* Show Recipes and About for all users */}
						<Link
							href='/recipes'
							className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'>
							Recipes
						</Link>
						<Link
							href='/about'
							className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'>
							About
						</Link>
					</nav>
				</div>

				{/* Right side - User info and actions */}
				<div className='flex items-center gap-4'>
					{/* Show user info and actions if authenticated */}
					{status === 'authenticated' && session ? (
						<>
							{/* Dashboard Button - Only show on public pages */}
							{isPublicPage && (
								<Button
									asChild
									variant='outline'
									size='sm'>
									<Link
										href={session?.user?.role === 'Nutritionist' ? '/nutritionist' : '/dashboard'}>
										Dashboard
									</Link>
								</Button>
							)}

							{/* User Profile */}
							<div className='flex items-center gap-3'>
								<Avatar className='h-10 w-10'>
									<AvatarImage
										src={user?.profilePicture}
										alt={user?.fullName || user?.username || 'Profile picture'}
									/>
									<AvatarFallback className='bg-primary text-primary-foreground'>
										{getUserInitials(user?.fullName || user?.username || session.user?.name || 'U')}
									</AvatarFallback>
								</Avatar>
								<div className='flex flex-col'>
									<span className='text-sm font-medium'>
										{user?.fullName || user?.username || session.user?.name}
									</span>
									<span className='text-xs text-muted-foreground'>
										{user?.email || session.user?.email}
									</span>
								</div>
							</div>

							{/* Theme Toggle */}
							<ThemeToggle />

							{/* Logout Button */}
							<Button
								onClick={handleLogout}
								variant='ghost'
								size='sm'
								className='gap-2'>
								<LogOut className='h-4 w-4' />
								Logout
							</Button>
						</>
					) : (
						/* Show auth buttons only on public pages if not authenticated */
						<>
							{/* Theme Toggle - Always show */}
							<ThemeToggle />

							{/* Auth Buttons - Only show on public pages */}
							{isPublicPage && (
								<div className='flex items-center gap-2'>
									<Button
										asChild
										variant='outline'
										size='sm'>
										<Link href='/signin'>Sign In</Link>
									</Button>
									<Button
										asChild
										size='sm'>
										<Link href='/signup'>Sign Up</Link>
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
