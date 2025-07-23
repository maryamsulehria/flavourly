'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProfile, useUser } from '@/lib/hooks/use-user';
import { ArrowLeft, Camera, Save, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
	const { data: user, isLoading } = useUser();
	const updateProfile = useUpdateProfile();

	const [formData, setFormData] = useState({
		fullName: '',
		bio: '',
		profilePicture: null as File | null,
	});

	// Initialize form data when user data loads
	useEffect(() => {
		if (user && !formData.fullName) {
			setFormData({
				fullName: user.fullName || '',
				bio: user.bio || '',
				profilePicture: null,
			});
		}
	}, [user, formData.fullName]);

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFormData(prev => ({ ...prev, profilePicture: file }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.fullName.trim()) {
			toast.error('Full name is required');
			return;
		}

		try {
			await updateProfile.mutateAsync({
				fullName: formData.fullName.trim(),
				bio: formData.bio.trim() || undefined,
				profilePicture: formData.profilePicture,
			});
		} catch (error) {
			toast.error('Failed to update profile. Please try again.');
		}
	};

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='flex flex-col items-start gap-4'>
					<Button
						variant='outline'
						size='sm'
						disabled>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Settings
					</Button>
					<div>
						<div className='h-8 w-48 bg-muted rounded animate-pulse mb-2' />
						<div className='h-4 w-64 bg-muted rounded animate-pulse' />
					</div>
				</div>
				<Card>
					<CardHeader>
						<div className='h-6 w-32 bg-muted rounded animate-pulse' />
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<div className='h-4 w-20 bg-muted rounded animate-pulse' />
							<div className='h-10 w-full bg-muted rounded animate-pulse' />
						</div>
						<div className='space-y-2'>
							<div className='h-4 w-16 bg-muted rounded animate-pulse' />
							<div className='h-20 w-full bg-muted rounded animate-pulse' />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col items-start gap-4'>
				<Button
					variant='outline'
					size='sm'
					asChild>
					<Link href='/dashboard/settings'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Settings
					</Link>
				</Button>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Profile Settings</h1>
					<p className='text-muted-foreground'>Update your personal information</p>
				</div>
			</div>

			{/* Profile Form */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<User className='w-5 h-5 text-muted-foreground' />
						Personal Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className='space-y-6'>
						{/* Profile Picture */}
						<div className='flex items-center gap-6'>
							<div className='relative'>
								<Avatar className='w-20 h-20'>
									<AvatarImage
										src={
											formData.profilePicture
												? URL.createObjectURL(formData.profilePicture)
												: user?.profilePicture || undefined
										}
										alt={user?.fullName || 'Profile picture'}
									/>
									<AvatarFallback className='text-lg'>
										{user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
									</AvatarFallback>
								</Avatar>
								<label
									htmlFor='profile-picture'
									className='absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors'>
									<Camera className='w-3 h-3' />
								</label>
								<input
									id='profile-picture'
									type='file'
									accept='image/*'
									onChange={handleFileChange}
									className='hidden'
								/>
							</div>
							<div>
								<h3 className='font-medium'>Profile Picture</h3>
								<p className='text-sm text-muted-foreground'>
									Upload a new profile picture (JPG, PNG, GIF up to 5MB)
								</p>
							</div>
						</div>

						{/* Full Name */}
						<div className='space-y-2'>
							<Label htmlFor='fullName'>Full Name *</Label>
							<Input
								id='fullName'
								value={formData.fullName}
								onChange={e => handleInputChange('fullName', e.target.value)}
								placeholder='Enter your full name'
								required
							/>
						</div>

						{/* Bio */}
						<div className='space-y-2'>
							<Label htmlFor='bio'>Bio</Label>
							<Textarea
								id='bio'
								value={formData.bio}
								onChange={e => handleInputChange('bio', e.target.value)}
								placeholder='Tell us about yourself...'
								rows={4}
							/>
							<p className='text-sm text-muted-foreground'>
								Share a brief description about yourself (optional)
							</p>
						</div>

						{/* User Info Display */}
						<div className='space-y-3 p-4 bg-muted/50 rounded-lg'>
							<h4 className='font-medium text-sm'>Account Information</h4>
							<div className='space-y-2 text-sm'>
								<div className='flex items-center gap-2'>
									<span className='text-muted-foreground'>Username:</span>
									<Badge variant='secondary'>{user?.username}</Badge>
								</div>
								<div className='flex items-center gap-2'>
									<span className='text-muted-foreground'>Email:</span>
									<span>{user?.email}</span>
								</div>
								<div className='flex items-center gap-2'>
									<span className='text-muted-foreground'>Member since:</span>
									<span>{user?.createdAt && new Date(user.createdAt).toLocaleDateString()}</span>
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<div className='flex justify-end'>
							<Button
								type='submit'
								disabled={updateProfile.isPending}>
								{updateProfile.isPending ? (
									<>
										<Save className='w-4 h-4 mr-2 animate-spin' />
										Saving...
									</>
								) : (
									<>
										<Save className='w-4 h-4 mr-2' />
										Save Changes
									</>
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
