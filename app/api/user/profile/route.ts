import { auth } from "@/lib/auth";
import {
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  uploadProfilePicture,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
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
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const formData = await request.formData();
    const fullName = formData.get("fullName") as string;
    const bio = formData.get("bio") as string;
    const profilePicture = formData.get("profilePicture") as File | null;

    if (!fullName?.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Get current user to check if we need to delete old profile picture
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    let profilePictureUrl = undefined;

    // Handle profile picture upload to Cloudinary
    if (profilePicture) {
      try {
        // Validate file type
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        if (!validTypes.includes(profilePicture.type)) {
          return NextResponse.json(
            {
              error:
                "Invalid file type. Please upload JPG, PNG, or WebP images.",
            },
            { status: 400 }
          );
        }

        // Validate file size (5MB limit)
        if (profilePicture.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              error: "File too large. Please upload an image smaller than 5MB.",
            },
            { status: 400 }
          );
        }

        // Upload to Cloudinary
        const uploadResult = await uploadProfilePicture(profilePicture);
        profilePictureUrl = uploadResult.url;

        // Delete old profile picture from Cloudinary if it exists
        if (currentUser?.profilePicture) {
          const oldPublicId = extractPublicIdFromUrl(
            currentUser.profilePicture
          );
          if (oldPublicId) {
            try {
              await deleteFromCloudinary(oldPublicId);
              console.log(`Deleted old profile picture: ${oldPublicId}`);
            } catch (deleteError) {
              console.error(
                "Failed to delete old profile picture:",
                deleteError
              );
              // Continue with update even if deletion fails
            }
          }
        }
      } catch (uploadError) {
        console.error("Error uploading profile picture:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload profile picture. Please try again." },
          { status: 500 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName.trim(),
        bio: bio?.trim() || null,
        ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
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
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
