import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Extract query parameters
		const search = searchParams.get('search') || '';
		const sortBy = searchParams.get('sort') || 'recent';
		const mealType = searchParams.get('mealType')?.split(',') || [];
		const dietaryPreferences = searchParams.get('dietary')?.split(',') || [];
		const cuisine = searchParams.get('cuisine')?.split(',') || [];
		const cookingTime = searchParams.get('time') || '';
		const difficulty = searchParams.get('difficulty') || '';
		const rating = searchParams.get('rating') || '';
		const cookingMethod = searchParams.get('cookingMethod')?.split(',') || [];
		const health = searchParams.get('health')?.split(',') || [];
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '12');
		const offset = (page - 1) * limit;

		// Build where conditions
		const whereConditions: any = {
			status: 'verified', // Only show verified recipes
		};

		// Search functionality
		if (search) {
			whereConditions.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
				{
					ingredients: {
						some: { ingredient: { name: { contains: search, mode: 'insensitive' } } },
					},
				},
			];
		}

		// Build tag filters
		const tagFilters = [];

		// Meal type filter
		if (mealType.length > 0) {
			tagFilters.push({
				tags: {
					some: {
						tag: {
							tagName: { in: mealType },
							tagType: { typeName: 'Meal Type' },
						},
					},
				},
			});
		}

		// Dietary preferences filter
		if (dietaryPreferences.length > 0) {
			tagFilters.push({
				tags: {
					some: {
						tag: {
							tagName: { in: dietaryPreferences },
							tagType: { typeName: 'Dietary' },
						},
					},
				},
			});
		}

		// Cuisine filter
		if (cuisine.length > 0) {
			tagFilters.push({
				tags: {
					some: {
						tag: {
							tagName: { in: cuisine },
							tagType: { typeName: 'Cuisine' },
						},
					},
				},
			});
		}

		// Difficulty filter
		if (difficulty) {
			tagFilters.push({
				tags: {
					some: {
						tag: {
							tagName: difficulty,
							tagType: { typeName: 'Difficulty' },
						},
					},
				},
			});
		}

		// Cooking method filter
		if (cookingMethod.length > 0) {
			tagFilters.push({
				tags: {
					some: {
						tag: {
							tagName: { in: cookingMethod },
							tagType: { typeName: 'Cooking Method' },
						},
					},
				},
			});
		}

		// Health benefits filter
		if (health.length > 0) {
			tagFilters.push({
				tags: {
					some: {
						tag: {
							tagName: { in: health },
							tagType: { typeName: 'Health' },
						},
					},
				},
			});
		}

		// Add tag filters to where conditions
		if (tagFilters.length > 0) {
			whereConditions.AND = tagFilters;
		}

		// Cooking time filter
		if (cookingTime) {
			if (cookingTime === '60+') {
				whereConditions.cookingTimeMinutes = { gt: 60 };
			} else {
				const maxTime = parseInt(cookingTime);
				whereConditions.cookingTimeMinutes = { lte: maxTime };
			}
		}

		// Rating filter
		if (rating) {
			const minRating = parseFloat(rating);
			whereConditions.averageRating = { gte: minRating };
		}

		// Build order by
		let orderBy: any = {};
		switch (sortBy) {
			case 'rating':
				orderBy = { averageRating: 'desc' };
				break;
			case 'popular':
				// For popular sorting, we'll sort by createdAt as a fallback
				// The actual favorite count will be calculated in the response
				orderBy = { createdAt: 'desc' };
				break;
			case 'time_asc':
				orderBy = { cookingTimeMinutes: 'asc' };
				break;
			case 'time_desc':
				orderBy = { cookingTimeMinutes: 'desc' };
				break;
			case 'recent':
			default:
				// For recent sorting, prioritize newly verified recipes first, then by creation date
				orderBy = [{ verifiedAt: 'desc' }, { createdAt: 'desc' }];
				break;
		}

		// Fetch recipes with all related data
		const recipes = await prisma.recipe.findMany({
			where: whereConditions,
			orderBy,
			skip: offset,
			take: limit,
			include: {
				author: {
					select: {
						id: true,
						username: true,
						fullName: true,
						profilePicture: true,
					},
				},
				verifiedBy: {
					select: {
						id: true,
						username: true,
						fullName: true,
					},
				},
				media: {
					select: {
						id: true,
						url: true,
						caption: true,
						mediaType: true,
					},
				},
				nutritionalInfo: {
					select: {
						calories: true,
						proteinGrams: true,
						carbohydratesGrams: true,
						fatGrams: true,
						dataSource: true,
					},
				},
				tags: {
					select: {
						tag: {
							select: {
								tagName: true,
								tagType: {
									select: {
										typeName: true,
									},
								},
							},
						},
					},
				},
				reviews: {
					select: {
						rating: true,
					},
				},
				favoritedBy: {
					select: {
						userId: true,
					},
				},
				_count: {
					select: {
						reviews: true,
						favoritedBy: true,
					},
				},
			},
		});

		// Calculate average rating and counts
		const recipesWithStats = recipes.map(recipe => {
			const totalRating = recipe.reviews.reduce((sum, review) => sum + review.rating, 0);
			const averageRating = recipe.reviews.length > 0 ? totalRating / recipe.reviews.length : null;

			return {
				...recipe,
				averageRating,
				reviewCount: recipe._count.reviews,
				reviews: undefined,
				favoritedBy: undefined,
				_count: undefined,
			};
		});

		// Sort by favorite count if popular sort is requested
		if (sortBy === 'popular') {
			// Since we removed favoriteCount, we'll sort by createdAt as fallback
			recipesWithStats.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
		}

		// Get total count for pagination
		const totalCount = await prisma.recipe.count({
			where: whereConditions,
		});

		return NextResponse.json({
			recipes: recipesWithStats,
			totalCount,
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
			},
		});
	} catch (error) {
		console.error('Error fetching public recipes:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch recipes',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}
