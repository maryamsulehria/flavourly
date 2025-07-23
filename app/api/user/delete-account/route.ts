import { auth } from '@/lib/auth';
import { deleteFromCloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(_request: NextRequest) {
	try {
		// Get the current session
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = parseInt(session.user.id);

		// Get user data to collect all related information
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				createdRecipes: {
					include: {
						media: true,
						nutritionalInfo: true,
					},
				},
				verifiedRecipes: {
					include: {
						media: true,
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Collect all Cloudinary public IDs for deletion
		const cloudinaryPublicIds: string[] = [];

		// Add user's profile picture if it exists
		if (user.profilePicture) {
			const profilePicturePublicId = extractPublicIdFromUrl(user.profilePicture);
			if (profilePicturePublicId) {
				cloudinaryPublicIds.push(profilePicturePublicId);
			}
		}

		// Add all recipe media public IDs
		user.createdRecipes.forEach(recipe => {
			recipe.media.forEach(media => {
				const mediaPublicId = extractPublicIdFromUrl(media.url);
				if (mediaPublicId) {
					cloudinaryPublicIds.push(mediaPublicId);
				}
			});
		});

		// Add all verified recipe media public IDs
		user.verifiedRecipes.forEach(recipe => {
			recipe.media.forEach(media => {
				const mediaPublicId = extractPublicIdFromUrl(media.url);
				if (mediaPublicId) {
					cloudinaryPublicIds.push(mediaPublicId);
				}
			});
		});

		// Delete all user data from database
		// This will cascade delete all related data due to foreign key constraints
		await prisma.user.delete({
			where: { id: userId },
		});

		// Delete all media files from Cloudinary
		if (cloudinaryPublicIds.length > 0) {
			try {
				await Promise.allSettled(
					cloudinaryPublicIds.map(publicId => deleteFromCloudinary(publicId)),
				);
				console.log(`Deleted ${cloudinaryPublicIds.length} files from Cloudinary`);
			} catch (error) {
				console.error('Error deleting files from Cloudinary:', error);
				// Don't fail the request if Cloudinary deletion fails
			}
		}

		return NextResponse.json({
			message: 'Account deleted successfully',
			deletedFiles: cloudinaryPublicIds.length,
		});
	} catch (error) {
		console.error('Error deleting account:', error);
		return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
	}
}
