import { auth } from '@/lib/auth';
import { RoleName } from '@prisma/client';
import { NextResponse } from 'next/server';

export default auth(req => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	// Public routes that don't require authentication
	const publicRoutes = [
		'/',
		'/signin',
		'/signup',
		'/about',
		'/contact',
		'/recipes',
		'/users',
		'/nutritionist-profile',
	];
	const isPublicRoute = publicRoutes.some(
		route =>
			nextUrl.pathname === route ||
			nextUrl.pathname.startsWith('/recipes/') ||
			nextUrl.pathname.startsWith('/users/') ||
			nextUrl.pathname.startsWith('/nutritionist-profile/'),
	);

	// If it's a public route, allow access
	if (isPublicRoute) {
		return NextResponse.next();
	}

	// If not logged in and trying to access protected route, redirect to signin
	if (!isLoggedIn) {
		return NextResponse.redirect(new URL('/signin', nextUrl));
	}

	// Role-based route protection
	const userRole = req.auth?.user?.role;

	// Dashboard routes - only for RecipeDevelopers
	if (nextUrl.pathname.startsWith('/dashboard')) {
		if (userRole === RoleName.Nutritionist) {
			return NextResponse.redirect(new URL('/nutritionist', nextUrl));
		}
		if (userRole !== RoleName.RecipeDeveloper) {
			return NextResponse.redirect(new URL('/unauthorized', nextUrl));
		}
	}

	// Nutritionist routes - only for Nutritionists
	if (nextUrl.pathname.startsWith('/nutritionist')) {
		if (userRole === RoleName.RecipeDeveloper) {
			return NextResponse.redirect(new URL('/dashboard', nextUrl));
		}
		if (userRole !== RoleName.Nutritionist) {
			return NextResponse.redirect(new URL('/unauthorized', nextUrl));
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
