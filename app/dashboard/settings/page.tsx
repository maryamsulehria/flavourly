'use client';

import { DeleteAccountDialog } from '@/components/delete-account-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
	useUpdateDietaryPreferences,
	useUpdateEmail,
	useUpdatePassword,
	useUpdateProfile,
	useUser,
} from '@/lib/hooks/use-user';
import {
	ArrowLeft,
	Camera,
	Lock,
	Mail,
	Save,
	Settings,
	Shield,
	User,
	Utensils,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DietaryPreferences {
	dietaryRestrictions: string[];
	allergies: string[];
	cuisinePreferences: string[];
	cookingSkill: string;
	spiceTolerance: string;
	mealSize: string;
}

const DIETARY_RESTRICTIONS = [
	'Vegetarian',
	'Vegan',
	'Gluten-Free',
	'Dairy-Free',
	'Keto',
	'Low-Carb',
	'Paleo',
	'Low-Sodium',
	'Low-Fat',
	'High-Protein',
	'Low-Calorie',
	'Nut-Free',
	'Soy-Free',
	'Egg-Free',
	'Shellfish-Free',
];

const ALLERGIES = [
	'Peanuts',
	'Tree Nuts',
	'Milk',
	'Eggs',
	'Soy',
	'Wheat',
	'Fish',
	'Shellfish',
	'Sesame',
	'Mustard',
	'Celery',
	'Sulfites',
];

const CUISINE_PREFERENCES = [
	'Italian',
	'Mexican',
	'Asian',
	'Mediterranean',
	'American',
	'Indian',
	'Thai',
	'Chinese',
	'Japanese',
	'French',
	'Greek',
	'Spanish',
	'Middle Eastern',
	'Caribbean',
	'African',
];

const COOKING_SKILLS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const SPICE_TOLERANCE = ['Mild', 'Medium', 'Hot', 'Very Hot'];
const MEAL_SIZES = ['Small', 'Medium', 'Large'];

export default function SettingsPage() {
	const { data: user, isLoading } = useUser();
	const updateProfile = useUpdateProfile();
	const updateEmail = useUpdateEmail();
	const updatePassword = useUpdatePassword();
	const updateDietaryPreferences = useUpdateDietaryPreferences();

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

	// Dietary preferences state
	const [preferences, setPreferences] = useState<DietaryPreferences>({
		dietaryRestrictions: [],
		allergies: [],
		cuisinePreferences: [],
		cookingSkill: '',
		spiceTolerance: '',
		mealSize: '',
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

			// Initialize dietary preferences
			if (!preferences.cookingSkill) {
				setPreferences({
					dietaryRestrictions: user.dietaryRestrictions || [],
					allergies: user.allergies || [],
					cuisinePreferences: user.cuisinePreferences || [],
					cookingSkill: user.cookingSkill || '',
					spiceTolerance: user.spiceTolerance || '',
					mealSize: user.mealSize || '',
				});
			}
		}
	}, [user, profileForm.fullName, emailForm.email, preferences.cookingSkill]);

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

			// Create preview URL
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		}
	};

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!profileForm.fullName.trim()) {
			toast.error('Full name is required');
			return;
		}

		setIsUploadingPicture(!!profileForm.profilePicture);

		try {
			await updateProfile.mutateAsync({
				fullName: profileForm.fullName.trim(),
				bio: profileForm.bio.trim() || undefined,
				profilePicture: profileForm.profilePicture,
			});

			// Clear preview URL after successful upload
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
				setPreviewUrl(null);
			}

			toast.success('Profile updated successfully');
		} catch (error) {
			toast.error('Failed to update profile. Please try again.');
		} finally {
			setIsUploadingPicture(false);
		}
	};

	// Account handlers
	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!emailForm.email.trim() || !emailForm.password) {
			toast.error('Please fill in all fields');
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailForm.email.trim())) {
			toast.error('Please enter a valid email address');
			return;
		}

		if (emailForm.email === user?.email) {
			toast.info('Email address is the same as current');
			return;
		}

		try {
			await updateEmail.mutateAsync({
				email: emailForm.email.trim(),
				password: emailForm.password,
			});
			setEmailForm(prev => ({ ...prev, password: '' }));
		} catch (error) {
			toast.error('Failed to update email. Please check your password and try again.');
		}
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!passwordForm.currentPassword ||
			!passwordForm.newPassword ||
			!passwordForm.confirmPassword
		) {
			toast.error('Please fill in all fields');
			return;
		}

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast.error('New passwords do not match');
			return;
		}

		if (passwordForm.newPassword.length < 8) {
			toast.error('Password must be at least 8 characters long');
			return;
		}

		// Additional password strength validation
		const hasLetters = /[a-zA-Z]/.test(passwordForm.newPassword);
		const hasNumbers = /\d/.test(passwordForm.newPassword);

		if (!hasLetters || !hasNumbers) {
			toast.error('Password must contain both letters and numbers');
			return;
		}

		try {
			await updatePassword.mutateAsync({
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword,
			});
			setPasswordForm({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
		} catch (error) {
			toast.error('Failed to update password. Please check your current password and try again.');
		}
	};

	// Password strength indicator
	const getPasswordStrength = (password: string) => {
		if (!password) return { strength: 0, label: '', color: 'text-muted-foreground' };

		let score = 0;
		if (password.length >= 8) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^a-zA-Z0-9]/.test(password)) score++;

		if (score <= 2) return { strength: score, label: 'Weak', color: 'text-red-500' };
		if (score <= 3) return { strength: score, label: 'Fair', color: 'text-yellow-500' };
		if (score <= 4) return { strength: score, label: 'Good', color: 'text-blue-500' };
		return { strength: score, label: 'Strong', color: 'text-green-500' };
	};

	const passwordStrength = getPasswordStrength(passwordForm.newPassword);

	// Dietary preferences handlers
	const handleRestrictionToggle = (restriction: string) => {
		setPreferences(prev => ({
			...prev,
			dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
				? prev.dietaryRestrictions.filter(r => r !== restriction)
				: [...prev.dietaryRestrictions, restriction],
		}));
	};

	const handleAllergyToggle = (allergy: string) => {
		setPreferences(prev => ({
			...prev,
			allergies: prev.allergies.includes(allergy)
				? prev.allergies.filter(a => a !== allergy)
				: [...prev.allergies, allergy],
		}));
	};

	const handleCuisineToggle = (cuisine: string) => {
		setPreferences(prev => ({
			...prev,
			cuisinePreferences: prev.cuisinePreferences.includes(cuisine)
				? prev.cuisinePreferences.filter(c => c !== cuisine)
				: [...prev.cuisinePreferences, cuisine],
		}));
	};

	const handleDietarySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await updateDietaryPreferences.mutateAsync({
				dietaryRestrictions: preferences.dietaryRestrictions,
				allergies: preferences.allergies,
				cuisinePreferences: preferences.cuisinePreferences,
				cookingSkill: preferences.cookingSkill,
				spiceTolerance: preferences.spiceTolerance,
				mealSize: preferences.mealSize,
			});
		} catch (error) {
			// Error is handled by the mutation hook
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
						Back to Dashboard
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
					<Link href='/dashboard'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Dashboard
					</Link>
				</Button>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
					<p className='text-muted-foreground'>Manage your account and preferences</p>
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
						<TabsList className='grid w-full grid-cols-4'>
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
								value='dietary-preferences'
								className='flex items-center gap-2'>
								<Utensils className='w-4 h-4' />
								Dietary Preferences
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
										<div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
											<span className='text-muted-foreground'>Account Status</span>
											<span className='font-medium text-green-600'>Active</span>
										</div>
										<div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
											<span className='text-muted-foreground'>Account Created</span>
											<span>
												{user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Security Tips */}
							<Card>
								<CardHeader>
									<CardTitle className='text-base'>Security Tips</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-2 text-sm text-muted-foreground'>
										<div className='flex items-start gap-2'>
											<div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
											<span>Use a strong, unique password that you don't use elsewhere</span>
										</div>
										<div className='flex items-start gap-2'>
											<div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
											<span>Never share your password with anyone</span>
										</div>
										<div className='flex items-start gap-2'>
											<div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
											<span>Log out when using shared devices</span>
										</div>
										<div className='flex items-start gap-2'>
											<div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
											<span>Keep your email address up to date for account recovery</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Dietary Preferences Tab Content */}
						<TabsContent
							value='dietary-preferences'
							className='mt-6'>
							<form onSubmit={handleDietarySubmit}>
								<div className='space-y-6'>
									{/* Summary */}
									<Card>
										<CardHeader>
											<CardTitle>Your Preferences Summary</CardTitle>
										</CardHeader>
										<CardContent>
											<div className='space-y-4'>
												{preferences.dietaryRestrictions.length > 0 && (
													<div>
														<h4 className='font-medium text-sm mb-2'>Dietary Restrictions:</h4>
														<div className='flex flex-wrap gap-2'>
															{preferences.dietaryRestrictions.map(restriction => (
																<Badge
																	key={restriction}
																	variant='secondary'>
																	{restriction}
																</Badge>
															))}
														</div>
													</div>
												)}

												{preferences.allergies.length > 0 && (
													<div>
														<h4 className='font-medium text-sm mb-2'>Allergies:</h4>
														<div className='flex flex-wrap gap-2'>
															{preferences.allergies.map(allergy => (
																<Badge
																	key={allergy}
																	variant='destructive'>
																	{allergy}
																</Badge>
															))}
														</div>
													</div>
												)}

												{preferences.cuisinePreferences.length > 0 && (
													<div>
														<h4 className='font-medium text-sm mb-2'>Preferred Cuisines:</h4>
														<div className='flex flex-wrap gap-2'>
															{preferences.cuisinePreferences.map(cuisine => (
																<Badge
																	key={cuisine}
																	variant='outline'>
																	{cuisine}
																</Badge>
															))}
														</div>
													</div>
												)}

												{(preferences.cookingSkill ||
													preferences.spiceTolerance ||
													preferences.mealSize) && (
													<div>
														<h4 className='font-medium text-sm mb-2'>Cooking Preferences:</h4>
														<div className='flex flex-wrap gap-2'>
															{preferences.cookingSkill && (
																<Badge variant='outline'>Skill: {preferences.cookingSkill}</Badge>
															)}
															{preferences.spiceTolerance && (
																<Badge variant='outline'>Spice: {preferences.spiceTolerance}</Badge>
															)}
															{preferences.mealSize && (
																<Badge variant='outline'>Size: {preferences.mealSize}</Badge>
															)}
														</div>
													</div>
												)}

												{preferences.dietaryRestrictions.length === 0 &&
													preferences.allergies.length === 0 &&
													preferences.cuisinePreferences.length === 0 &&
													!preferences.cookingSkill &&
													!preferences.spiceTolerance &&
													!preferences.mealSize && (
														<p className='text-muted-foreground text-sm'>
															No preferences set yet. Select your preferences below to get
															personalized recipe recommendations.
														</p>
													)}
											</div>
										</CardContent>
									</Card>

									{/* Dietary Restrictions */}
									<Card>
										<CardHeader>
											<CardTitle className='flex items-center gap-2'>
												<Utensils className='w-5 h-5 text-muted-foreground' />
												Dietary Restrictions
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
												{DIETARY_RESTRICTIONS.map(restriction => (
													<div
														key={restriction}
														className='flex items-center space-x-2'>
														<Checkbox
															id={restriction}
															checked={preferences.dietaryRestrictions.includes(restriction)}
															onCheckedChange={() => handleRestrictionToggle(restriction)}
														/>
														<Label
															htmlFor={restriction}
															className='text-sm'>
															{restriction}
														</Label>
													</div>
												))}
											</div>
										</CardContent>
									</Card>

									{/* Allergies */}
									<Card>
										<CardHeader>
											<CardTitle>Food Allergies & Intolerances</CardTitle>
										</CardHeader>
										<CardContent>
											<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
												{ALLERGIES.map(allergy => (
													<div
														key={allergy}
														className='flex items-center space-x-2'>
														<Checkbox
															id={allergy}
															checked={preferences.allergies.includes(allergy)}
															onCheckedChange={() => handleAllergyToggle(allergy)}
														/>
														<Label
															htmlFor={allergy}
															className='text-sm'>
															{allergy}
														</Label>
													</div>
												))}
											</div>
										</CardContent>
									</Card>

									{/* Cuisine Preferences */}
									<Card>
										<CardHeader>
											<CardTitle>Cuisine Preferences</CardTitle>
										</CardHeader>
										<CardContent>
											<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
												{CUISINE_PREFERENCES.map(cuisine => (
													<div
														key={cuisine}
														className='flex items-center space-x-2'>
														<Checkbox
															id={cuisine}
															checked={preferences.cuisinePreferences.includes(cuisine)}
															onCheckedChange={() => handleCuisineToggle(cuisine)}
														/>
														<Label
															htmlFor={cuisine}
															className='text-sm'>
															{cuisine}
														</Label>
													</div>
												))}
											</div>
										</CardContent>
									</Card>

									{/* Cooking Preferences */}
									<Card>
										<CardHeader>
											<CardTitle>Cooking Preferences</CardTitle>
										</CardHeader>
										<CardContent className='space-y-6'>
											<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='cooking-skill'>Cooking Skill Level</Label>
													<Select
														value={preferences.cookingSkill}
														onValueChange={value =>
															setPreferences(prev => ({ ...prev, cookingSkill: value }))
														}>
														<SelectTrigger>
															<SelectValue placeholder='Select skill level' />
														</SelectTrigger>
														<SelectContent>
															{COOKING_SKILLS.map(skill => (
																<SelectItem
																	key={skill}
																	value={skill}>
																	{skill}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												<div className='space-y-2'>
													<Label htmlFor='spice-tolerance'>Spice Tolerance</Label>
													<Select
														value={preferences.spiceTolerance}
														onValueChange={value =>
															setPreferences(prev => ({ ...prev, spiceTolerance: value }))
														}>
														<SelectTrigger>
															<SelectValue placeholder='Select tolerance' />
														</SelectTrigger>
														<SelectContent>
															{SPICE_TOLERANCE.map(tolerance => (
																<SelectItem
																	key={tolerance}
																	value={tolerance}>
																	{tolerance}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												<div className='space-y-2'>
													<Label htmlFor='meal-size'>Preferred Meal Size</Label>
													<Select
														value={preferences.mealSize}
														onValueChange={value =>
															setPreferences(prev => ({ ...prev, mealSize: value }))
														}>
														<SelectTrigger>
															<SelectValue placeholder='Select meal size' />
														</SelectTrigger>
														<SelectContent>
															{MEAL_SIZES.map(size => (
																<SelectItem
																	key={size}
																	value={size}>
																	{size}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Submit Button */}
									<div className='flex justify-end'>
										<Button
											type='submit'
											disabled={updateDietaryPreferences.isPending}>
											{updateDietaryPreferences.isPending ? (
												<>
													<Save className='w-4 h-4 mr-2 animate-spin' />
													Saving...
												</>
											) : (
												<>
													<Save className='w-4 h-4 mr-2' />
													Save Preferences
												</>
											)}
										</Button>
									</div>
								</div>
							</form>
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
											<DeleteAccountDialog userRole='RecipeDeveloper'>
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
