// Centralized error handling utility for consistent user-friendly error messages

export interface ErrorContext {
	action?: string;
	resource?: string;
	field?: string;
	value?: string;
}

// Common error patterns and their user-friendly messages
const ERROR_PATTERNS = {
	// Authentication errors
	CredentialsSignin: 'Invalid email or password. Please check your credentials and try again.',
	'User with this email or username already exists':
		'An account with this email or username already exists. Please try signing in instead.',
	'No user found with this email':
		'No account found with this email address. Please check your email or create a new account.',
	'Invalid password': 'Incorrect password. Please try again.',
	'Username and full name are required for registration': 'Please fill in all required fields.',
	'Role not found': 'System configuration error. Please contact support.',

	// Password validation errors
	'Password must be at least 8 characters long': 'Password must be at least 8 characters long.',
	'Password must contain both letters and numbers':
		'Password must contain both letters and numbers.',
	'Passwords do not match': 'Passwords do not match. Please try again.',

	// Network and connection errors
	'Network error': 'Connection error. Please check your internet connection and try again.',
	fetch: 'Connection error. Please check your internet connection and try again.',
	'Failed to fetch': 'Connection error. Please check your internet connection and try again.',
	'Network request failed':
		'Connection error. Please check your internet connection and try again.',

	// File upload errors
	'File too large': 'File size exceeds the maximum limit. Please choose a smaller file.',
	'Invalid file type': 'File type not supported. Please choose a valid image or video file.',
	'Upload failed': 'File upload failed. Please try again.',

	// Form validation errors
	'Required field': 'This field is required.',
	'Invalid email': 'Please enter a valid email address.',
	'Invalid format': 'Please check the format and try again.',

	// Database errors
	'Unique constraint': 'This information already exists. Please use different details.',
	'Foreign key constraint': 'Related information not found. Please refresh and try again.',
	'Database connection': 'Database connection error. Please try again later.',

	// Permission errors
	Unauthorized: 'You do not have permission to perform this action.',
	Forbidden: 'Access denied. Please contact support if you believe this is an error.',
	'Not found': 'The requested resource was not found.',

	// Rate limiting
	'Too many requests': 'Too many requests. Please wait a moment and try again.',
	'Rate limit exceeded': 'Rate limit exceeded. Please wait before trying again.',

	// Server errors
	'Internal server error': 'Something went wrong on our end. Please try again later.',
	'Server error': 'Server error. Please try again later.',
	'Service unavailable': 'Service temporarily unavailable. Please try again later.',

	// Default fallback
	default: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Converts technical error messages to user-friendly messages
 */
export function getUserFriendlyErrorMessage(error: string | Error, context?: ErrorContext): string {
	const errorMessage = typeof error === 'string' ? error : error.message;

	// Check for exact matches first
	if (ERROR_PATTERNS[errorMessage as keyof typeof ERROR_PATTERNS]) {
		return ERROR_PATTERNS[errorMessage as keyof typeof ERROR_PATTERNS];
	}

	// Check for partial matches
	for (const [pattern, message] of Object.entries(ERROR_PATTERNS)) {
		if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
			return message;
		}
	}

	// If no match found, return a contextual message or the original error
	if (context?.action && context?.resource) {
		return `Failed to ${context.action} ${context.resource}. Please try again.`;
	}

	return errorMessage || ERROR_PATTERNS.default;
}

/**
 * Creates a standardized error object for consistent error handling
 */
export function createError(message: string, context?: ErrorContext, originalError?: Error): Error {
	const userFriendlyMessage = getUserFriendlyErrorMessage(message, context);
	const error = new Error(userFriendlyMessage);

	// Preserve original error information for debugging
	if (originalError) {
		(error as any).originalError = originalError;
		(error as any).originalMessage = originalError.message;
	}

	// Add context information
	if (context) {
		(error as any).context = context;
	}

	return error;
}

/**
 * Handles API errors and converts them to user-friendly messages
 */
export function handleApiError(response: Response, context?: ErrorContext): Promise<never> {
	return response
		.json()
		.then(errorData => {
			const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
			throw createError(errorMessage, context);
		})
		.catch(() => {
			// If JSON parsing fails, create a generic error based on status code
			let message = 'An error occurred while processing your request.';

			switch (response.status) {
				case 400:
					message = 'Invalid request. Please check your input and try again.';
					break;
				case 401:
					message = 'Please sign in to continue.';
					break;
				case 403:
					message = 'You do not have permission to perform this action.';
					break;
				case 404:
					message = 'The requested resource was not found.';
					break;
				case 429:
					message = 'Too many requests. Please wait a moment and try again.';
					break;
				case 500:
					message = 'Server error. Please try again later.';
					break;
				case 503:
					message = 'Service temporarily unavailable. Please try again later.';
					break;
			}

			throw createError(message, context);
		});
}

/**
 * Validates form data and returns user-friendly error messages
 */
export function validateFormField(
	value: string,
	fieldName: string,
	rules: {
		required?: boolean;
		minLength?: number;
		maxLength?: number;
		pattern?: RegExp;
		patternMessage?: string;
		custom?: (value: string) => string | null;
	},
): string | null {
	const { required, minLength, maxLength, pattern, patternMessage, custom } = rules;

	// Required validation
	if (required && (!value || value.trim().length === 0)) {
		return `${fieldName} is required.`;
	}

	// Skip other validations if value is empty and not required
	if (!value || value.trim().length === 0) {
		return null;
	}

	// Length validations
	if (minLength && value.length < minLength) {
		return `${fieldName} must be at least ${minLength} characters long.`;
	}

	if (maxLength && value.length > maxLength) {
		return `${fieldName} must be no more than ${maxLength} characters long.`;
	}

	// Pattern validation
	if (pattern && !pattern.test(value)) {
		return patternMessage || `${fieldName} format is invalid.`;
	}

	// Custom validation
	if (custom) {
		const customError = custom(value);
		if (customError) {
			return customError;
		}
	}

	return null;
}

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
	username: /^[a-zA-Z0-9_]{3,20}$/,
	phone: /^\+?[\d\s\-\(\)]{10,}$/,
} as const;

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
	email: {
		required: true,
		pattern: VALIDATION_PATTERNS.email,
		patternMessage: 'Please enter a valid email address.',
	},
	password: {
		required: true,
		minLength: 8,
		pattern: VALIDATION_PATTERNS.password,
		patternMessage: 'Password must contain at least 8 characters with letters and numbers.',
	},
	username: {
		required: true,
		minLength: 3,
		maxLength: 20,
		pattern: VALIDATION_PATTERNS.username,
		patternMessage: 'Username must be 3-20 characters with letters, numbers, and underscores only.',
	},
	fullName: {
		required: true,
		minLength: 2,
		maxLength: 50,
	},
} as const;
