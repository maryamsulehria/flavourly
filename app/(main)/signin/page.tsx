'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSignIn } from '@/lib/hooks/use-auth';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignInPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [selectedRole, setSelectedRole] = useState('user');
	const [errors, setErrors] = useState<Record<string, string>>({});

	const signInMutation = useSignIn();

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
		if (signInMutation.error) {
			signInMutation.reset();
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
			} else if (value.length < 1) {
				setErrors(prev => ({ ...prev, password: 'Password cannot be empty' }));
			} else {
				setErrors(prev => ({ ...prev, password: '' }));
			}
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

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
		} else if (formData.password.length < 1) {
			newErrors.password = 'Password cannot be empty';
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

		signInMutation.mutate(formData);
	};

	// Get user-friendly error message from mutation error
	const getErrorMessage = () => {
		if (!signInMutation.error) return null;

		// The error message is already processed by the auth hook
		return signInMutation.error.message;
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-background px-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-center'>Sign In</CardTitle>
					<CardDescription className='text-center'>
						Enter your credentials to access your account
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
										placeholder='Enter your password'
										value={formData.password}
										onChange={handleChange}
										required
										aria-invalid={!!errors.password}
									/>
									{errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
								</div>
								<ErrorDisplay
									error={getErrorMessage()}
									title={getErrorMessage() ? 'Sign In Failed' : undefined}
									variant='destructive'
									dismissible={true}
									onDismiss={() => signInMutation.reset()}
								/>
								<Button
									type='submit'
									className='w-full'
									disabled={signInMutation.isPending}>
									{signInMutation.isPending ? (
										<>
											<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
											Signing in...
										</>
									) : (
										'Sign In as Recipe Developer'
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
										placeholder='Enter your password'
										value={formData.password}
										onChange={handleChange}
										required
										aria-invalid={!!errors.password}
									/>
									{errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
								</div>
								<ErrorDisplay
									error={getErrorMessage()}
									title={getErrorMessage() ? 'Sign In Failed' : undefined}
									variant='destructive'
									dismissible={true}
									onDismiss={() => signInMutation.reset()}
								/>
								<Button
									type='submit'
									className='w-full'
									disabled={signInMutation.isPending}>
									{signInMutation.isPending ? (
										<>
											<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
											Signing in...
										</>
									) : (
										'Sign In as Nutritionist'
									)}
								</Button>
							</form>
						</TabsContent>
					</Tabs>

					<div className='mt-4 text-center text-sm'>
						Don&apos;t have an account?{' '}
						<Link
							href='/signup'
							className='text-primary hover:underline'>
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
