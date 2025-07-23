'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useUpdateEmail, useUpdatePassword, useUser } from '@/lib/hooks/use-user';
import { ArrowLeft, Lock, Mail, Save, Shield } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AccountSettingsPage() {
	const { data: user, isLoading } = useUser();
	const updateEmail = useUpdateEmail();
	const updatePassword = useUpdatePassword();

	const [emailForm, setEmailForm] = useState({
		email: '',
		password: '',
	});

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	// Initialize email form when user data loads
	useEffect(() => {
		if (user && !emailForm.email) {
			setEmailForm(prev => ({ ...prev, email: user.email }));
		}
	}, [user, emailForm.email]);

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!emailForm.email.trim() || !emailForm.password) {
			toast.error('Please fill in all fields');
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

			// Clear password field
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

		try {
			await updatePassword.mutateAsync({
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword,
			});

			// Clear form
			setPasswordForm({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
		} catch (error) {
			toast.error('Failed to update password. Please check your current password and try again.');
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
				<div className='space-y-4'>
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
								<div className='h-4 w-24 bg-muted rounded animate-pulse' />
								<div className='h-10 w-full bg-muted rounded animate-pulse' />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div className='h-6 w-32 bg-muted rounded animate-pulse' />
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<div className='h-4 w-32 bg-muted rounded animate-pulse' />
								<div className='h-10 w-full bg-muted rounded animate-pulse' />
							</div>
							<div className='space-y-2'>
								<div className='h-4 w-28 bg-muted rounded animate-pulse' />
								<div className='h-10 w-full bg-muted rounded animate-pulse' />
							</div>
							<div className='space-y-2'>
								<div className='h-4 w-32 bg-muted rounded animate-pulse' />
								<div className='h-10 w-full bg-muted rounded animate-pulse' />
							</div>
						</CardContent>
					</Card>
				</div>
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
					<h1 className='text-3xl font-bold tracking-tight'>Account Settings</h1>
					<p className='text-muted-foreground'>Manage your account security</p>
				</div>
			</div>

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
								onChange={e => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
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
								onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
								placeholder='Enter new password'
								required
							/>
							<p className='text-sm text-muted-foreground'>
								Password must be at least 8 characters long
							</p>
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
							<span>{user?.createdAt && new Date(user.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
