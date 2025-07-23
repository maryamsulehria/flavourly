import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Find a nutritionist
		const nutritionist = await prisma.user.findFirst({
			where: {
				role: {
					name: 'Nutritionist',
				},
			},
		});

		if (!nutritionist) {
			return NextResponse.json({ error: 'No nutritionist found' }, { status: 404 });
		}

		// Update all needs_revision recipes that don't have verifiedById
		const result = await prisma.recipe.updateMany({
			where: {
				status: 'needs_revision',
				verifiedById: null,
			},
			data: {
				verifiedById: nutritionist.id,
				verifiedAt: new Date(),
			},
		});

		return NextResponse.json({
			message: `Fixed ${result.count} needs_revision recipes`,
			nutritionist: {
				id: nutritionist.id,
				name: nutritionist.fullName || nutritionist.username,
			},
		});
	} catch (error) {
		console.error('Error fixing needs_revision recipes:', error);
		return NextResponse.json({ error: 'Failed to fix recipes' }, { status: 500 });
	}
}
