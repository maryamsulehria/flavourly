'use client';

import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: any) {
		// Log error to console in development
		if (process.env.NODE_ENV === 'development') {
			console.error('Error caught by boundary:', error, errorInfo);
		}

		// In production, you might want to send this to an error reporting service
		// like Sentry, LogRocket, etc.
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div className='min-h-screen flex items-center justify-center bg-background px-4'>
					<div className='w-full max-w-md space-y-6'>
						<div className='text-center space-y-4'>
							<div className='mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center'>
								<AlertTriangle className='w-8 h-8 text-destructive' />
							</div>
							<div>
								<h1 className='text-2xl font-bold text-foreground'>Something went wrong</h1>
								<p className='text-muted-foreground mt-2'>
									We encountered an unexpected error. Please try refreshing the page.
								</p>
							</div>
						</div>

						<ErrorDisplay
							error={this.state.error}
							title='Technical Details'
							variant='warning'
							className='text-left'
						/>

						<div className='flex flex-col gap-3'>
							<Button
								onClick={this.handleRetry}
								className='w-full'>
								<RefreshCw className='w-4 h-4 mr-2' />
								Try Again
							</Button>
							<Button
								variant='outline'
								onClick={() => window.location.reload()}
								className='w-full'>
								Refresh Page
							</Button>
						</div>

						<div className='text-center text-sm text-muted-foreground'>
							<p>
								If the problem persists, please{' '}
								<a
									href='mailto:support@flavourly.com'
									className='text-primary hover:underline'>
									contact support
								</a>
							</p>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Hook for functional components to handle errors
export function useErrorHandler() {
	return {
		handleError: (error: Error) => {
			// Log error in development
			if (process.env.NODE_ENV === 'development') {
				console.error('Error handled by hook:', error);
			}

			// In production, you might want to send this to an error reporting service
			// You could also show a toast notification here
		},
	};
}
