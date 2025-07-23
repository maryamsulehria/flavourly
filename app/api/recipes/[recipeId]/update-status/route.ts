import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VerificationStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ recipeId: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user is a nutritionist
		const user = await prisma.user.findUnique({
			where: { id: parseInt(session.user.id) },
			include: { role: true },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		if (!user.role) {
			return NextResponse.json({ error: 'User role not found' }, { status: 500 });
		}

		if (user.role.name !== 'Nutritionist') {
			return NextResponse.json(
				{ error: 'Forbidden - Nutritionist access required' },
				{ status: 403 },
			);
		}

		const { recipeId: recipeIdParam } = await params;
		const recipeId = parseInt(recipeIdParam);
		if (isNaN(recipeId)) {
			return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
		}

		const body = await request.json();
		const { status } = body;

		// Validate status
		if (!Object.values(VerificationStatus).includes(status)) {
			return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
		}

		// Check if recipe exists
		const existingRecipe = await prisma.recipe.findUnique({
			where: { id: recipeId },
		});

		if (!existingRecipe) {
			return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
		}

		// Update recipe status
		const updateData: any = {
			status,
			updatedAt: new Date(),
		};

		// Set verifiedAt timestamp and verifiedById for verified and needs_revision statuses
		if (status === VerificationStatus.verified) {
			updateData.verifiedAt = new Date();
			updateData.verifiedById = parseInt(session.user.id);
		} else if (status === VerificationStatus.needs_revision) {
			// Keep verifiedById for needs_revision so we can show who reviewed it
			updateData.verifiedAt = null;
			updateData.verifiedById = parseInt(session.user.id);
		} else {
			// Clear verification data for other statuses (like pending_verification)
			updateData.verifiedAt = null;
			updateData.verifiedById = null;
		}

		await prisma.recipe.update({
			where: { id: recipeId },
			data: updateData,
		});

		return NextResponse.json({
			message: 'Recipe status updated successfully',
			recipeId,
			status,
		});
	} catch (error) {
		console.error('Error updating recipe status:', error);
		return NextResponse.json({ error: 'Failed to update recipe status' }, { status: 500 });
	}
}
