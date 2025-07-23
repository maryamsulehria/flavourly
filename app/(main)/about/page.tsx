import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChefHat, Heart, Shield, Star, Stethoscope, Target, Users } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
	const features = [
		{
			icon: Shield,
			title: 'Verified Nutrition',
			description:
				'All nutritional information is verified by certified nutritionists to ensure accuracy and reliability.',
		},
		{
			icon: Users,
			title: 'Community Driven',
			description:
				'A platform where recipe developers and nutritionists work together to create better recipes.',
		},
		{
			icon: Star,
			title: 'Quality Recipes',
			description:
				'Every recipe goes through a review process to maintain high standards of quality and nutrition.',
		},
		{
			icon: Heart,
			title: 'Health Focused',
			description:
				'Promoting healthy eating habits through carefully curated and nutritionally balanced recipes.',
		},
	];

	const roles = [
		{
			icon: ChefHat,
			title: 'Recipe Developer',
			description:
				'Create, share, and manage your own recipes while building a community of food enthusiasts.',
			features: [
				'Create unlimited recipes',
				'Upload photos and videos',
				'Manage recipe collections',
				'Plan weekly meals',
				'Track favorites',
			],
		},
		{
			icon: Stethoscope,
			title: 'Nutritionist',
			description:
				'Review and verify recipe nutritional information to help users make informed food choices.',
			features: [
				'Review recipe submissions',
				'Verify nutritional data',
				'Provide health recommendations',
				'Manage dietary tags',
				'Track verification history',
			],
		},
	];

	return (
		<div className='min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4'>
			<div className='max-w-4xl mx-auto space-y-12'>
				{/* Header */}
				<div className='text-center space-y-4'>
					<Link href='/'>
						<Button
							variant='ghost'
							className='mb-4'>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Home
						</Button>
					</Link>
					<h1 className='text-4xl font-bold'>About Flavourly</h1>
					<p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
						A platform dedicated to providing accurate nutritional information and high-quality
						recipes through the collaboration of passionate recipe developers and certified
						nutritionists.
					</p>
				</div>

				{/* Mission Statement */}
				<Card className='shadow-lg'>
					<CardHeader>
						<CardTitle className='flex items-center text-2xl'>
							<Target className='w-6 h-6 mr-3' />
							Our Mission
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p className='text-muted-foreground'>
							At Flavourly, we believe that everyone deserves access to accurate nutritional
							information when making food choices. Our platform bridges the gap between creative
							recipe development and professional nutritional expertise.
						</p>
						<p className='text-muted-foreground'>
							By combining the creativity of passionate recipe developers with the expertise of
							certified nutritionists, we ensure that every recipe on our platform is not just
							delicious, but also nutritionally accurate and beneficial for your health.
						</p>
					</CardContent>
				</Card>

				{/* Key Features */}
				<div className='space-y-6'>
					<h2 className='text-2xl font-bold text-center'>Why Choose Flavourly?</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{features.map((feature, index) => (
							<Card
								key={index}
								className='shadow-lg'>
								<CardContent className='pt-6'>
									<div className='flex items-start space-x-4'>
										<div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
											<feature.icon className='w-6 h-6 text-primary' />
										</div>
										<div>
											<h3 className='font-semibold mb-2'>{feature.title}</h3>
											<p className='text-sm text-muted-foreground'>{feature.description}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* User Roles */}
				<div className='space-y-6'>
					<h2 className='text-2xl font-bold text-center'>User Roles</h2>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
						{roles.map((role, index) => (
							<Card
								key={index}
								className='shadow-lg'>
								<CardHeader>
									<CardTitle className='flex items-center'>
										<role.icon className='w-5 h-5 mr-2' />
										{role.title}
									</CardTitle>
									<p className='text-muted-foreground text-sm'>{role.description}</p>
								</CardHeader>
								<CardContent>
									<div className='space-y-2'>
										<h4 className='font-medium text-sm'>Key Features:</h4>
										<ul className='space-y-1'>
											{role.features.map((feature, featureIndex) => (
												<li
													key={featureIndex}
													className='flex items-center text-sm'>
													<div className='w-1.5 h-1.5 bg-primary rounded-full mr-2' />
													{feature}
												</li>
											))}
										</ul>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Quality Assurance */}
				<Card className='shadow-lg'>
					<CardHeader>
						<CardTitle className='flex items-center'>
							<Shield className='w-5 h-5 mr-2' />
							Quality Assurance
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div className='space-y-3'>
								<h4 className='font-medium'>Recipe Review Process</h4>
								<ul className='space-y-2 text-sm text-muted-foreground'>
									<li className='flex items-start'>
										<Badge
											variant='outline'
											className='mr-2 mt-0.5'>
											1
										</Badge>
										Recipe submission by developers
									</li>
									<li className='flex items-start'>
										<Badge
											variant='outline'
											className='mr-2 mt-0.5'>
											2
										</Badge>
										Nutritional analysis and verification
									</li>
									<li className='flex items-start'>
										<Badge
											variant='outline'
											className='mr-2 mt-0.5'>
											3
										</Badge>
										Quality review by nutritionists
									</li>
									<li className='flex items-start'>
										<Badge
											variant='outline'
											className='mr-2 mt-0.5'>
											4
										</Badge>
										Publication with verified badge
									</li>
								</ul>
							</div>

							<div className='space-y-3'>
								<h4 className='font-medium'>Nutritional Standards</h4>
								<ul className='space-y-2 text-sm text-muted-foreground'>
									<li>• Accurate calorie calculations</li>
									<li>• Verified macronutrient profiles</li>
									<li>• Dietary restriction compliance</li>
									<li>• Health recommendation integration</li>
									<li>• Ingredient substitution guidance</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Get Started */}
				<Card className='shadow-lg'>
					<CardContent className='pt-6'>
						<div className='text-center space-y-4'>
							<h3 className='text-xl font-semibold'>Ready to Get Started?</h3>
							<p className='text-muted-foreground'>
								Join our community of recipe developers and nutritionists today!
							</p>
							<div className='flex justify-center space-x-4'>
								<Link href='/signup'>
									<Button>
										<ChefHat className='w-4 h-4 mr-2' />
										Join as Recipe Developer
									</Button>
								</Link>
								<Link href='/signup'>
									<Button variant='outline'>
										<Stethoscope className='w-4 h-4 mr-2' />
										Join as Nutritionist
									</Button>
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
