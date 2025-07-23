import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, ChefHat, Compass, FileQuestion, Home, Search, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
	const popularPages = [
		{
			icon: Home,
			title: 'Homepage',
			description: 'Discover featured recipes and get started',
			path: '/',
			badge: 'Popular',
		},
		{
			icon: Search,
			title: 'Browse Recipes',
			description: 'Search through our collection of recipes',
			path: '/recipes',
			badge: 'Browse',
		},
		{
			icon: ChefHat,
			title: 'Recipe Dashboard',
			description: 'Manage your own recipes and favorites',
			path: '/dashboard',
			badge: 'Create',
		},
		{
			icon: Utensils,
			title: 'Meal Planner',
			description: 'Plan your weekly meals',
			path: '/dashboard/meal-planner',
			badge: 'Plan',
		},
	];

	const helpfulTips = [
		{
			icon: Compass,
			title: 'Try Navigation',
			description: "Use the main navigation menu to find what you're looking for.",
		},
		{
			icon: Search,
			title: 'Search Recipes',
			description: 'Use our search feature to find specific recipes or ingredients.',
		},
		{
			icon: BookOpen,
			title: 'Browse Categories',
			description: 'Explore recipes by meal type, cuisine, or dietary preferences.',
		},
	];

	return (
		<div className='min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4'>
			<div className='max-w-4xl w-full space-y-8'>
				{/* Main 404 Card */}
				<Card className='border-muted shadow-lg'>
					<CardHeader className='text-center pb-6'>
						<div className='mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6'>
							<FileQuestion className='w-12 h-12 text-muted-foreground' />
						</div>
						<CardTitle className='text-3xl font-bold mb-2'>Page Not Found</CardTitle>
						<p className='text-muted-foreground text-lg'>
							Oops! The page you're looking for doesn't exist or has been moved.
						</p>
					</CardHeader>
					<CardContent className='text-center space-y-6'>
						<div className='flex justify-center'>
							<Link href='/'>
								<Button className='flex items-center'>
									<Home className='w-4 h-4 mr-2' />
									Go Home
								</Button>
							</Link>
						</div>

						<Separator className='my-6' />

						<p className='text-sm text-muted-foreground'>
							Error Code: 404 - The requested URL was not found on this server.
						</p>
					</CardContent>
				</Card>

				{/* Popular Pages Section */}
				<Card className='shadow-lg'>
					<CardHeader>
						<CardTitle className='flex items-center'>
							<Compass className='w-5 h-5 mr-2' />
							Popular Pages
						</CardTitle>
						<p className='text-muted-foreground text-sm'>
							Here are some popular sections you might be interested in:
						</p>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{popularPages.map((page, index) => (
								<Link
									key={index}
									href={page.path}>
									<div className='group p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer'>
										<div className='flex items-start space-x-3'>
											<div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
												<page.icon className='w-5 h-5 text-primary' />
											</div>
											<div className='flex-1'>
												<div className='flex items-center justify-between mb-1'>
													<h3 className='font-medium group-hover:text-primary transition-colors'>
														{page.title}
													</h3>
													<Badge
														variant='secondary'
														className='text-xs'>
														{page.badge}
													</Badge>
												</div>
												<p className='text-sm text-muted-foreground'>{page.description}</p>
												<p className='text-xs text-muted-foreground mt-1'>{page.path}</p>
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Helpful Tips Section */}
				<Card className='shadow-lg'>
					<CardHeader>
						<CardTitle className='text-lg'>Helpful Tips</CardTitle>
						<p className='text-muted-foreground text-sm'>
							Here are some ways to find what you're looking for:
						</p>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{helpfulTips.map((tip, index) => (
								<div
									key={index}
									className='p-4 bg-muted/30 rounded-lg'>
									<div className='flex items-center mb-2'>
										<div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3'>
											<tip.icon className='w-4 h-4 text-primary' />
										</div>
										<h4 className='font-medium text-sm'>{tip.title}</h4>
									</div>
									<p className='text-xs text-muted-foreground'>{tip.description}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
