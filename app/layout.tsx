import { ErrorBoundary } from '@/components/error-boundary';
import { AuthSessionProvider } from '@/components/session-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ReactQueryProvider } from '@/lib/react-query';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Flavourly',
	description: 'Your recipe management platform',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ErrorBoundary>
					<AuthSessionProvider>
						<ThemeProvider
							attribute='class'
							defaultTheme='system'
							enableSystem
							disableTransitionOnChange>
							<ReactQueryProvider>{children}</ReactQueryProvider>
						</ThemeProvider>
					</AuthSessionProvider>
				</ErrorBoundary>
				<Toaster />
			</body>
		</html>
	);
}
