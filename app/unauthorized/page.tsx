import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { ArrowLeft, ChefHat, Home, ShieldAlert, Stethoscope, User } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function UnauthorizedPage() {
	const session = await auth();

	// If not logged in, redirect to login
	if (!session?.user) {
		redirect('/signin');
	}

	const userRole = session.user.role;
	const userName = session.user.name || session.user.username;

	const getRoleInfo = () => {
		switch (userRole) {
			case 'RecipeDeveloper':
				return {
					icon: ChefHat,
					name: 'Recipe Developer',
					description: 'Create and manage recipes',
					availableRoutes: [
						{ path: '/dashboard', label: 'My Recipes Dashboard' },
						{ path: '/dashboard/recipes/new', label: 'Create New Recipe' },
						{ path: '/dashboard/favorites', label: 'My Favorites' },
						{ path: '/dashboard/collections', label: 'My Collections' },
						{ path: '/dashboard/meal-planner', label: 'Meal Planner' },
						{ path: '/dashboard/settings', label: 'Account Settings' },
					],
				};
			case 'Nutritionist':
				return {
					icon: Stethoscope,
					name: 'Nutritionist',
					description: 'Review and verify recipe nutritional information',
					availableRoutes: [
						{ path: '/nutritionist', label: 'Nutritionist Dashboard' },
						{ path: '/nutritionist/queue', label: 'Recipe Review Queue' },
						{ path: '/nutritionist/verified', label: 'My Verified Recipes' },
					],
				};

			default:
				return {
					icon: User,
					name: 'User',
					description: 'Standard user account',
					availableRoutes: [
						{ path: '/', label: 'Homepage' },
						{ path: '/recipes', label: 'Browse Recipes' },
					],
				};
		}
	};

	const roleInfo = getRoleInfo();
	const RoleIcon = roleInfo.icon;

	return (
		<div className='min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4'>
			<div className='max-w-2xl w-full space-y-8'>
				{/* Main Error Card */}
				<Card className='border-destructive/50 shadow-lg'>
					<CardHeader className='text-center pb-4'>
						<div className='mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-4'>
							<ShieldAlert className='w-10 h-10 text-destructive' />
						</div>
						<CardTitle className='text-2xl font-bold text-destructive'>Access Denied</CardTitle>
						<p className='text-muted-foreground mt-2'>
							You don't have permission to access this page or resource.
						</p>
					</CardHeader>
					<CardContent className='text-center space-y-4'>
						<Alert className='border-destructive/50'>
							<ShieldAlert className='h-4 w-4' />
							<AlertDescription>
								This page is restricted to specific user roles. Please check your permissions or
								contact an administrator if you believe this is an error.
							</AlertDescription>
						</Alert>

						<div className='flex justify-center space-x-4 pt-4'>
							<Link href='/'>
								<Button
									variant='outline'
									className='flex items-center'>
									<Home className='w-4 h-4 mr-2' />
									Go Home
								</Button>
							</Link>
							<Link href='javascript:history.back()'>
								<Button
									variant='outline'
									className='flex items-center'>
									<ArrowLeft className='w-4 h-4 mr-2' />
									Go Back
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>

				{/* User Role Information */}
				<Card className='shadow-lg'>
					<CardHeader>
						<CardTitle className='flex items-center'>
							<User className='w-5 h-5 mr-2' />
							Your Account Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center justify-between p-4 bg-muted rounded-lg'>
							<div className='flex items-center space-x-3'>
								<div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
									<RoleIcon className='w-5 h-5 text-primary' />
								</div>
								<div>
									<p className='font-medium'>{userName}</p>
									<p className='text-sm text-muted-foreground'>{roleInfo.description}</p>
								</div>
							</div>
							<Badge
								variant='secondary'
								className='flex items-center'>
								<RoleIcon className='w-3 h-3 mr-1' />
								{roleInfo.name}
							</Badge>
						</div>

						<div className='space-y-2'>
							<p className='text-sm font-medium text-muted-foreground'>
								Available sections for your role:
							</p>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
								{roleInfo.availableRoutes.map((route, index) => (
									<Link
										key={index}
										href={route.path}>
										<Button
											variant='ghost'
											className='w-full justify-start h-auto p-3 text-left'>
											<div>
												<p className='font-medium'>{route.label}</p>
												<p className='text-xs text-muted-foreground'>{route.path}</p>
											</div>
										</Button>
									</Link>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Help Card */}
				<Card className='shadow-lg'>
					<CardHeader>
						<CardTitle className='text-lg'>Need Help?</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
							<div className='p-3 bg-muted rounded-lg'>
								<h4 className='font-medium text-sm'>Role Information</h4>
								<p className='text-xs text-muted-foreground mt-1'>
									Different user roles have access to different features. Check your role
									permissions.
								</p>
							</div>
							<div className='p-3 bg-muted rounded-lg'>
								<h4 className='font-medium text-sm'>Available Features</h4>
								<p className='text-xs text-muted-foreground mt-1'>
									Use the navigation above to access features available for your current role.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
