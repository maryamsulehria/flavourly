'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Bug, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error('Global error:', error);
	}, [error]);

	return (
		<html>
			<body>
				<div className='min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4'>
					<div className='max-w-2xl w-full space-y-8'>
						{/* Main Error Card */}
						<Card className='border-destructive/50 shadow-lg'>
							<CardHeader className='text-center pb-4'>
								<div className='mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-4'>
									<AlertTriangle className='w-10 h-10 text-destructive' />
								</div>
								<CardTitle className='text-2xl font-bold text-destructive'>
									Something went wrong
								</CardTitle>
								<p className='text-muted-foreground mt-2'>
									We encountered an unexpected error. Please try again or contact support if the
									problem persists.
								</p>
							</CardHeader>
							<CardContent className='text-center space-y-4'>
								<Alert className='border-destructive/50'>
									<Bug className='h-4 w-4' />
									<AlertDescription>
										{error.message || 'An unexpected error occurred while loading the page.'}
									</AlertDescription>
								</Alert>

								<div className='flex justify-center space-x-4 pt-4'>
									<Button
										onClick={reset}
										className='flex items-center'>
										<RefreshCw className='w-4 h-4 mr-2' />
										Try Again
									</Button>
									<Link href='/'>
										<Button
											variant='outline'
											className='flex items-center'>
											<Home className='w-4 h-4 mr-2' />
											Go Home
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>

						{/* Error Details Card */}
						<Card className='shadow-lg'>
							<CardHeader>
								<CardTitle className='text-lg'>Error Details</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='p-4 bg-muted rounded-lg'>
									<div className='space-y-2'>
										<div className='flex justify-between text-sm'>
											<span className='text-muted-foreground'>Error Type:</span>
											<span className='font-mono'>{error.name || 'Unknown'}</span>
										</div>
										{error.digest && (
											<div className='flex justify-between text-sm'>
												<span className='text-muted-foreground'>Error ID:</span>
												<span className='font-mono'>{error.digest}</span>
											</div>
										)}
										<div className='flex justify-between text-sm'>
											<span className='text-muted-foreground'>Timestamp:</span>
											<span className='font-mono'>{new Date().toLocaleString()}</span>
										</div>
									</div>
								</div>

								<div className='text-center'>
									<p className='text-sm text-muted-foreground mb-4'>
										If this error continues to occur, please try refreshing the page or going back
										to the previous page.
									</p>
									<div className='flex justify-center space-x-3'>
										<Button
											size='sm'
											variant='outline'
											onClick={() => window.history.back()}>
											<ArrowLeft className='w-4 h-4 mr-2' />
											Go Back
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</body>
		</html>
	);
}
