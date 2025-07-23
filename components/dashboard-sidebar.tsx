'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	BookOpen,
	Calendar,
	CheckCircle,
	ChevronRight,
	ClipboardList,
	FolderOpen,
	Heart,
	Home,
	Plus,
	Settings,
	ShoppingCart,
	User,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	badge?: string | number;
}

export function DashboardSidebar() {
	const { data: session } = useSession();
	const pathname = usePathname();
	const isNutritionist = session?.user?.role === 'Nutritionist';

	// Recipe Developer Navigation
	const recipeDeveloperNavItems: NavItem[] = [
		{
			title: 'My Recipes',
			href: '/dashboard',
			icon: BookOpen,
		},
		{
			title: 'Create Recipe',
			href: '/dashboard/recipes/new',
			icon: Plus,
		},
		{
			title: 'Favorites',
			href: '/dashboard/favorites',
			icon: Heart,
		},
		{
			title: 'Collections',
			href: '/dashboard/collections',
			icon: FolderOpen,
		},
		{
			title: 'Meal Planner',
			href: '/dashboard/meal-planner',
			icon: Calendar,
		},
		{
			title: 'Shopping List',
			href: '/dashboard/shopping-list',
			icon: ShoppingCart,
		},
		{
			title: 'Settings',
			href: '/dashboard/settings',
			icon: Settings,
		},
	];

	// Nutritionist Navigation
	const nutritionistNavItems: NavItem[] = [
		{
			title: 'Dashboard',
			href: '/nutritionist',
			icon: Home,
		},
		{
			title: 'Review Queue',
			href: '/nutritionist/queue',
			icon: ClipboardList,
		},
		{
			title: 'My Verified',
			href: '/nutritionist/verified',
			icon: CheckCircle,
		},
		{
			title: 'Profile',
			href: session?.user?.id
				? `/nutritionist/profile/${session.user.id}`
				: '/nutritionist/profile',
			icon: User,
		},
		{
			title: 'Settings',
			href: '/nutritionist/settings',
			icon: Settings,
		},
	];

	// Determine which navigation items to show based on role
	const navItems = isNutritionist ? nutritionistNavItems : recipeDeveloperNavItems;
	const dashboardTitle = isNutritionist ? 'Nutritionist Dashboard' : 'Dashboard';

	return (
		<div className='w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='p-6'>
				<h2 className='text-lg font-semibold mb-6'>{dashboardTitle}</h2>
				<nav className='space-y-8'>
					{navItems.map(item => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}>
								<Button
									variant={isActive ? 'secondary' : 'ghost'}
									className={cn('w-full justify-start', isActive && 'bg-secondary')}>
									<item.icon className='mr-2 h-4 w-4' />
									{item.title}
									{item.badge && (
										<Badge
											variant='destructive'
											className='ml-auto'>
											{item.badge}
										</Badge>
									)}
									{isActive && <ChevronRight className='ml-auto h-4 w-4' />}
								</Button>
							</Link>
						);
					})}
				</nav>
			</div>
		</div>
	);
}
