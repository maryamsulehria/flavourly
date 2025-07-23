'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSignUp } from '@/lib/hooks/use-auth';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
		username: '',
		fullName: '',
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [selectedRole, setSelectedRole] = useState('user');

	const signUpMutation = useSignUp();

	// Redirect logged-in users to their appropriate dashboard
	useEffect(() => {
		if (status === 'authenticated' && session?.user) {
			const userRole = session.user.role;
			if (userRole === 'Nutritionist') {
				router.push('/nutritionist');
			} else {
				router.push('/dashboard');
			}
		}
	}, [session, status, router]);

	// Show loading state while checking authentication
	if (status === 'loading') {
		return (
			<div className='min-h-screen flex items-center justify-center bg-background'>
				<div className='text-center'>
					<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-muted-foreground'>Loading...</p>
				</div>
			</div>
		);
	}

	// Don't render the form if user is already authenticated
	if (status === 'authenticated') {
		return null;
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));

		// Clear mutation error when user starts typing
		if (signUpMutation.error) {
			signUpMutation.reset();
		}

		// Real-time validation for full name
		if (name === 'fullName') {
			if (!value.trim()) {
				setErrors(prev => ({ ...prev, fullName: 'Full name is required' }));
			} else if (value.trim().length < 2) {
				setErrors(prev => ({ ...prev, fullName: 'Full name must be at least 2 characters' }));
			} else if (value.trim().length > 100) {
				setErrors(prev => ({ ...prev, fullName: 'Full name is too long' }));
			} else {
				setErrors(prev => ({ ...prev, fullName: '' }));
			}
		}

		// Real-time validation for username
		if (name === 'username') {
			if (!value.trim()) {
				setErrors(prev => ({ ...prev, username: 'Username is required' }));
			} else if (value.length < 3) {
				setErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
			} else if (value.length > 30) {
				setErrors(prev => ({ ...prev, username: 'Username must be less than 30 characters' }));
			} else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
				setErrors(prev => ({
					...prev,
					username: 'Username can only contain letters, numbers, and underscores',
				}));
			} else {
				setErrors(prev => ({ ...prev, username: '' }));
			}
		}

		// Real-time validation for email
		if (name === 'email') {
			if (!value.trim()) {
				setErrors(prev => ({ ...prev, email: 'Email is required' }));
			} else if (!/\S+@\S+\.\S+/.test(value)) {
				setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
			} else if (value.length > 254) {
				setErrors(prev => ({ ...prev, email: 'Email address is too long' }));
			} else {
				setErrors(prev => ({ ...prev, email: '' }));
			}
		}

		// Real-time validation for password
		if (name === 'password') {
			if (!value) {
				setErrors(prev => ({ ...prev, password: 'Password is required' }));
			} else if (value.length < 8) {
				setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters long' }));
			} else if (value.length > 128) {
				setErrors(prev => ({ ...prev, password: 'Password is too long' }));
			} else {
				const hasLetters = /[a-zA-Z]/.test(value);
				const hasNumbers = /\d/.test(value);
				if (!hasLetters || !hasNumbers) {
					setErrors(prev => ({
						...prev,
						password: 'Password must contain both letters and numbers',
					}));
				} else {
					setErrors(prev => ({ ...prev, password: '' }));
				}
			}
		}

		// Real-time validation for confirm password
		if (name === 'confirmPassword') {
			if (!value) {
				setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
			} else if (formData.password !== value) {
				setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
			} else {
				setErrors(prev => ({ ...prev, confirmPassword: '' }));
			}
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		// Full name validation
		if (!formData.fullName.trim()) {
			newErrors.fullName = 'Full name is required';
		} else if (formData.fullName.trim().length < 2) {
			newErrors.fullName = 'Full name must be at least 2 characters';
		} else if (formData.fullName.trim().length > 100) {
			newErrors.fullName = 'Full name is too long';
		}

		// Username validation
		if (!formData.username.trim()) {
			newErrors.username = 'Username is required';
		} else if (formData.username.length < 3) {
			newErrors.username = 'Username must be at least 3 characters';
		} else if (formData.username.length > 30) {
			newErrors.username = 'Username must be less than 30 characters';
		} else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
			newErrors.username = 'Username can only contain letters, numbers, and underscores';
		}

		// Email validation
		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address';
		} else if (formData.email.length > 254) {
			newErrors.email = 'Email address is too long';
		}

		// Password validation
		if (!formData.password) {
			newErrors.password = 'Password is required';
		} else if (formData.password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters long';
		} else if (formData.password.length > 128) {
			newErrors.password = 'Password is too long';
		} else {
			const hasLetters = /[a-zA-Z]/.test(formData.password);
			const hasNumbers = /\d/.test(formData.password);
			if (!hasLetters || !hasNumbers) {
				newErrors.password = 'Password must contain both letters and numbers';
			}
		}

		// Confirm password validation
		if (!formData.confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your password';
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Clear previous errors
		setErrors({});

		if (!validateForm()) {
			return;
		}

		const role = selectedRole === 'user' ? 'RecipeDeveloper' : 'Nutritionist';

		signUpMutation.mutate({
			email: formData.email,
			password: formData.password,
			username: formData.username,
			fullName: formData.fullName,
			role,
		});
	};

	// Get user-friendly error message from mutation error
	const getErrorMessage = () => {
		if (!signUpMutation.error) return null;

		// The error message is already processed by the auth hook
		return signUpMutation.error.message;
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-background px-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-center'>Create Account</CardTitle>
					<CardDescription className='text-center'>
						Enter your information to create a new account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs
						value={selectedRole}
						onValueChange={setSelectedRole}
						className='w-full'>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger value='user'>Recipe Developer</TabsTrigger>
							<TabsTrigger value='nutritionist'>Nutritionist</TabsTrigger>
						</TabsList>

						<TabsContent
							value='user'
							className='space-y-4'>
							<form
								onSubmit={handleSubmit}
								className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='fullName'>Full Name</Label>
									<Input
										id='fullName'
										name='fullName'
										type='text'
										placeholder='John Doe'
										value={formData.fullName}
										onChange={handleChange}
										required
										aria-invalid={!!errors.fullName}
									/>
									{errors.fullName && <p className='text-sm text-red-500'>{errors.fullName}</p>}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='username'>Username</Label>
									<Input
										id='username'
										name='username'
										type='text'
										placeholder='john_doe'
										value={formData.username}
										onChange={handleChange}
										required
										aria-invalid={!!errors.username}
									/>
									{errors.username && <p className='text-sm text-red-500'>{errors.username}</p>}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										name='email'
										type='email'
										placeholder='john@example.com'
										value={formData.email}
										onChange={handleChange}
										required
										aria-invalid={!!errors.email}
									/>
									{errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='password'>Password</Label>
									<PasswordInput
										id='password'
										name='password'
										placeholder='Create a password'
										value={formData.password}
										onChange={handleChange}
										required
										aria-invalid={!!errors.password}
									/>
									<p className='text-sm text-muted-foreground'>
										Password must be at least 8 characters long and contain letters and numbers
									</p>
									{errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='confirmPassword'>Confirm Password</Label>
									<PasswordInput
										id='confirmPassword'
										name='confirmPassword'
										placeholder='Confirm your password'
										value={formData.confirmPassword}
										onChange={handleChange}
										required
										aria-invalid={!!errors.confirmPassword}
									/>
									{errors.confirmPassword && (
										<p className='text-sm text-red-500'>{errors.confirmPassword}</p>
									)}
								</div>

								<ErrorDisplay
									error={getErrorMessage()}
									title={getErrorMessage() ? 'Account Creation Failed' : undefined}
									variant='destructive'
									dismissible={true}
									onDismiss={() => signUpMutation.reset()}
								/>

								<Button
									type='submit'
									className='w-full'
									disabled={signUpMutation.isPending}>
									{signUpMutation.isPending ? (
										<>
											<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
											Creating account...
										</>
									) : (
										'Create Recipe Developer Account'
									)}
								</Button>
							</form>
						</TabsContent>

						<TabsContent
							value='nutritionist'
							className='space-y-4'>
							<form
								onSubmit={handleSubmit}
								className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='nutritionist-fullName'>Full Name</Label>
									<Input
										id='nutritionist-fullName'
										name='fullName'
										type='text'
										placeholder='John Doe'
										value={formData.fullName}
										onChange={handleChange}
										required
										aria-invalid={!!errors.fullName}
									/>
									{errors.fullName && <p className='text-sm text-red-500'>{errors.fullName}</p>}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='nutritionist-username'>Username</Label>
									<Input
										id='nutritionist-username'
										name='username'
										type='text'
										placeholder='john_doe'
										value={formData.username}
										onChange={handleChange}
										required
										aria-invalid={!!errors.username}
									/>
									{errors.username && <p className='text-sm text-red-500'>{errors.username}</p>}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='nutritionist-email'>Email</Label>
									<Input
										id='nutritionist-email'
										name='email'
										type='email'
										placeholder='john@example.com'
										value={formData.email}
										onChange={handleChange}
										required
										aria-invalid={!!errors.email}
									/>
									{errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='nutritionist-password'>Password</Label>
									<PasswordInput
										id='nutritionist-password'
										name='password'
										placeholder='Create a password'
										value={formData.password}
										onChange={handleChange}
										required
										aria-invalid={!!errors.password}
									/>
									<p className='text-sm text-muted-foreground'>
										Password must be at least 8 characters long and contain letters and numbers
									</p>
									{errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='nutritionist-confirmPassword'>Confirm Password</Label>
									<PasswordInput
										id='nutritionist-confirmPassword'
										name='confirmPassword'
										placeholder='Confirm your password'
										value={formData.confirmPassword}
										onChange={handleChange}
										required
										aria-invalid={!!errors.confirmPassword}
									/>
									{errors.confirmPassword && (
										<p className='text-sm text-red-500'>{errors.confirmPassword}</p>
									)}
								</div>

								<ErrorDisplay
									error={getErrorMessage()}
									title={getErrorMessage() ? 'Account Creation Failed' : undefined}
									variant='destructive'
									dismissible={true}
									onDismiss={() => signUpMutation.reset()}
								/>

								<Button
									type='submit'
									className='w-full'
									disabled={signUpMutation.isPending}>
									{signUpMutation.isPending ? (
										<>
											<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
											Creating account...
										</>
									) : (
										'Create Nutritionist Account'
									)}
								</Button>
							</form>
						</TabsContent>
					</Tabs>

					<div className='mt-4 text-center text-sm'>
						Already have an account?{' '}
						<Link
							href='/signin'
							className='text-primary hover:underline'>
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
