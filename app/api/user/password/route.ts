import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = parseInt(session.user.id);
		const { currentPassword, newPassword } = await request.json();

		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{ error: 'Current password and new password are required' },
				{ status: 400 },
			);
		}

		if (newPassword.length < 8) {
			return NextResponse.json(
				{ error: 'New password must be at least 8 characters long' },
				{ status: 400 },
			);
		}

		const hasLetters = /[a-zA-Z]/.test(newPassword);
		const hasNumbers = /\d/.test(newPassword);
		if (!hasLetters || !hasNumbers) {
			return NextResponse.json(
				{ error: 'New password must contain both letters and numbers' },
				{ status: 400 },
			);
		}

		// Get current user to verify password
		const currentUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { passwordHash: true },
		});

		if (!currentUser) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Verify current password
		const isPasswordValid = await compare(currentPassword, currentUser.passwordHash);
		if (!isPasswordValid) {
			return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
		}

		// Hash new password
		const hashedNewPassword = await hash(newPassword, 12);

		// Update password
		await prisma.user.update({
			where: { id: userId },
			data: { passwordHash: hashedNewPassword },
		});

		return NextResponse.json({ message: 'Password updated successfully' });
	} catch (error) {
		console.error('Error updating password:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
