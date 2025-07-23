import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = parseInt(session.user.id);
		const {
			dietaryRestrictions,
			allergies,
			cuisinePreferences,
			cookingSkill,
			spiceTolerance,
			mealSize,
		} = await request.json();

		// Validate arrays
		if (
			!Array.isArray(dietaryRestrictions) ||
			!Array.isArray(allergies) ||
			!Array.isArray(cuisinePreferences)
		) {
			return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
		}

		// Update dietary preferences
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				dietaryRestrictions,
				allergies,
				cuisinePreferences,
				cookingSkill: cookingSkill || null,
				spiceTolerance: spiceTolerance || null,
				mealSize: mealSize || null,
			},
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
		console.error('Error updating dietary preferences:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
