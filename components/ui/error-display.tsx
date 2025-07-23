import { cn } from '@/lib/utils';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorDisplayProps {
	error?: string | Error | null;
	title?: string;
	variant?: 'default' | 'destructive' | 'warning';
	className?: string;
	dismissible?: boolean;
	onDismiss?: () => void;
}

export function ErrorDisplay({
	error,
	title = 'Error',
	variant = 'destructive',
	className,
	dismissible = false,
	onDismiss,
}: ErrorDisplayProps) {
	const [isVisible, setIsVisible] = useState(true);

	if (!error || !isVisible) {
		return null;
	}

	const errorMessage = typeof error === 'string' ? error : error.message;

	const handleDismiss = () => {
		setIsVisible(false);
		onDismiss?.();
	};

	const variantStyles = {
		default: 'bg-blue-50 border-blue-200 text-blue-800',
		destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
	};

	const iconStyles = {
		default: 'text-blue-600',
		destructive: 'text-destructive',
		warning: 'text-yellow-600',
	};

	return (
		<div
			className={cn(
				'p-3 border rounded-lg flex items-start gap-3',
				variantStyles[variant],
				className,
			)}>
			<AlertCircle className={cn('w-4 h-4 mt-0.5 flex-shrink-0', iconStyles[variant])} />
			<div className='flex-1 min-w-0'>
				<div className='flex items-center justify-between gap-2'>
					<span className='text-sm font-medium'>{title}</span>
					{dismissible && (
						<button
							onClick={handleDismiss}
							className='p-1 hover:bg-black/10 rounded transition-colors'
							aria-label='Dismiss error'>
							<X className='w-3 h-3' />
						</button>
					)}
				</div>
				<p className='text-sm mt-1 break-words'>{errorMessage}</p>
			</div>
		</div>
	);
}

interface SuccessDisplayProps {
	message: string;
	title?: string;
	className?: string;
	dismissible?: boolean;
	onDismiss?: () => void;
}

export function SuccessDisplay({
	message,
	title = 'Success',
	className,
	dismissible = false,
	onDismiss,
}: SuccessDisplayProps) {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) {
		return null;
	}

	const handleDismiss = () => {
		setIsVisible(false);
		onDismiss?.();
	};

	return (
		<div
			className={cn(
				'p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-start gap-3',
				className,
			)}>
			<svg
				className='w-4 h-4 mt-0.5 flex-shrink-0 text-green-600'
				fill='currentColor'
				viewBox='0 0 20 20'>
				<path
					fillRule='evenodd'
					d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
					clipRule='evenodd'
				/>
			</svg>
			<div className='flex-1 min-w-0'>
				<div className='flex items-center justify-between gap-2'>
					<span className='text-sm font-medium'>{title}</span>
					{dismissible && (
						<button
							onClick={handleDismiss}
							className='p-1 hover:bg-black/10 rounded transition-colors'
							aria-label='Dismiss success message'>
							<X className='w-3 h-3' />
						</button>
					)}
				</div>
				<p className='text-sm mt-1 break-words'>{message}</p>
			</div>
		</div>
	);
}

interface LoadingDisplayProps {
	message?: string;
	title?: string;
	className?: string;
}

export function LoadingDisplay({
	message = 'Loading...',
	title = 'Please wait',
	className,
}: LoadingDisplayProps) {
	return (
		<div
			className={cn(
				'p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg flex items-start gap-3',
				className,
			)}>
			<div className='w-4 h-4 mt-0.5 flex-shrink-0'>
				<div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
			</div>
			<div className='flex-1 min-w-0'>
				<span className='text-sm font-medium'>{title}</span>
				<p className='text-sm mt-1'>{message}</p>
			</div>
		</div>
	);
}
