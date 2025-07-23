import { prisma } from '../lib/prisma';

async function testReviewFunctionality() {
	console.log('🧪 Testing Review Functionality...\n');

	try {
		// Get a sample recipe
		const recipe = await prisma.recipe.findFirst({
			where: { status: 'verified' },
			include: {
				reviews: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
								fullName: true,
							},
						},
					},
				},
				_count: {
					select: {
						reviews: true,
					},
				},
			},
		});

		if (!recipe) {
			console.log('❌ No verified recipes found to test with');
			return;
		}

		console.log(`📋 Testing with recipe: "${recipe.title}" (ID: ${recipe.id})`);
		console.log(`📊 Current reviews: ${recipe._count.reviews}`);

		// Calculate current average rating
		const totalRating = recipe.reviews.reduce((sum, review) => sum + review.rating, 0);
		const averageRating = recipe.reviews.length > 0 ? totalRating / recipe.reviews.length : null;

		console.log(`⭐ Current average rating: ${averageRating?.toFixed(1) || 'No ratings'}`);

		// Display existing reviews
		if (recipe.reviews.length > 0) {
			console.log('\n📝 Existing Reviews:');
			recipe.reviews.forEach((review, index) => {
				console.log(
					`  ${index + 1}. ${review.user.fullName || review.user.username} - ${
						review.rating
					} stars${review.comment ? `: "${review.comment}"` : ''}`,
				);
			});
		} else {
			console.log('\n📝 No existing reviews');
		}

		// Test API endpoints
		console.log('\n🔗 Testing API Endpoints:');

		// Test GET reviews endpoint
		try {
			const reviewsResponse = await fetch(`http://localhost:3000/api/recipes/${recipe.id}/reviews`);
			if (reviewsResponse.ok) {
				const reviews = await reviewsResponse.json();
				console.log(
					`✅ GET /api/recipes/${recipe.id}/reviews - ${reviews.length} reviews returned`,
				);
			} else {
				console.log(`❌ GET /api/recipes/${recipe.id}/reviews - ${reviewsResponse.status}`);
			}
		} catch (error) {
			console.log(`❌ GET /api/recipes/${recipe.id}/reviews - Error: ${error}`);
		}

		// Test recipe detail endpoint
		try {
			const recipeResponse = await fetch(`http://localhost:3000/api/recipes/${recipe.id}`);
			if (recipeResponse.ok) {
				const recipeData = await recipeResponse.json();
				console.log(
					`✅ GET /api/recipes/${recipe.id} - Average rating: ${
						recipeData.averageRating?.toFixed(1) || 'None'
					}, Review count: ${recipeData.reviewCount}`,
				);
			} else {
				console.log(`❌ GET /api/recipes/${recipe.id} - ${recipeResponse.status}`);
			}
		} catch (error) {
			console.log(`❌ GET /api/recipes/${recipe.id} - Error: ${error}`);
		}

		console.log('\n✅ Review functionality test completed!');
		console.log('\n📋 Manual Testing Checklist:');
		console.log('1. Visit a recipe detail page');
		console.log('2. Check if the Reviews tab shows existing reviews');
		console.log('3. Sign in as a user and try to write a review');
		console.log('4. Verify the rating stars work correctly');
		console.log('5. Check if the review appears in the reviews list');
		console.log('6. Try editing and deleting your review');
		console.log('7. Verify that recipe cards show ratings throughout the app');
	} catch (error) {
		console.error('❌ Error testing review functionality:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testReviewFunctionality();
