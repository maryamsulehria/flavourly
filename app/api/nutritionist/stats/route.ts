import { auth } from '@/lib/auth';
import { getNutritionistStats } from '@/lib/queries/nutritionist';
import { RoleName } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
	try {
		const session = await auth();

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (session.user.role !== RoleName.Nutritionist) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const nutritionistId = parseInt(session.user.id);
		const stats = await getNutritionistStats(nutritionistId);

		return NextResponse.json(stats);
	} catch (error) {
		console.error('Error fetching nutritionist stats:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
