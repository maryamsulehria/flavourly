'use client';

import { DeleteAccountDialog } from '@/components/delete-account-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateEmail, useUpdatePassword, useUpdateProfile, useUser } from '@/lib/hooks/use-user';
import { ArrowLeft, Camera, Lock, Mail, Save, Settings, Shield, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function NutritionistSettingsPage() {
	const { data: user, isLoading } = useUser();
	const { data: session } = useSession();
	const updateProfile = useUpdateProfile();
	const updateEmail = useUpdateEmail();
	const updatePassword = useUpdatePassword();

	// Profile form state
	const [profileForm, setProfileForm] = useState({
		fullName: '',
		bio: '',
		profilePicture: null as File | null,
	});

	// Profile picture upload state
	const [isUploadingPicture, setIsUploadingPicture] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// Account form state
	const [emailForm, setEmailForm] = useState({
		email: '',
		password: '',
	});

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	// Initialize form data when user data loads
	useEffect(() => {
		if (user) {
			// Initialize profile form
			if (!profileForm.fullName) {
				setProfileForm({
					fullName: user.fullName || '',
					bio: user.bio || '',
					profilePicture: null,
				});
			}

			// Initialize email form
			if (!emailForm.email) {
				setEmailForm(prev => ({ ...prev, email: user.email }));
			}
		}
	}, [user, profileForm.fullName, emailForm.email]);

	// Profile handlers
	const handleProfileInputChange = (field: string, value: string) => {
		setProfileForm(prev => ({ ...prev, [field]: value }));
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type
			const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
			if (!validTypes.includes(file.type)) {
				toast.error('Please upload JPG, PNG, or WebP images.');
				return;
			}

			// Validate file size (5MB limit)
			if (file.size > 5 * 1024 * 1024) {
				toast.error('Please upload an image smaller than 5MB.');
				return;
			}

			setProfileForm(prev => ({ ...prev, profilePicture: file }));
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!profileForm.fullName.trim()) {
			toast.error('Full name is required');
			return;
		}

		try {
			const updateData: any = {
				fullName: profileForm.fullName.trim(),
				bio: profileForm.bio.trim(),
			};

			if (profileForm.profilePicture) {
				setIsUploadingPicture(true);
				updateData.profilePicture = profileForm.profilePicture;
			}

			await updateProfile.mutateAsync(updateData);

			// Clear the form after successful update
			setProfileForm(prev => ({ ...prev, profilePicture: null }));
			setPreviewUrl(null);
			setIsUploadingPicture(false);
		} catch (error) {
			setIsUploadingPicture(false);
			console.error('Error updating profile:', error);
			toast.error('Failed to update profile.');
		}
	};

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!emailForm.email || !emailForm.password) {
			toast.error('Email and password are required');
			return;
		}

		try {
			await updateEmail.mutateAsync({
				email: emailForm.email,
				password: emailForm.password,
			});

			// Clear password field after successful update
			setEmailForm(prev => ({ ...prev, password: '' }));
		} catch (error) {
			console.error('Error updating email:', error);
			toast.error('Failed to update email address.');
		}
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!passwordForm.currentPassword ||
			!passwordForm.newPassword ||
			!passwordForm.confirmPassword
		) {
			toast.error('All password fields are required');
			return;
		}

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast.error('New password and confirmation do not match');
			return;
		}

		if (passwordForm.newPassword.length < 8) {
			toast.error('New password must be at least 8 characters long');
			return;
		}

		try {
			await updatePassword.mutateAsync({
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword,
			});

			// Clear password fields after successful update
			setPasswordForm({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
		} catch (error) {
			console.error('Error updating password:', error);
			toast.error('Failed to update password.');
		}
	};

	const getPasswordStrength = (password: string) => {
		if (!password) return { strength: 0, label: '', color: 'text-gray-400' };

		let strength = 0;
		if (password.length >= 8) strength++;
		if (/[a-z]/.test(password)) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/[0-9]/.test(password)) strength++;
		if (/[^A-Za-z0-9]/.test(password)) strength++;

		const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
		const colors = [
			'text-red-500',
			'text-orange-500',
			'text-yellow-500',
			'text-blue-500',
			'text-green-500',
		];

		return {
			strength: Math.min(strength, 5),
			label: labels[Math.min(strength - 1, 4)],
			color: colors[Math.min(strength - 1, 4)],
		};
	};

	const passwordStrength = getPasswordStrength(passwordForm.newPassword);

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='flex flex-col items-start gap-4'>
					<div className='h-10 w-32 bg-muted rounded animate-pulse' />
					<div>
						<div className='h-8 w-48 bg-muted rounded animate-pulse mb-2' />
						<div className='h-4 w-64 bg-muted rounded animate-pulse' />
					</div>
				</div>
				<Card>
					<CardHeader>
						<div className='h-6 w-32 bg-muted rounded animate-pulse' />
					</CardHeader>
					<CardContent>
						<div className='h-10 w-full bg-muted rounded animate-pulse' />
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
					<Link href='/nutritionist'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Dashboard
					</Link>
				</Button>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
					<p className='text-muted-foreground'>Manage your account and profile information</p>
				</div>
			</div>

			{/* Settings Tabs */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Settings className='w-5 h-5 text-muted-foreground' />
						Account Settings
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs
						defaultValue='profile'
						className='w-full'>
						<TabsList className='grid w-full grid-cols-3'>
							<TabsTrigger
								value='profile'
								className='flex items-center gap-2'>
								<User className='w-4 h-4' />
								Profile
							</TabsTrigger>
							<TabsTrigger
								value='account'
								className='flex items-center gap-2'>
								<Lock className='w-4 h-4' />
								Account
							</TabsTrigger>
							<TabsTrigger
								value='danger'
								className='flex items-center gap-2'>
								<Shield className='w-4 h-4' />
								Danger Zone
							</TabsTrigger>
						</TabsList>

						{/* Profile Tab Content */}
						<TabsContent
							value='profile'
							className='mt-6'>
							<form
								onSubmit={handleProfileSubmit}
								className='space-y-6'>
								{/* Profile Picture */}
								<div className='flex items-center gap-6'>
									<div className='relative'>
										<Avatar className='w-20 h-20'>
											<AvatarImage
												src={
													profileForm.profilePicture
														? previewUrl || URL.createObjectURL(profileForm.profilePicture)
														: user?.profilePicture || undefined
												}
												alt={user?.fullName || 'Profile picture'}
											/>
											<AvatarFallback className='text-lg'>
												{user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
											</AvatarFallback>
										</Avatar>

										{/* Upload overlay */}
										{isUploadingPicture && (
											<div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center'>
												<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white'></div>
											</div>
										)}

										<label
											htmlFor='profile-picture'
											className={`absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors ${
												isUploadingPicture ? 'opacity-50 cursor-not-allowed' : ''
											}`}>
											<Camera className='w-3 h-3' />
										</label>
										<input
											id='profile-picture'
											type='file'
											accept='image/*'
											onChange={handleFileChange}
											disabled={isUploadingPicture}
											className='hidden'
										/>
									</div>
									<div className='flex-1'>
										<h3 className='font-medium'>Profile Picture</h3>
										<p className='text-sm text-muted-foreground mb-2'>
											Upload a new profile picture (JPG, PNG, WebP up to 5MB)
										</p>
										{profileForm.profilePicture && (
											<div className='flex items-center gap-2 text-sm text-green-600'>
												<div className='w-2 h-2 bg-green-500 rounded-full'></div>
												<span>New image selected</span>
											</div>
										)}
										{isUploadingPicture && (
											<div className='flex items-center gap-2 text-sm text-blue-600'>
												<div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
												<span>Uploading to Cloudinary...</span>
											</div>
										)}
									</div>
								</div>

								{/* Full Name */}
								<div className='space-y-2'>
									<Label htmlFor='fullName'>Full Name *</Label>
									<Input
										id='fullName'
										value={profileForm.fullName}
										onChange={e => handleProfileInputChange('fullName', e.target.value)}
										placeholder='Enter your full name'
										required
									/>
								</div>

								{/* Bio */}
								<div className='space-y-2'>
									<Label htmlFor='bio'>Bio</Label>
									<Textarea
										id='bio'
										value={profileForm.bio}
										onChange={e => handleProfileInputChange('bio', e.target.value)}
										placeholder='Tell us about yourself and your nutrition expertise...'
										rows={4}
									/>
									<p className='text-sm text-muted-foreground'>
										Share your background, expertise, and approach to nutrition (optional)
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
											<span>
												{user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>

								{/* Submit Button */}
								<div className='flex justify-end'>
									<Button
										type='submit'
										disabled={updateProfile.isPending || isUploadingPicture}>
										{updateProfile.isPending || isUploadingPicture ? (
											<>
												{isUploadingPicture ? (
													<>
														<Save className='w-4 h-4 mr-2 animate-spin' />
														Uploading...
													</>
												) : (
													<>
														<Save className='w-4 h-4 mr-2 animate-spin' />
														Saving...
													</>
												)}
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
						</TabsContent>

						{/* Account Tab Content */}
						<TabsContent
							value='account'
							className='mt-6 space-y-6'>
							{/* Email Settings */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Mail className='w-5 h-5 text-muted-foreground' />
										Change Email Address
									</CardTitle>
								</CardHeader>
								<CardContent>
									<form
										onSubmit={handleEmailSubmit}
										className='space-y-4'>
										<div className='space-y-2'>
											<Label htmlFor='email'>New Email Address</Label>
											<Input
												id='email'
												type='email'
												value={emailForm.email}
												onChange={e => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
												placeholder='Enter new email address'
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='email-password'>Current Password</Label>
											<PasswordInput
												id='email-password'
												value={emailForm.password}
												onChange={e =>
													setEmailForm(prev => ({ ...prev, password: e.target.value }))
												}
												placeholder='Enter your current password'
												required
											/>
											<p className='text-sm text-muted-foreground'>
												Enter your current password to confirm the change
											</p>
										</div>
										<div className='flex justify-end'>
											<Button
												type='submit'
												disabled={updateEmail.isPending}>
												{updateEmail.isPending ? (
													<>
														<Save className='w-4 h-4 mr-2 animate-spin' />
														Updating...
													</>
												) : (
													<>
														<Save className='w-4 h-4 mr-2' />
														Update Email
													</>
												)}
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>

							{/* Password Settings */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Lock className='w-5 h-5 text-muted-foreground' />
										Change Password
									</CardTitle>
								</CardHeader>
								<CardContent>
									<form
										onSubmit={handlePasswordSubmit}
										className='space-y-4'>
										<div className='space-y-2'>
											<Label htmlFor='current-password'>Current Password</Label>
											<PasswordInput
												id='current-password'
												value={passwordForm.currentPassword}
												onChange={e =>
													setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))
												}
												placeholder='Enter your current password'
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='new-password'>New Password</Label>
											<PasswordInput
												id='new-password'
												value={passwordForm.newPassword}
												onChange={e =>
													setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))
												}
												placeholder='Enter new password'
												required
											/>
											<div className='space-y-2'>
												<p className='text-sm text-muted-foreground'>
													Password must be at least 8 characters long and contain letters and
													numbers
												</p>
												{passwordForm.newPassword && (
													<div className='flex items-center gap-2'>
														<div className='flex gap-1'>
															{[1, 2, 3, 4, 5].map(level => (
																<div
																	key={level}
																	className={`w-2 h-2 rounded-full ${
																		level <= passwordStrength.strength
																			? passwordStrength.color.replace('text-', 'bg-')
																			: 'bg-muted'
																	}`}
																/>
															))}
														</div>
														<span className={`text-sm ${passwordStrength.color}`}>
															{passwordStrength.label}
														</span>
													</div>
												)}
											</div>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='confirm-password'>Confirm New Password</Label>
											<PasswordInput
												id='confirm-password'
												value={passwordForm.confirmPassword}
												onChange={e =>
													setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))
												}
												placeholder='Confirm new password'
												required
											/>
											{passwordForm.confirmPassword && (
												<div className='flex items-center gap-2'>
													{passwordForm.newPassword === passwordForm.confirmPassword ? (
														<>
															<div className='w-2 h-2 bg-green-500 rounded-full'></div>
															<span className='text-sm text-green-600'>Passwords match</span>
														</>
													) : (
														<>
															<div className='w-2 h-2 bg-red-500 rounded-full'></div>
															<span className='text-sm text-red-600'>Passwords do not match</span>
														</>
													)}
												</div>
											)}
										</div>
										<div className='flex justify-end'>
											<Button
												type='submit'
												disabled={updatePassword.isPending}>
												{updatePassword.isPending ? (
													<>
														<Save className='w-4 h-4 mr-2 animate-spin' />
														Updating...
													</>
												) : (
													<>
														<Save className='w-4 h-4 mr-2' />
														Update Password
													</>
												)}
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>

							{/* Security Info */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Shield className='w-5 h-5 text-muted-foreground' />
										Security Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3 text-sm'>
										<div className='flex items-center justify-between'>
											<span className='text-muted-foreground'>Account Type</span>
											<Badge
												variant='secondary'
												className='flex items-center'>
												<Shield className='w-3 h-3 mr-1' />
												{session?.user?.role || 'Nutritionist'}
											</Badge>
										</div>
										<div className='flex items-center justify-between'>
											<span className='text-muted-foreground'>Last Login</span>
											<span>Recently</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Danger Zone Tab */}
						<TabsContent
							value='danger'
							className='space-y-6'>
							<Card className='border-destructive/50'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2 text-destructive'>
										<Shield className='w-5 h-5' />
										Danger Zone
									</CardTitle>
									<CardDescription>Irreversible and destructive actions</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										<div className='flex items-center justify-between p-4 border border-destructive/20 rounded-lg'>
											<div>
												<h4 className='font-medium text-destructive'>Delete Account</h4>
												<p className='text-sm text-muted-foreground'>
													Permanently delete your account and all associated data. This action
													cannot be undone.
												</p>
											</div>
											<DeleteAccountDialog userRole='Nutritionist'>
												<Button
													variant='destructive'
													size='sm'>
													Delete Account
												</Button>
											</DeleteAccountDialog>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
