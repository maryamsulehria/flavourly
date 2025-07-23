import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = parseInt(session.user.id);

		const user = await prisma.user.findUnique({
			where: { id: userId },
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

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error('Error fetching user:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
