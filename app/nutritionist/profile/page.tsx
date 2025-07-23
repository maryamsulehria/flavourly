'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/lib/hooks/use-user';
import { ArrowLeft, Calendar, Mail, Shield, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NutritionistProfilePage() {
	const router = useRouter();
	const { data: session } = useSession();
	const { data: user, isLoading } = useUser();

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='mb-8'>
					<div className='h-8 w-48 bg-muted animate-pulse rounded mb-2' />
					<div className='h-4 w-64 bg-muted animate-pulse rounded' />
				</div>
				<div className='space-y-4'>
					{[1, 2, 3].map(i => (
						<div
							key={i}
							className='h-20 bg-muted animate-pulse rounded'
						/>
					))}
				</div>
			</div>
		);
	}

	if (!session || !user) {
		router.push('/signin');
		return null;
	}

	const getUserInitials = (name: string) => {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex items-center gap-4 mb-4'>
					<Button
						variant='outline'
						size='sm'
						asChild>
						<Link href='/nutritionist'>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Dashboard
						</Link>
					</Button>
				</div>
				<h1 className='text-3xl font-bold text-foreground'>Profile</h1>
				<p className='text-muted-foreground mt-2'>
					View and manage your nutritionist profile information
				</p>
			</div>

			{/* Profile Card */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<User className='w-5 h-5 mr-2' />
						Profile Information
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Avatar and Basic Info */}
					<div className='flex items-start gap-6'>
						<Avatar className='h-24 w-24'>
							<AvatarImage
								src={user.profilePicture}
								alt={user.fullName || user.username}
							/>
							<AvatarFallback className='bg-primary text-primary-foreground text-lg'>
								{getUserInitials(user.fullName || user.username)}
							</AvatarFallback>
						</Avatar>

						<div className='flex-1 space-y-4'>
							<div>
								<h2 className='text-2xl font-semibold'>{user.fullName || user.username}</h2>
								<div className='flex items-center gap-2 mt-2'>
									<Badge
										variant='secondary'
										className='flex items-center'>
										<Shield className='w-3 h-3 mr-1' />
										{session.user.role || 'Nutritionist'}
									</Badge>
								</div>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='flex items-center gap-3'>
									<Mail className='w-4 h-4 text-muted-foreground' />
									<div>
										<p className='text-sm font-medium'>Email</p>
										<p className='text-sm text-muted-foreground'>{user.email}</p>
									</div>
								</div>

								<div className='flex items-center gap-3'>
									<User className='w-4 h-4 text-muted-foreground' />
									<div>
										<p className='text-sm font-medium'>Username</p>
										<p className='text-sm text-muted-foreground'>{user.username}</p>
									</div>
								</div>
							</div>

							<div className='flex items-center gap-3'>
								<Calendar className='w-4 h-4 text-muted-foreground' />
								<div>
									<p className='text-sm font-medium'>Member Since</p>
									<p className='text-sm text-muted-foreground'>
										{new Date(user.createdAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Bio */}
					{user.bio && (
						<div>
							<h3 className='text-sm font-medium mb-2'>Bio</h3>
							<p className='text-sm text-muted-foreground'>{user.bio}</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className='flex gap-3 pt-4'>
						<Button asChild>
							<Link href='/nutritionist/settings'>Edit Profile</Link>
						</Button>
						<Button
							variant='outline'
							asChild>
							<Link href='/nutritionist'>Back to Dashboard</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
