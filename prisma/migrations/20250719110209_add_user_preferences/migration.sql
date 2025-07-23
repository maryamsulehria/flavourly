-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "cookingSkill" TEXT,
ADD COLUMN     "cuisinePreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "dietaryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "mealSize" TEXT,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "spiceTolerance" TEXT;
