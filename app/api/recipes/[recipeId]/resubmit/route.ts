import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VerificationStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ recipeId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { recipeId: recipeIdParam } = await params;
		const recipeId = parseInt(recipeIdParam);
		if (isNaN(recipeId)) {
			return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
		}

		// Check if recipe exists and belongs to the user
		const recipe = await prisma.recipe.findFirst({
			where: {
				id: recipeId,
				authorId: parseInt(session.user.id),
			},
		});

		if (!recipe) {
			return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
		}

		// Check if recipe is in "needs_revision" status
		if (recipe.status !== VerificationStatus.needs_revision) {
			return NextResponse.json(
				{ error: 'Only recipes with "Needs Revision" status can be resubmitted' },
				{ status: 400 },
			);
		}

		// Update recipe status to pending_verification and clear verification data
		await prisma.recipe.update({
			where: { id: recipeId },
			data: {
				status: VerificationStatus.pending_verification,
				verifiedAt: null,
				verifiedById: null,
				updatedAt: new Date(),
			},
		});

		return NextResponse.json({ message: 'Recipe resubmitted for review successfully' });
	} catch (error) {
		console.error('Error resubmitting recipe:', error);
		return NextResponse.json({ error: 'Failed to resubmit recipe' }, { status: 500 });
	}
}
