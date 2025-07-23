'use client';

import { PhysicsCircles } from '@/components/physics-circles';
import { RecipeCard } from '@/components/recipe-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicRecipes } from '@/lib/hooks/use-queries';
import { useStats } from '@/lib/hooks/use-stats';
import {
	ArrowRight,
	BookOpen,
	Calendar,
	CheckCircle,
	ChefHat,
	FileText,
	Heart,
	HelpCircle,
	Shield,
	Sparkles,
	Star,
	UserCheck,
	Utensils,
	Zap,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
	const { status } = useSession();
	const router = useRouter();

	// Fetch different types of recipes for the homepage
	const { data: recentRecipes, isLoading: recentLoading } = usePublicRecipes('recent', 3);

	// Fetch real-time stats
	const { data: stats, isLoading: statsLoading } = useStats();

	const handleTagClick = (tagName: string, tagType: string) => {
		// Map tag type to filter parameter
		let filterParam = '';
		switch (tagType) {
			case 'Meal Type':
				filterParam = `mealType=${encodeURIComponent(tagName)}`;
				break;
			case 'Dietary':
				filterParam = `dietary=${encodeURIComponent(tagName)}`;
				break;
			case 'Cuisine':
				filterParam = `cuisine=${encodeURIComponent(tagName)}`;
				break;
			case 'Difficulty':
				filterParam = `difficulty=${encodeURIComponent(tagName)}`;
				break;
			default:
				return;
		}

		// Navigate to recipes page with the filter
		router.push(`/recipes?${filterParam}`);
	};

	const RecipeGridSkeleton = () => (
		<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
			{Array.from({ length: 3 }).map((_, i) => (
				<Card
					key={i}
					className='overflow-hidden'>
					<Skeleton className='aspect-[4/3] w-full' />
					<CardHeader className='pb-3'>
						<Skeleton className='h-5 w-3/4' />
						<Skeleton className='h-4 w-full' />
					</CardHeader>
					<CardContent className='pb-3'>
						<div className='flex gap-4'>
							<Skeleton className='h-4 w-16' />
							<Skeleton className='h-4 w-20' />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);

	return (
		<div className='min-h-screen'>
			{/* Hero Section - Split Layout */}
			<section className='relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10'>
				<div className='container mx-auto px-4 py-16'>
					<div className='grid lg:grid-cols-2 gap-12 items-center'>
						{/* Left Content */}
						<div className='space-y-8'>
							<div className='space-y-4'>
								<Badge
									variant='secondary'
									className='w-fit px-4 py-2 text-sm'>
									<Sparkles className='h-4 w-4 mr-2' />
									Expert-Verified Recipes
								</Badge>
								<h1 className='text-5xl lg:text-6xl font-bold leading-tight'>
									Cook with{' '}
									<span className='bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
										Confidence
									</span>
								</h1>
								<p className='text-xl text-muted-foreground leading-relaxed'>
									Discover thousands of nutritionist-verified recipes with accurate nutritional
									information. From quick weeknight dinners to gourmet weekend feasts.
								</p>
							</div>

							{/* Search Bar */}
							<div className='space-y-4'>
								<div className='flex flex-col sm:flex-row gap-3'>
									{status === 'authenticated' ? (
										<>
											<Button
												asChild
												size='lg'
												className='h-12 px-8 text-base'>
												<Link href='/dashboard'>Go to Dashboard</Link>
											</Button>
											<Button
												asChild
												variant='outline'
												size='lg'
												className='h-12 px-8 text-base'>
												<Link href='/recipes'>Browse Recipes</Link>
											</Button>
										</>
									) : (
										<>
											<Button
												asChild
												size='lg'
												className='h-12 px-8 text-base'>
												<Link href='/signup'>Get Started</Link>
											</Button>
											<Button
												asChild
												variant='outline'
												size='lg'
												className='h-12 px-8 text-base'>
												<Link href='/signin'>Sign In</Link>
											</Button>
										</>
									)}
								</div>
							</div>

							{/* Quick Stats */}
							<div className='grid grid-cols-2 gap-6 pt-8'>
								<div className='text-center'>
									<div className='text-2xl font-bold text-primary'>
										{statsLoading ? (
											<Skeleton className='h-8 w-16 mx-auto' />
										) : (
											`${stats?.verifiedRecipes || 0}+`
										)}
									</div>
									<div className='text-sm text-muted-foreground'>Verified Recipes</div>
								</div>
								<div className='text-center'>
									<div className='text-2xl font-bold text-primary'>
										{statsLoading ? (
											<Skeleton className='h-8 w-12 mx-auto' />
										) : (
											`${stats?.nutritionists || 0}+`
										)}
									</div>
									<div className='text-sm text-muted-foreground'>Nutritionists</div>
								</div>
							</div>
						</div>

						{/* Right Content - Hero Image/Illustration */}
						<div className='relative'>
							<div className='relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20'>
								<div className='absolute inset-0 flex items-center justify-center'>
									<div className='text-center space-y-4'>
										<div className='mx-auto w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center'>
											<ChefHat className='h-12 w-12 text-primary' />
										</div>
										<h3 className='text-xl font-semibold text-primary'>Fresh Recipes Daily</h3>
										<p className='text-muted-foreground'>Join our community of food lovers</p>
									</div>
								</div>

								{/* Animated floating circles */}
								<PhysicsCircles />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='py-32 bg-background'>
				<div className='container mx-auto px-4'>
					<div className='text-center space-y-4 mb-16'>
						<h2 className='text-4xl font-bold'>How Flavourly Works</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							Our three-step process ensures every recipe is accurate, safe, and delicious
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-8'>
						<div className='text-center space-y-6'>
							<div className='mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center'>
								<FileText className='h-10 w-10 text-primary' />
							</div>
							<div className='space-y-3'>
								<h3 className='text-xl font-semibold'>Submit Recipe</h3>
								<p className='text-muted-foreground'>
									Home cooks submit their favorite recipes with ingredients, instructions, and
									photos
								</p>
							</div>
						</div>

						<div className='text-center space-y-6'>
							<div className='mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center'>
								<UserCheck className='h-10 w-10 text-primary' />
							</div>
							<div className='space-y-3'>
								<h3 className='text-xl font-semibold'>Expert Review</h3>
								<p className='text-muted-foreground'>
									Certified nutritionists verify nutritional information and add health tips
								</p>
							</div>
						</div>

						<div className='text-center space-y-6'>
							<div className='mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center'>
								<CheckCircle className='h-10 w-10 text-primary' />
							</div>
							<div className='space-y-3'>
								<h3 className='text-xl font-semibold'>Verified & Published</h3>
								<p className='text-muted-foreground'>
									Recipes are published with verified nutritional data and dietary tags
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-20 bg-muted/30'>
				<div className='container mx-auto px-4'>
					<div className='text-center space-y-4 mb-16'>
						<h2 className='text-4xl font-bold'>Why Choose Flavourly?</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							Everything you need to cook with confidence and discover amazing recipes
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-8'>
						<div className='text-center space-y-4 p-6 rounded-xl hover:bg-background transition-colors'>
							<div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
								<Shield className='h-8 w-8 text-primary' />
							</div>
							<h3 className='text-xl font-semibold'>Expert Verified</h3>
							<p className='text-muted-foreground'>
								Every recipe is reviewed by certified nutritionists for accuracy and safety
							</p>
						</div>

						<div className='text-center space-y-4 p-6 rounded-xl hover:bg-background transition-colors'>
							<div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
								<Calendar className='h-8 w-8 text-primary' />
							</div>
							<h3 className='text-xl font-semibold'>Smart Planning</h3>
							<p className='text-muted-foreground'>
								Plan your meals, generate shopping lists, and organize your cooking schedule
							</p>
						</div>

						<div className='text-center space-y-4 p-6 rounded-xl hover:bg-background transition-colors'>
							<div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
								<Zap className='h-8 w-8 text-primary' />
							</div>
							<h3 className='text-xl font-semibold'>Quick & Easy</h3>
							<p className='text-muted-foreground'>
								Find recipes that fit your time, skill level, and dietary preferences
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Recent Recipes Section */}
			<section className='py-20 bg-background'>
				<div className='container mx-auto px-4'>
					<div className='flex items-center justify-between mb-12'>
						<div className='space-y-2'>
							<h2 className='text-3xl font-bold'>Fresh from Our Community</h2>
							<p className='text-muted-foreground'>
								Latest recipes added by our community of passionate cooks
							</p>
						</div>
						<Button
							asChild
							variant='outline'
							size='lg'
							className='gap-2'>
							<Link href='/recipes'>
								View All Recipes
								<ArrowRight className='h-4 w-4' />
							</Link>
						</Button>
					</div>

					{recentLoading ? (
						<RecipeGridSkeleton />
					) : Array.isArray(recentRecipes) && recentRecipes.length > 0 ? (
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							{recentRecipes.map(recipe => (
								<RecipeCard
									key={recipe.id}
									recipe={recipe}
									onTagClick={handleTagClick}
								/>
							))}
						</div>
					) : (
						<div className='text-center py-12'>
							<ChefHat className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
							<h3 className='text-xl font-semibold mb-2'>No recipes available</h3>
							<p className='text-muted-foreground mb-4'>
								Check back soon for new recipes from our community
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Categories Section */}
			<section className='py-20 bg-muted/30'>
				<div className='container mx-auto px-4'>
					<div className='text-center space-y-4 mb-12'>
						<h2 className='text-3xl font-bold'>Explore by Category</h2>
						<p className='text-muted-foreground'>Find the perfect recipe for any occasion</p>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
						<Card className='group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md'>
							<Link href='/recipes?category=breakfast'>
								<CardContent className='p-6 text-center'>
									<div className='mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors'>
										<Utensils className='h-8 w-8 text-orange-600' />
									</div>
									<h3 className='font-semibold text-lg mb-2'>Breakfast</h3>
									<p className='text-sm text-muted-foreground'>Start your day right</p>
								</CardContent>
							</Link>
						</Card>

						<Card className='group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md'>
							<Link href='/recipes?category=lunch'>
								<CardContent className='p-6 text-center'>
									<div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors'>
										<BookOpen className='h-8 w-8 text-green-600' />
									</div>
									<h3 className='font-semibold text-lg mb-2'>Lunch</h3>
									<p className='text-sm text-muted-foreground'>Quick & healthy meals</p>
								</CardContent>
							</Link>
						</Card>

						<Card className='group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md'>
							<Link href='/recipes?category=dinner'>
								<CardContent className='p-6 text-center'>
									<div className='mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors'>
										<ChefHat className='h-8 w-8 text-purple-600' />
									</div>
									<h3 className='font-semibold text-lg mb-2'>Dinner</h3>
									<p className='text-sm text-muted-foreground'>Family favorites</p>
								</CardContent>
							</Link>
						</Card>

						<Card className='group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md'>
							<Link href='/recipes?category=desserts'>
								<CardContent className='p-6 text-center'>
									<div className='mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors'>
										<Heart className='h-8 w-8 text-pink-600' />
									</div>
									<h3 className='font-semibold text-lg mb-2'>Desserts</h3>
									<p className='text-sm text-muted-foreground'>Sweet treats</p>
								</CardContent>
							</Link>
						</Card>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className='py-20 bg-background'>
				<div className='container mx-auto px-4'>
					<div className='text-center space-y-4 mb-16'>
						<h2 className='text-4xl font-bold'>What Our Community Says</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							Join thousands of satisfied home cooks who trust Flavourly
						</p>
					</div>

					<div className='grid md:grid-cols-3 gap-8'>
						<Card className='p-6 border-0 shadow-md'>
							<div className='flex items-center gap-2 mb-4'>
								{Array.from({ length: 5 }).map((_, i) => (
									<Star
										key={i}
										className='h-4 w-4 fill-yellow-400 text-yellow-400'
									/>
								))}
							</div>
							<p className='text-muted-foreground mb-6 leading-relaxed'>
								&quot;Flavourly has transformed how I cook. The verified nutritional info gives me
								confidence in what I&apos;m feeding my family. The meal planning feature is a
								game-changer!&quot;
							</p>
							<div className='flex items-center gap-3'>
								<Image
									src='https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face'
									alt='Sarah M.'
									width={40}
									height={40}
									className='w-10 h-10 rounded-full object-cover'
								/>
								<div>
									<p className='font-medium'>Sarah M.</p>
									<p className='text-sm text-muted-foreground'>Home Cook</p>
								</div>
							</div>
						</Card>

						<Card className='p-6 border-0 shadow-md'>
							<div className='flex items-center gap-2 mb-4'>
								{Array.from({ length: 5 }).map((_, i) => (
									<Star
										key={i}
										className='h-4 w-4 fill-yellow-400 text-yellow-400'
									/>
								))}
							</div>
							<p className='text-muted-foreground mb-6 leading-relaxed'>
								&quot;As a nutritionist, I love how Flavourly ensures accuracy. It&apos;s the only
								platform I trust for my clients. The verification process is thorough and
								reliable.&quot;
							</p>
							<div className='flex items-center gap-3'>
								<Image
									src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
									alt='Dr. Lisa K.'
									width={40}
									height={40}
									className='w-10 h-10 rounded-full object-cover'
								/>
								<div>
									<p className='font-medium'>Dr. Lisa K.</p>
									<p className='text-sm text-muted-foreground'>Certified Nutritionist</p>
								</div>
							</div>
						</Card>

						<Card className='p-6 border-0 shadow-md'>
							<div className='flex items-center gap-2 mb-4'>
								{Array.from({ length: 5 }).map((_, i) => (
									<Star
										key={i}
										className='h-4 w-4 fill-yellow-400 text-yellow-400'
									/>
								))}
							</div>
							<p className='text-muted-foreground mb-6 leading-relaxed'>
								&quot;The shopping list feature saves me so much time and money. I love how it
								automatically generates lists from my meal plans. Highly recommend!&quot;
							</p>
							<div className='flex items-center gap-3'>
								<Image
									src='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
									alt='Mike R.'
									width={40}
									height={40}
									className='w-10 h-10 rounded-full object-cover'
								/>
								<div>
									<p className='font-medium'>Mike R.</p>
									<p className='text-sm text-muted-foreground'>Busy Parent</p>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className='py-20 bg-muted/30'>
				<div className='container mx-auto px-4'>
					<div className='text-center space-y-4 mb-16'>
						<h2 className='text-4xl font-bold'>Frequently Asked Questions</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							Everything you need to know about Flavourly
						</p>
					</div>

					<div className='max-w-3xl mx-auto space-y-6'>
						<Card className='p-6 border-0 shadow-md'>
							<div className='space-y-3'>
								<h3 className='text-lg font-semibold flex items-center gap-2'>
									<HelpCircle className='h-5 w-5 text-primary' />
									How does recipe verification work?
								</h3>
								<p className='text-muted-foreground leading-relaxed'>
									Every recipe submitted to Flavourly is reviewed by certified nutritionists who
									verify nutritional information, check ingredient safety, and add helpful health
									tips. This ensures you can cook with confidence knowing the information is
									accurate.
								</p>
							</div>
						</Card>

						<Card className='p-6 border-0 shadow-md'>
							<div className='space-y-3'>
								<h3 className='text-lg font-semibold flex items-center gap-2'>
									<HelpCircle className='h-5 w-5 text-primary' />
									Is Flavourly free to use?
								</h3>
								<p className='text-muted-foreground leading-relaxed'>
									Yes! Flavourly is completely free to use. You can browse recipes, create meal
									plans, generate shopping lists, and access all our features without any cost. We
									believe everyone deserves access to healthy, verified recipes.
								</p>
							</div>
						</Card>

						<Card className='p-6 border-0 shadow-md'>
							<div className='space-y-3'>
								<h3 className='text-lg font-semibold flex items-center gap-2'>
									<HelpCircle className='h-5 w-5 text-primary' />
									Can I submit my own recipes?
								</h3>
								<p className='text-muted-foreground leading-relaxed'>
									Absolutely! We encourage home cooks to share their favorite recipes with our
									community. Simply create an account and use our recipe submission form. Our
									nutritionists will review and verify your recipe before publishing.
								</p>
							</div>
						</Card>

						<Card className='p-6 border-0 shadow-md'>
							<div className='space-y-3'>
								<h3 className='text-lg font-semibold flex items-center gap-2'>
									<HelpCircle className='h-5 w-5 text-primary' />
									How accurate is the nutritional information?
								</h3>
								<p className='text-muted-foreground leading-relaxed'>
									All nutritional information is verified by certified nutritionists using
									professional databases and calculation methods. We take accuracy seriously to help
									you make informed dietary choices.
								</p>
							</div>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-20 bg-gradient-to-r from-primary/10 to-primary/5'>
				<div className='container mx-auto px-4 text-center'>
					<div className='max-w-3xl mx-auto space-y-8'>
						<div className='space-y-4'>
							<h2 className='text-4xl font-bold'>Ready to Start Cooking?</h2>
							<p className='text-xl text-muted-foreground'>
								Join thousands of food lovers who trust Flavourly for their culinary adventures
							</p>
						</div>

						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							{status === 'authenticated' ? (
								<Button
									asChild
									size='lg'
									className='h-12 px-8 text-base'>
									<Link href='/dashboard'>Go to Dashboard</Link>
								</Button>
							) : (
								<Button
									asChild
									size='lg'
									className='h-12 px-8 text-base'>
									<Link href='/signup'>Get Started</Link>
								</Button>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
