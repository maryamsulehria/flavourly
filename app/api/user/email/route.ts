import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = parseInt(session.user.id);
		const { email, password } = await request.json();

		if (!email?.trim() || !password) {
			return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
		}

		// Get current user to verify password
		const currentUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { passwordHash: true, email: true },
		});

		if (!currentUser) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Check if email is the same
		if (currentUser.email === email.trim()) {
			return NextResponse.json(
				{ error: 'New email must be different from current email' },
				{ status: 400 },
			);
		}

		// Verify current password
		const isPasswordValid = await compare(password, currentUser.passwordHash);
		if (!isPasswordValid) {
			return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
		}

		// Check if new email is already taken
		const existingUser = await prisma.user.findUnique({
			where: { email: email.trim() },
		});

		if (existingUser) {
			return NextResponse.json({ error: 'Email is already taken' }, { status: 400 });
		}

		// Update email
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { email: email.trim() },
			select: {
				id: true,
				username: true,
				email: true,
				fullName: true,
				bio: true,
				profilePicture: true,
				dietaryRestrictions: true,
				allergies: true,
				cuisinePreferences: true,
				cookingSkill: true,
				spiceTolerance: true,
				mealSize: true,
				createdAt: true,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error('Error updating email:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
