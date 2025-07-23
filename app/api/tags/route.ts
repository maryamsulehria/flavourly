import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RoleName } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user is a nutritionist
		if (session.user.role !== RoleName.Nutritionist) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		const tagTypes = await prisma.tagType.findMany({
			include: {
				tags: {
					select: {
						id: true,
						tagName: true,
					},
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
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(_request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user is a nutritionist
		if (session.user.role !== RoleName.Nutritionist) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		const body = await _request.json();
		const { tagName, tagTypeId } = body;

		if (!tagName || !tagTypeId) {
			return NextResponse.json({ error: 'Tag name and type are required' }, { status: 400 });
		}

		// Check if tag already exists in this type
		const existingTag = await prisma.tag.findUnique({
			where: {
				tagTypeId_tagName: {
					tagTypeId: parseInt(tagTypeId),
					tagName,
				},
			},
		});

		if (existingTag) {
			return NextResponse.json({ error: 'Tag already exists in this category' }, { status: 409 });
		}

		const newTag = await prisma.tag.create({
			data: {
				tagName,
				tagTypeId: parseInt(tagTypeId),
			},
			include: {
				tagType: {
					select: {
						id: true,
						typeName: true,
					},
				},
			},
		});

		return NextResponse.json({
			message: 'Tag created successfully',
			tag: newTag,
		});
	} catch (error) {
		console.error('Error creating tag:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
