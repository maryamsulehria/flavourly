import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SignInData {
	email: string;
	password: string;
}

interface SignUpData {
	email: string;
	password: string;
	username: string;
	fullName: string;
	role: string;
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(error: string): string {
	const errorMessages: Record<string, string> = {
		// Sign In Errors
		CredentialsSignin: 'Invalid email or password. Please check your credentials and try again.',
		'No user found with this email':
			'No account found with this email address. Please check your email or create a new account.',
		'Invalid password': 'Incorrect password. Please try again.',
		'User not found':
			'No account found with this email address. Please check your email or create a new account.',
		'Invalid credentials':
			'Invalid email or password. Please check your credentials and try again.',
		'Email and password are required': 'Please enter both email and password.',

		// Sign Up Errors
		'User with this email or username already exists':
			'An account with this email or username already exists. Please try signing in instead.',
		'Username and full name are required for registration': 'Please fill in all required fields.',
		'Role not found. Please seed the database first.':
			'System configuration error. Please contact support.',
		'Password must be at least 8 characters long': 'Password must be at least 8 characters long.',
		'Password must contain both letters and numbers':
			'Password must contain both letters and numbers.',
		'Email already exists':
			'An account with this email already exists. Please try signing in instead.',
		'Username already exists': 'This username is already taken. Please choose a different one.',

		// Network and System Errors
		'Network error': 'Connection error. Please check your internet connection and try again.',
		fetch: 'Connection error. Please check your internet connection and try again.',
		'Failed to fetch': 'Connection error. Please check your internet connection and try again.',
		NetworkError: 'Connection error. Please check your internet connection and try again.',
		ECONNREFUSED: 'Unable to connect to the server. Please try again later.',
		ENOTFOUND: 'Unable to connect to the server. Please check your internet connection.',

		// Database Errors
		'Database connection error': 'Unable to connect to the database. Please try again later.',
		'Database error': 'Database error. Please try again later.',
		P2002: 'An account with this email or username already exists.',
		P2025: 'User not found.',
		P2014: 'Database constraint violation. Please try again.',

		// Validation Errors
		'Invalid email format': 'Please enter a valid email address.',
		'Email is required': 'Email address is required.',
		'Password is required': 'Password is required.',
		'Username is required': 'Username is required.',
		'Full name is required': 'Full name is required.',

		// Default fallback
		default: 'An unexpected error occurred. Please try again.',
	};

	// Check for exact matches first
	if (errorMessages[error]) {
		return errorMessages[error];
	}

	// Special handling for CredentialsSignin - provide a more helpful message
	if (error === 'CredentialsSignin') {
		return 'Invalid email or password. Please check your credentials and try again.';
	}

	// Check for partial matches (case-insensitive)
	for (const [key, message] of Object.entries(errorMessages)) {
		if (key !== 'default' && error.toLowerCase().includes(key.toLowerCase())) {
			return message;
		}
	}

	// Return the original error if no match found, but clean it up
	const cleanError = error
		.replace(/^Error: /, '')
		.replace(/\[.*?\]/, '')
		.trim();
	return cleanError || errorMessages.default;
}

export function useSignIn() {
	const router = useRouter();

	return useMutation({
		mutationFn: async (data: SignInData) => {
			try {
				const result = await signIn('credentials', {
					email: data.email,
					password: data.password,
					action: 'signin',
					redirect: false,
				});

				if (result?.error) {
					throw new Error(result.error);
				}

				return result;
			} catch (error) {
				// Handle network errors
				if (error instanceof TypeError && error.message.includes('fetch')) {
					throw new Error('Network error');
				}

				// Re-throw the error with a user-friendly message
				const errorMessage = error instanceof Error ? error.message : String(error);
				throw new Error(getAuthErrorMessage(errorMessage));
			}
		},
		onSuccess: result => {
			if (result?.ok) {
				toast.success('Welcome back! Redirecting to your dashboard...');
				// After successful signin, we need to get the user's role
				// We'll redirect to a temporary page that will handle the role-based redirect
				router.push('/auth-redirect');
			}
		},
		onError: (error: Error) => {
			// Error is now handled by the form's ErrorDisplay component
			// No need to show toast here
		},
	});
}

export function useSignUp() {
	const router = useRouter();

	return useMutation({
		mutationFn: async (data: SignUpData) => {
			try {
				const result = await signIn('credentials', {
					email: data.email,
					password: data.password,
					username: data.username,
					fullName: data.fullName,
					role: data.role,
					action: 'signup',
					redirect: false,
				});

				if (result?.error) {
					throw new Error(result.error);
				}

				return result;
			} catch (error) {
				// Handle network errors
				if (error instanceof TypeError && error.message.includes('fetch')) {
					throw new Error('Network error');
				}

				// Re-throw the error with a user-friendly message
				const errorMessage = error instanceof Error ? error.message : String(error);
				throw new Error(getAuthErrorMessage(errorMessage));
			}
		},
		onSuccess: result => {
			if (result?.ok) {
				toast.success('Account created successfully! Welcome to Flavourly!');
				// After successful signup, redirect to role-based redirect page
				router.push('/auth-redirect');
			}
		},
		onError: (error: Error) => {
			// Error is now handled by the form's ErrorDisplay component
			// No need to show toast here
		},
	});
}
