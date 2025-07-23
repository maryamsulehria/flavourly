import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		// Fetch all tag types with their associated tags
		const tagTypes = await prisma.tagType.findMany({
			include: {
				tags: {
					orderBy: {
						tagName: 'asc',
					},
				},
			},
			orderBy: {
				typeName: 'asc',
			},
		});

		return NextResponse.json(tagTypes);
	} catch (error) {
		console.error('Error fetching tags:', error);
		return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
	}
}
