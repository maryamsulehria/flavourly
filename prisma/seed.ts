import {
	MediaType,
	NutritionDataSource,
	PrismaClient,
	RoleName,
	VerificationStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('Seeding database...');

	// Create roles
	const roles = [{ name: RoleName.RecipeDeveloper }, { name: RoleName.Nutritionist }];

	for (const role of roles) {
		await prisma.role.upsert({
			where: { name: role.name },
			update: {},
			create: role,
		});
	}

	// Create users (3 Recipe Developers + 3 Nutritionists)
	const users = [
		// Recipe Developers
		{
			username: 'chef_sarah',
			email: 'sarah.chen@example.com',
			passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password123
			fullName: 'Sarah Chen',
			bio: 'Passionate home chef specializing in Asian fusion cuisine. Love creating healthy, flavorful dishes that bring people together.',
			profilePicture:
				'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
			dietaryRestrictions: ['Vegetarian'],
			allergies: ['Shellfish'],
			cuisinePreferences: ['Asian', 'Mediterranean', 'Fusion'],
			cookingSkill: 'Advanced',
			spiceTolerance: 'High',
			mealSize: 'Medium',
			roleName: RoleName.RecipeDeveloper,
		},
		{
			username: 'marcus_kitchen',
			email: 'marcus.rodriguez@example.com',
			passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password123
			fullName: 'Marcus Rodriguez',
			bio: 'Mexican-American chef with 15 years of experience. Expert in traditional Mexican cuisine and modern Latin fusion.',
			profilePicture:
				'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
			dietaryRestrictions: [],
			allergies: ['Nuts'],
			cuisinePreferences: ['Mexican', 'Latin', 'Mediterranean'],
			cookingSkill: 'Expert',
			spiceTolerance: 'Very High',
			mealSize: 'Large',
			roleName: RoleName.RecipeDeveloper,
		},
		{
			username: 'emma_bakes',
			email: 'emma.wilson@example.com',
			passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password123
			fullName: 'Emma Wilson',
			bio: 'Pastry chef and baking enthusiast. Creating delicious desserts and breads with a focus on whole ingredients.',
			profilePicture:
				'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
			dietaryRestrictions: ['Vegetarian'],
			allergies: ['Gluten'],
			cuisinePreferences: ['French', 'Italian', 'American'],
			cookingSkill: 'Advanced',
			spiceTolerance: 'Medium',
			mealSize: 'Small',
			roleName: RoleName.RecipeDeveloper,
		},
		// Nutritionists
		{
			username: 'dr_nutrition',
			email: 'dr.lisa.patel@example.com',
			passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password123
			fullName: 'Dr. Lisa Patel',
			bio: 'Registered Dietitian with 10+ years of experience. Specializing in sports nutrition and weight management.',
			profilePicture:
				'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
			dietaryRestrictions: ['Vegetarian'],
			allergies: [],
			cuisinePreferences: ['Mediterranean', 'Asian', 'Plant-based'],
			cookingSkill: 'Intermediate',
			spiceTolerance: 'Medium',
			mealSize: 'Medium',
			roleName: RoleName.Nutritionist,
		},
		{
			username: 'health_coach_mike',
			email: 'mike.thompson@example.com',
			passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password123
			fullName: 'Mike Thompson',
			bio: 'Certified Nutrition Coach and personal trainer. Helping people achieve their health goals through proper nutrition.',
			profilePicture:
				'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
			dietaryRestrictions: [],
			allergies: ['Dairy'],
			cuisinePreferences: ['American', 'Mediterranean', 'High-Protein'],
			cookingSkill: 'Advanced',
			spiceTolerance: 'High',
			mealSize: 'Large',
			roleName: RoleName.Nutritionist,
		},
		{
			username: 'wellness_maria',
			email: 'maria.garcia@example.com',
			passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password123
			fullName: 'Maria Garcia',
			bio: 'Holistic nutritionist and wellness coach. Focused on gut health and anti-inflammatory diets.',
			profilePicture:
				'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
			dietaryRestrictions: ['Vegan'],
			allergies: ['Gluten', 'Soy'],
			cuisinePreferences: ['Mediterranean', 'Plant-based', 'Anti-inflammatory'],
			cookingSkill: 'Intermediate',
			spiceTolerance: 'Low',
			mealSize: 'Small',
			roleName: RoleName.Nutritionist,
		},
	];

	// Create users
	const createdUsers = [];
	for (const userData of users) {
		const role = await prisma.role.findUnique({
			where: { name: userData.roleName },
		});

		const { roleName, ...userDataWithoutRole } = userData;

		const user = await prisma.user.upsert({
			where: { email: userData.email },
			update: {},
			create: {
				...userDataWithoutRole,
				roleId: role!.id,
			},
		});
		createdUsers.push(user);
		console.log(`Created user: ${user.fullName}`);
	}

	// Create ingredients
	const ingredients = [
		'Chicken Breast',
		'Salmon',
		'Quinoa',
		'Brown Rice',
		'Sweet Potato',
		'Broccoli',
		'Spinach',
		'Kale',
		'Avocado',
		'Tomato',
		'Onion',
		'Garlic',
		'Ginger',
		'Lemon',
		'Lime',
		'Olive Oil',
		'Coconut Oil',
		'Black Beans',
		'Chickpeas',
		'Lentils',
		'Almonds',
		'Walnuts',
		'Chia Seeds',
		'Flax Seeds',
		'Greek Yogurt',
		'Feta Cheese',
		'Parmesan',
		'Mozzarella',
		'Eggs',
		'Milk',
		'Butter',
		'Whole Wheat Flour',
		'Almond Flour',
		'Coconut Flour',
		'Honey',
		'Maple Syrup',
		'Vanilla Extract',
		'Cinnamon',
		'Turmeric',
		'Cumin',
		'Paprika',
		'Black Pepper',
		'Sea Salt',
		'Basil',
		'Oregano',
		'Thyme',
		'Rosemary',
		'Cilantro',
		'Parsley',
		'Mint',
		'Bay Leaves',
		'Red Pepper Flakes',
		'Bell Pepper',
		'Carrot',
		'Celery',
		'Mushroom',
		'Zucchini',
		'Eggplant',
		'Asparagus',
		'Cauliflower',
		'Brussels Sprouts',
		'Green Beans',
		'Peas',
		'Corn',
		'Pineapple',
		'Mango',
		'Strawberry',
		'Blueberry',
		'Raspberry',
		'Apple',
		'Banana',
		'Orange',
		'Grape',
		'Pomegranate',
		// Additional ingredients for more accurate recipes
		'All-Purpose Flour',
		'Active Dry Yeast',
		'Sugar',
		'Brown Sugar',
		'White Sugar',
		'Baking Soda',
		'Baking Powder',
		'Salt',
		'Water',
		'Warm Water',
		'White Vinegar',
		'Red Wine Vinegar',
		'Balsamic Vinegar',
		'Vegetable Oil',
		'Sesame Oil',
		'Coconut Milk',
		'Green Curry Paste',
		'Bamboo Shoots',
		'Thai Basil',
		'Fish Sauce',
		'Palm Sugar',
		'Jasmine Rice',
		'Corn Tortillas',
		'Jalapeño',
		'Sour Cream',
		'Lettuce',
		'Beef Broth',
		'Baguette',
		'Gruyère Cheese',
		'White Wine',
		'Cherry Tomatoes',
		'Red Onion',
		'Kalamata Olives',
		'Cucumber',
		'Cornstarch',
		'Green Onion',
		'Vegetable Broth',
		'Bay Leaf',
		'Spaghetti',
		'Pancetta',
		'Egg Yolks',
		'Pasta Water',
		'Dark Chocolate',
		'Cocoa Powder',
		'Fresh Berries',
		'Brioche Buns',
		'Cheese Slices',
		'Pickles',
		'Ketchup',
		'Mustard',
		'Worcestershire Sauce',
		'Ladyfingers',
		'Mascarpone Cheese',
		'Heavy Cream',
		'Strong Coffee',
		'Coffee Liqueur',
		'Dried Thyme',
		'Dried Rosemary',
		'Fresh Parsley',
		'Cinnamon',
		// Additional missing ingredients
		'Soy Sauce',
		'Whole Grain Bread',
		'Microgreens',
		'Ground Beef',
		'Taco Seasoning',
		'Onions',
		'Chocolate Chips',
	];

	const createdIngredients = [];
	for (const ingredientName of ingredients) {
		const ingredient = await prisma.ingredient.upsert({
			where: { name: ingredientName },
			update: {},
			create: { name: ingredientName },
		});
		createdIngredients.push(ingredient);
	}

	// Create measurement units
	const units = [
		{ unitName: 'Cup', abbreviation: 'cup' },
		{ unitName: 'Tablespoon', abbreviation: 'tbsp' },
		{ unitName: 'Teaspoon', abbreviation: 'tsp' },
		{ unitName: 'Pound', abbreviation: 'lb' },
		{ unitName: 'Ounce', abbreviation: 'oz' },
		{ unitName: 'Gram', abbreviation: 'g' },
		{ unitName: 'Kilogram', abbreviation: 'kg' },
		{ unitName: 'Milliliter', abbreviation: 'ml' },
		{ unitName: 'Liter', abbreviation: 'L' },
		{ unitName: 'Piece', abbreviation: 'pc' },
		{ unitName: 'Clove', abbreviation: 'clove' },
		{ unitName: 'Bunch', abbreviation: 'bunch' },
		{ unitName: 'Can', abbreviation: 'can' },
		{ unitName: 'Package', abbreviation: 'pkg' },
		{ unitName: 'Pinch', abbreviation: 'pinch' },
		{ unitName: 'To Taste', abbreviation: 'to taste' },
		{ unitName: 'Fillets', abbreviation: 'fillets' },
		{ unitName: 'Slices', abbreviation: 'slices' },
		{ unitName: 'Sprigs', abbreviation: 'sprigs' },
		{ unitName: 'Packets', abbreviation: 'packets' },
		{ unitName: 'Heads', abbreviation: 'heads' },
		{ unitName: 'Loaves', abbreviation: 'loaves' },
		{ unitName: 'Cans', abbreviation: 'cans' },
		{ unitName: 'Pieces', abbreviation: 'pieces' },
		{ unitName: 'Medium', abbreviation: 'medium' },
		{ unitName: 'Large', abbreviation: 'large' },
		{ unitName: 'Small', abbreviation: 'small' },
	];

	const createdUnits = [];
	for (const unitData of units) {
		const unit = await prisma.measurementUnit.upsert({
			where: { unitName: unitData.unitName },
			update: {},
			create: unitData,
		});
		createdUnits.push(unit);
	}

	// Create tag types and tags
	const defaultTagTypes = [
		{
			typeName: 'Dietary',
			tags: [
				'Vegetarian',
				'Vegan',
				'Gluten-Free',
				'Dairy-Free',
				'Keto',
				'Low-Carb',
				'Paleo',
				'Low-Sodium',
				'Low-Fat',
				'High-Protein',
				'Low-Calorie',
				'Nut-Free',
				'Soy-Free',
				'Egg-Free',
				'Shellfish-Free',
			],
		},
		{
			typeName: 'Cuisine',
			tags: [
				'Italian',
				'Mexican',
				'Asian',
				'Mediterranean',
				'American',
				'Indian',
				'Thai',
				'Chinese',
				'Japanese',
				'French',
				'Greek',
				'Spanish',
				'Middle Eastern',
				'Caribbean',
				'African',
			],
		},
		{
			typeName: 'Meal Type',
			tags: [
				'Breakfast',
				'Lunch',
				'Dinner',
				'Snack',
				'Dessert',
				'Appetizer',
				'Soup',
				'Salad',
				'Main Course',
				'Side Dish',
				'Beverage',
			],
		},
		{
			typeName: 'Cooking Method',
			tags: [
				'Baked',
				'Grilled',
				'Fried',
				'Steamed',
				'Raw',
				'Boiled',
				'Roasted',
				'Sauteed',
				'Slow Cooked',
				'Air Fried',
				'Smoked',
				'Pickled',
				'Fermented',
			],
		},
		{
			typeName: 'Difficulty',
			tags: [
				'Easy',
				'Medium',
				'Hard',
				'Beginner',
				'Intermediate',
				'Advanced',
				'Quick & Easy',
				'Simple',
			],
		},
		{
			typeName: 'Health',
			tags: [
				'Heart-Healthy',
				'High-Protein',
				'Low-Sodium',
				'Anti-Inflammatory',
				'Gut-Healthy',
				'Brain-Boosting',
				'Immune-Boosting',
				'Energy-Boosting',
				'Detox',
				'Weight Loss',
				'Muscle Building',
				'Diabetes-Friendly',
				'Pregnancy-Safe',
				'Kid-Friendly',
				'Senior-Friendly',
			],
		},
	];

	// Create tag types and their tags
	for (const tagTypeData of defaultTagTypes) {
		console.log(`Creating tag type: ${tagTypeData.typeName}`);

		const tagType = await prisma.tagType.upsert({
			where: { typeName: tagTypeData.typeName },
			update: {},
			create: { typeName: tagTypeData.typeName },
		});

		for (const tagName of tagTypeData.tags) {
			await prisma.tag.upsert({
				where: {
					tagTypeId_tagName: {
						tagTypeId: tagType.id,
						tagName,
					},
				},
				update: {},
				create: {
					tagName,
					tagTypeId: tagType.id,
				},
			});
		}
	}

	// Recipe data with real recipes
	const recipes = [
		{
			title: 'Grilled Salmon with Quinoa and Roasted Vegetables',
			description:
				'A healthy and delicious meal featuring perfectly grilled salmon, fluffy quinoa, and colorful roasted vegetables. This dish is packed with protein and essential nutrients.',
			cookingTimeMinutes: 35,
			servings: 4,
			authorUsername: 'chef_sarah',
			imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Salmon', quantity: 4, unit: 'fillets' },
				{ name: 'Quinoa', quantity: 1, unit: 'cup' },
				{ name: 'Broccoli', quantity: 2, unit: 'cups' },
				{ name: 'Sweet Potato', quantity: 2, unit: 'medium' },
				{ name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
				{ name: 'Lemon', quantity: 1, unit: 'piece' },
				{ name: 'Garlic', quantity: 3, unit: 'cloves' },
				{ name: 'Sea Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Black Pepper', quantity: 1, unit: 'tsp' },
				{ name: 'Dried Thyme', quantity: 1, unit: 'tsp' },
				{ name: 'Dried Rosemary', quantity: 1, unit: 'tsp' },
				{ name: 'Water', quantity: 2, unit: 'cups' },
			],
			steps: [
				'Preheat oven to 400°F (200°C).',
				'Cook quinoa according to package instructions.',
				'Cut sweet potatoes into cubes and broccoli into florets.',
				'Toss vegetables with olive oil, salt, and pepper. Roast for 25 minutes.',
				'Season salmon with salt, pepper, and lemon juice.',
				'Grill salmon for 4-5 minutes per side until flaky.',
				'Serve salmon over quinoa with roasted vegetables.',
			],
			tags: ['High-Protein', 'Heart-Healthy', 'Gluten-Free', 'Dinner', 'Grilled'],
			nutritionalInfo: {
				calories: 450,
				proteinGrams: 35,
				carbohydratesGrams: 25,
				fatGrams: 22,
				fiberGrams: 6,
				sugarGrams: 4,
				sodiumMg: 600,
			},
		},
		{
			title: 'Mexican Street Tacos with Homemade Salsa',
			description:
				'Authentic Mexican street tacos with tender marinated chicken, fresh homemade salsa, and warm corn tortillas. A burst of flavor in every bite!',
			cookingTimeMinutes: 45,
			servings: 6,
			authorUsername: 'marcus_kitchen',
			imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Chicken Breast', quantity: 1.5, unit: 'lb' },
				{ name: 'Corn Tortillas', quantity: 12, unit: 'pieces' },
				{ name: 'Tomato', quantity: 4, unit: 'medium' },
				{ name: 'Onion', quantity: 1, unit: 'large' },
				{ name: 'Cilantro', quantity: 1, unit: 'bunch' },
				{ name: 'Lime', quantity: 3, unit: 'pieces' },
				{ name: 'Garlic', quantity: 4, unit: 'cloves' },
				{ name: 'Cumin', quantity: 1, unit: 'tsp' },
				{ name: 'Paprika', quantity: 1, unit: 'tsp' },
				{ name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Black Pepper', quantity: 1, unit: 'tsp' },
				{ name: 'Jalapeño', quantity: 1, unit: 'piece' },
			],
			steps: [
				'Marinate chicken with lime juice, garlic, cumin, and paprika for 30 minutes.',
				'Grill chicken until cooked through, about 6-8 minutes per side.',
				'Dice tomatoes, onions, and cilantro for salsa.',
				'Mix salsa ingredients with lime juice and salt.',
				'Warm tortillas on a dry skillet.',
				'Slice chicken and serve in tortillas with salsa.',
			],
			tags: ['Mexican', 'High-Protein', 'Gluten-Free', 'Dinner', 'Grilled'],
			nutritionalInfo: {
				calories: 380,
				proteinGrams: 28,
				carbohydratesGrams: 35,
				fatGrams: 12,
				fiberGrams: 4,
				sugarGrams: 3,
				sodiumMg: 450,
			},
		},
		{
			title: 'Classic French Croissants',
			description:
				'Buttery, flaky French croissants made from scratch. These golden pastries are perfect for breakfast or brunch with a cup of coffee.',
			cookingTimeMinutes: 180,
			servings: 12,
			authorUsername: 'emma_bakes',
			imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'All-Purpose Flour', quantity: 4, unit: 'cups' },
				{ name: 'Butter', quantity: 1.5, unit: 'cups' },
				{ name: 'Active Dry Yeast', quantity: 2.25, unit: 'tsp' },
				{ name: 'Milk', quantity: 1, unit: 'cup' },
				{ name: 'Sugar', quantity: 0.25, unit: 'cup' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Egg', quantity: 1, unit: 'piece' },
				{ name: 'Warm Water', quantity: 0.5, unit: 'cup' },
				{ name: 'Egg Yolk', quantity: 1, unit: 'piece' },
				{ name: 'Heavy Cream', quantity: 1, unit: 'tbsp' },
			],
			steps: [
				'Mix flour, yeast, sugar, and salt in a large bowl.',
				'Add warm milk and mix to form a dough.',
				'Knead dough for 10 minutes until smooth.',
				'Refrigerate dough for 1 hour.',
				'Roll out dough and fold in butter layers.',
				'Repeat folding process 3 times.',
				'Shape into croissants and let rise for 2 hours.',
				'Bake at 400°F (200°C) for 15-20 minutes.',
			],
			tags: ['French', 'Breakfast', 'Baked', 'Dessert', 'Vegetarian'],
			nutritionalInfo: {
				calories: 280,
				proteinGrams: 5,
				carbohydratesGrams: 25,
				fatGrams: 18,
				fiberGrams: 1,
				sugarGrams: 3,
				sodiumMg: 300,
			},
		},
		{
			title: 'Mediterranean Quinoa Bowl',
			description:
				'A vibrant and nutritious bowl featuring quinoa, fresh vegetables, olives, and feta cheese. Dressed with a light lemon-herb vinaigrette.',
			cookingTimeMinutes: 25,
			servings: 4,
			authorUsername: 'chef_sarah',
			imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Quinoa', quantity: 1, unit: 'cup' },
				{ name: 'Cucumber', quantity: 1, unit: 'large' },
				{ name: 'Cherry Tomatoes', quantity: 2, unit: 'cups' },
				{ name: 'Red Onion', quantity: 0.5, unit: 'piece' },
				{ name: 'Kalamata Olives', quantity: 0.5, unit: 'cup' },
				{ name: 'Feta Cheese', quantity: 0.75, unit: 'cup' },
				{ name: 'Lemon', quantity: 1, unit: 'piece' },
				{ name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
				{ name: 'Oregano', quantity: 1, unit: 'tsp' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Black Pepper', quantity: 1, unit: 'tsp' },
				{ name: 'Fresh Parsley', quantity: 0.25, unit: 'cup' },
				{ name: 'Water', quantity: 2, unit: 'cups' },
			],
			steps: [
				'Cook quinoa according to package instructions.',
				'Dice cucumber, tomatoes, and red onion.',
				'Mix vegetables with olives and feta.',
				'Whisk together lemon juice, olive oil, and oregano.',
				'Combine quinoa with vegetables and dressing.',
				'Season with salt and pepper to taste.',
			],
			tags: ['Mediterranean', 'Vegetarian', 'Gluten-Free', 'Lunch', 'High-Protein'],
			nutritionalInfo: {
				calories: 320,
				proteinGrams: 12,
				carbohydratesGrams: 35,
				fatGrams: 16,
				fiberGrams: 6,
				sugarGrams: 4,
				sodiumMg: 550,
			},
		},
		{
			title: 'Spicy Thai Green Curry',
			description:
				'Aromatic Thai green curry with tender chicken, fresh vegetables, and coconut milk. Served over jasmine rice for a complete meal.',
			cookingTimeMinutes: 40,
			servings: 6,
			authorUsername: 'marcus_kitchen',
			imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Chicken Breast', quantity: 1.5, unit: 'lb' },
				{ name: 'Coconut Milk', quantity: 2, unit: 'cans' },
				{ name: 'Green Curry Paste', quantity: 3, unit: 'tbsp' },
				{ name: 'Bamboo Shoots', quantity: 1, unit: 'can' },
				{ name: 'Bell Pepper', quantity: 2, unit: 'pieces' },
				{ name: 'Thai Basil', quantity: 1, unit: 'bunch' },
				{ name: 'Fish Sauce', quantity: 2, unit: 'tbsp' },
				{ name: 'Palm Sugar', quantity: 1, unit: 'tbsp' },
				{ name: 'Jasmine Rice', quantity: 2, unit: 'cups' },
				{ name: 'Vegetable Oil', quantity: 2, unit: 'tbsp' },
				{ name: 'Garlic', quantity: 4, unit: 'cloves' },
				{ name: 'Ginger', quantity: 1, unit: 'tbsp' },
				{ name: 'Lime', quantity: 1, unit: 'piece' },
				{ name: 'Water', quantity: 1, unit: 'cup' },
			],
			steps: [
				'Cook jasmine rice according to package instructions.',
				'Heat coconut milk in a large pot.',
				'Add green curry paste and stir until fragrant.',
				'Add chicken and cook until no longer pink.',
				'Add vegetables and bamboo shoots.',
				'Season with fish sauce and palm sugar.',
				'Garnish with Thai basil and serve over rice.',
			],
			tags: ['Thai', 'Asian', 'Spicy', 'Dinner', 'Gluten-Free'],
			nutritionalInfo: {
				calories: 420,
				proteinGrams: 25,
				carbohydratesGrams: 30,
				fatGrams: 28,
				fiberGrams: 4,
				sugarGrams: 6,
				sodiumMg: 800,
			},
		},
		{
			title: 'Chocolate Chip Cookies',
			description:
				'Classic homemade chocolate chip cookies with crispy edges and chewy centers. Perfect for satisfying your sweet tooth!',
			cookingTimeMinutes: 30,
			servings: 24,
			authorUsername: 'emma_bakes',
			imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'All-Purpose Flour', quantity: 2.25, unit: 'cups' },
				{ name: 'Butter', quantity: 1, unit: 'cup' },
				{ name: 'Brown Sugar', quantity: 0.75, unit: 'cup' },
				{ name: 'White Sugar', quantity: 0.75, unit: 'cup' },
				{ name: 'Eggs', quantity: 2, unit: 'pieces' },
				{ name: 'Vanilla Extract', quantity: 2, unit: 'tsp' },
				{ name: 'Chocolate Chips', quantity: 2, unit: 'cups' },
				{ name: 'Baking Soda', quantity: 1, unit: 'tsp' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Baking Powder', quantity: 0.5, unit: 'tsp' },
			],
			steps: [
				'Preheat oven to 375°F (190°C).',
				'Cream butter and sugars until fluffy.',
				'Beat in eggs and vanilla extract.',
				'Mix in flour, baking soda, and salt.',
				'Fold in chocolate chips.',
				'Drop rounded tablespoons onto baking sheet.',
				'Bake for 10-12 minutes until golden brown.',
			],
			tags: ['Dessert', 'Baked', 'Vegetarian', 'Kid-Friendly', 'American'],
			nutritionalInfo: {
				calories: 180,
				proteinGrams: 2,
				carbohydratesGrams: 22,
				fatGrams: 10,
				fiberGrams: 1,
				sugarGrams: 14,
				sodiumMg: 150,
			},
		},
		{
			title: 'Avocado Toast with Poached Eggs',
			description:
				'A healthy and satisfying breakfast featuring creamy avocado, perfectly poached eggs, and whole grain toast. Topped with microgreens and red pepper flakes.',
			cookingTimeMinutes: 15,
			servings: 2,
			authorUsername: 'chef_sarah',
			imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Whole Grain Bread', quantity: 4, unit: 'slices' },
				{ name: 'Avocado', quantity: 2, unit: 'pieces' },
				{ name: 'Eggs', quantity: 4, unit: 'pieces' },
				{ name: 'Lemon', quantity: 1, unit: 'piece' },
				{ name: 'Red Pepper Flakes', quantity: 1, unit: 'tsp' },
				{ name: 'Microgreens', quantity: 1, unit: 'cup' },
				{ name: 'Sea Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Black Pepper', quantity: 1, unit: 'tsp' },
				{ name: 'White Vinegar', quantity: 1, unit: 'tbsp' },
				{ name: 'Olive Oil', quantity: 1, unit: 'tsp' },
			],
			steps: [
				'Toast bread until golden brown.',
				'Mash avocado with lemon juice, salt, and pepper.',
				'Poach eggs in simmering water for 3-4 minutes.',
				'Spread mashed avocado on toast.',
				'Top with poached eggs and microgreens.',
				'Sprinkle with red pepper flakes and serve.',
			],
			tags: ['Breakfast', 'Vegetarian', 'High-Protein', 'Quick & Easy', 'Healthy'],
			nutritionalInfo: {
				calories: 380,
				proteinGrams: 18,
				carbohydratesGrams: 25,
				fatGrams: 24,
				fiberGrams: 8,
				sugarGrams: 2,
				sodiumMg: 450,
			},
		},
		{
			title: 'Beef Tacos with Homemade Guacamole',
			description:
				'Juicy beef tacos with homemade guacamole, fresh salsa, and all the traditional toppings. A crowd-pleasing Mexican favorite!',
			cookingTimeMinutes: 35,
			servings: 6,
			authorUsername: 'marcus_kitchen',
			imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Ground Beef', quantity: 1.5, unit: 'lb' },
				{ name: 'Corn Tortillas', quantity: 12, unit: 'pieces' },
				{ name: 'Avocado', quantity: 3, unit: 'pieces' },
				{ name: 'Tomato', quantity: 2, unit: 'pieces' },
				{ name: 'Onion', quantity: 1, unit: 'large' },
				{ name: 'Lime', quantity: 2, unit: 'pieces' },
				{ name: 'Cilantro', quantity: 1, unit: 'bunch' },
				{ name: 'Taco Seasoning', quantity: 1, unit: 'packet' },
				{ name: 'Cheese', quantity: 1, unit: 'cup' },
				{ name: 'Vegetable Oil', quantity: 2, unit: 'tbsp' },
				{ name: 'Sour Cream', quantity: 0.5, unit: 'cup' },
				{ name: 'Lettuce', quantity: 1, unit: 'head' },
				{ name: 'Jalapeño', quantity: 1, unit: 'piece' },
			],
			steps: [
				'Brown ground beef in a large skillet.',
				'Add taco seasoning and water, simmer for 5 minutes.',
				'Mash avocados with lime juice, salt, and cilantro.',
				'Dice tomatoes and onions for salsa.',
				'Warm tortillas on a dry skillet.',
				'Assemble tacos with beef, guacamole, and toppings.',
			],
			tags: ['Mexican', 'High-Protein', 'Dinner', 'Gluten-Free', 'Kid-Friendly'],
			nutritionalInfo: {
				calories: 450,
				proteinGrams: 30,
				carbohydratesGrams: 35,
				fatGrams: 25,
				fiberGrams: 6,
				sugarGrams: 3,
				sodiumMg: 650,
			},
		},
		{
			title: 'French Onion Soup',
			description:
				'Classic French onion soup with caramelized onions, rich beef broth, and melted Gruyère cheese on toasted baguette slices.',
			cookingTimeMinutes: 90,
			servings: 6,
			authorUsername: 'emma_bakes',
			imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Onions', quantity: 6, unit: 'large' },
				{ name: 'Beef Broth', quantity: 8, unit: 'cups' },
				{ name: 'Butter', quantity: 4, unit: 'tbsp' },
				{ name: 'Baguette', quantity: 1, unit: 'loaf' },
				{ name: 'Gruyère Cheese', quantity: 2, unit: 'cups' },
				{ name: 'White Wine', quantity: 0.5, unit: 'cup' },
				{ name: 'Thyme', quantity: 2, unit: 'sprigs' },
				{ name: 'Bay Leaves', quantity: 2, unit: 'pieces' },
				{ name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Black Pepper', quantity: 1, unit: 'tsp' },
				{ name: 'All-Purpose Flour', quantity: 2, unit: 'tbsp' },
			],
			steps: [
				'Slice onions thinly and caramelize in butter for 45 minutes.',
				'Add white wine and deglaze the pan.',
				'Add beef broth, thyme, and bay leaves.',
				'Simmer for 30 minutes until flavors meld.',
				'Toast baguette slices until golden.',
				'Top soup with bread and cheese.',
				'Broil until cheese is bubbly and golden.',
			],
			tags: ['French', 'Soup', 'Vegetarian', 'Dinner', 'Comfort Food'],
			nutritionalInfo: {
				calories: 320,
				proteinGrams: 15,
				carbohydratesGrams: 25,
				fatGrams: 18,
				fiberGrams: 4,
				sugarGrams: 8,
				sodiumMg: 1200,
			},
		},
		{
			title: 'Greek Salad with Feta and Olives',
			description:
				'Fresh and vibrant Greek salad with crisp vegetables, tangy feta cheese, Kalamata olives, and a light olive oil dressing.',
			cookingTimeMinutes: 15,
			servings: 4,
			authorUsername: 'chef_sarah',
			imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Cucumber', quantity: 2, unit: 'pieces' },
				{ name: 'Tomato', quantity: 4, unit: 'pieces' },
				{ name: 'Red Onion', quantity: 1, unit: 'piece' },
				{ name: 'Kalamata Olives', quantity: 1, unit: 'cup' },
				{ name: 'Feta Cheese', quantity: 1, unit: 'cup' },
				{ name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
				{ name: 'Lemon', quantity: 1, unit: 'piece' },
				{ name: 'Oregano', quantity: 1, unit: 'tsp' },
				{ name: 'Bell Pepper', quantity: 1, unit: 'piece' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Black Pepper', quantity: 1, unit: 'tsp' },
				{ name: 'Red Wine Vinegar', quantity: 1, unit: 'tbsp' },
			],
			steps: [
				'Dice cucumber, tomatoes, and bell pepper.',
				'Slice red onion thinly.',
				'Combine vegetables in a large bowl.',
				'Add olives and crumbled feta cheese.',
				'Whisk together olive oil, lemon juice, and oregano.',
				'Toss salad with dressing and serve.',
			],
			tags: ['Greek', 'Mediterranean', 'Vegetarian', 'Salad', 'Gluten-Free'],
			nutritionalInfo: {
				calories: 220,
				proteinGrams: 8,
				carbohydratesGrams: 12,
				fatGrams: 18,
				fiberGrams: 4,
				sugarGrams: 6,
				sodiumMg: 800,
			},
		},
		{
			title: 'Chicken Stir-Fry with Vegetables',
			description:
				'Quick and healthy chicken stir-fry with colorful vegetables in a savory soy-ginger sauce. Perfect for a busy weeknight dinner.',
			cookingTimeMinutes: 25,
			servings: 4,
			authorUsername: 'marcus_kitchen',
			imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Chicken Breast', quantity: 1, unit: 'lb' },
				{ name: 'Broccoli', quantity: 2, unit: 'cups' },
				{ name: 'Bell Pepper', quantity: 2, unit: 'pieces' },
				{ name: 'Carrot', quantity: 2, unit: 'pieces' },
				{ name: 'Soy Sauce', quantity: 3, unit: 'tbsp' },
				{ name: 'Ginger', quantity: 1, unit: 'tbsp' },
				{ name: 'Garlic', quantity: 3, unit: 'cloves' },
				{ name: 'Sesame Oil', quantity: 2, unit: 'tbsp' },
				{ name: 'Brown Rice', quantity: 2, unit: 'cups' },
				{ name: 'Vegetable Oil', quantity: 2, unit: 'tbsp' },
				{ name: 'Cornstarch', quantity: 1, unit: 'tsp' },
				{ name: 'Water', quantity: 0.5, unit: 'cup' },
				{ name: 'Green Onion', quantity: 2, unit: 'pieces' },
			],
			steps: [
				'Cook brown rice according to package instructions.',
				'Cut chicken into bite-sized pieces.',
				'Stir-fry chicken in sesame oil until cooked through.',
				'Add vegetables and stir-fry for 3-4 minutes.',
				'Add soy sauce, ginger, and garlic.',
				'Cook for 2 more minutes until sauce thickens.',
				'Serve over brown rice.',
			],
			tags: ['Asian', 'High-Protein', 'Gluten-Free', 'Dinner', 'Quick & Easy'],
			nutritionalInfo: {
				calories: 380,
				proteinGrams: 32,
				carbohydratesGrams: 35,
				fatGrams: 12,
				fiberGrams: 6,
				sugarGrams: 4,
				sodiumMg: 750,
			},
		},
		{
			title: 'Blueberry Muffins',
			description:
				'Moist and fluffy blueberry muffins with a golden brown top. Made with fresh blueberries and a hint of vanilla for the perfect breakfast treat.',
			cookingTimeMinutes: 35,
			servings: 12,
			authorUsername: 'emma_bakes',
			imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'All-Purpose Flour', quantity: 2, unit: 'cups' },
				{ name: 'Sugar', quantity: 0.75, unit: 'cup' },
				{ name: 'Baking Powder', quantity: 2, unit: 'tsp' },
				{ name: 'Salt', quantity: 0.5, unit: 'tsp' },
				{ name: 'Eggs', quantity: 2, unit: 'pieces' },
				{ name: 'Milk', quantity: 1, unit: 'cup' },
				{ name: 'Butter', quantity: 0.5, unit: 'cup' },
				{ name: 'Blueberries', quantity: 1.5, unit: 'cups' },
				{ name: 'Vanilla Extract', quantity: 1, unit: 'tsp' },
				{ name: 'Vegetable Oil', quantity: 2, unit: 'tbsp' },
				{ name: 'Cinnamon', quantity: 0.5, unit: 'tsp' },
			],
			steps: [
				'Preheat oven to 400°F (200°C).',
				'Mix flour, sugar, baking powder, and salt.',
				'In another bowl, whisk eggs, milk, melted butter, and vanilla.',
				'Combine wet and dry ingredients until just mixed.',
				'Fold in blueberries gently.',
				'Fill muffin tins and bake for 20-25 minutes.',
			],
			tags: ['Breakfast', 'Baked', 'Vegetarian', 'Kid-Friendly', 'American'],
			nutritionalInfo: {
				calories: 180,
				proteinGrams: 3,
				carbohydratesGrams: 28,
				fatGrams: 6,
				fiberGrams: 1,
				sugarGrams: 15,
				sodiumMg: 200,
			},
		},
		{
			title: 'Lentil Soup with Spinach',
			description:
				'Hearty and nutritious lentil soup with fresh spinach, aromatic spices, and a rich vegetable broth. Perfect for a healthy lunch or dinner.',
			cookingTimeMinutes: 50,
			servings: 6,
			authorUsername: 'chef_sarah',
			imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Lentils', quantity: 1, unit: 'cup' },
				{ name: 'Spinach', quantity: 4, unit: 'cups' },
				{ name: 'Onion', quantity: 1, unit: 'large' },
				{ name: 'Carrot', quantity: 3, unit: 'pieces' },
				{ name: 'Garlic', quantity: 4, unit: 'cloves' },
				{ name: 'Vegetable Broth', quantity: 6, unit: 'cups' },
				{ name: 'Cumin', quantity: 1, unit: 'tsp' },
				{ name: 'Turmeric', quantity: 1, unit: 'tsp' },
				{ name: 'Lemon', quantity: 1, unit: 'piece' },
				{ name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Black Pepper', quantity: 1, unit: 'tsp' },
				{ name: 'Bay Leaf', quantity: 1, unit: 'piece' },
			],
			steps: [
				'Sauté onion, carrot, and garlic in olive oil.',
				'Add lentils, broth, cumin, and turmeric.',
				'Bring to boil, then simmer for 30 minutes.',
				'Add spinach and cook for 5 more minutes.',
				'Season with salt, pepper, and lemon juice.',
				'Serve hot with crusty bread.',
			],
			tags: ['Soup', 'Vegetarian', 'Vegan', 'Gluten-Free', 'High-Protein'],
			nutritionalInfo: {
				calories: 220,
				proteinGrams: 15,
				carbohydratesGrams: 35,
				fatGrams: 2,
				fiberGrams: 12,
				sugarGrams: 4,
				sodiumMg: 400,
			},
		},
		{
			title: 'Pasta Carbonara',
			description:
				'Classic Italian pasta carbonara with crispy pancetta, creamy egg sauce, and freshly grated Parmesan cheese. A simple yet elegant dish.',
			cookingTimeMinutes: 25,
			servings: 4,
			authorUsername: 'marcus_kitchen',
			imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Spaghetti', quantity: 1, unit: 'lb' },
				{ name: 'Pancetta', quantity: 8, unit: 'oz' },
				{ name: 'Eggs', quantity: 4, unit: 'pieces' },
				{ name: 'Parmesan Cheese', quantity: 1, unit: 'cup' },
				{ name: 'Black Pepper', quantity: 2, unit: 'tsp' },
				{ name: 'Garlic', quantity: 3, unit: 'cloves' },
				{ name: 'Parsley', quantity: 0.25, unit: 'cup' },
				{ name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Egg Yolks', quantity: 2, unit: 'pieces' },
				{ name: 'Pasta Water', quantity: 1, unit: 'cup' },
			],
			steps: [
				'Cook spaghetti in salted water until al dente.',
				'Cook pancetta in olive oil until crispy.',
				'Whisk eggs, Parmesan, and black pepper.',
				'Drain pasta, reserving 1 cup of pasta water.',
				'Toss hot pasta with egg mixture and pancetta.',
				'Add pasta water if needed for creaminess.',
				'Garnish with parsley and serve immediately.',
			],
			tags: ['Italian', 'Pasta', 'High-Protein', 'Dinner', 'Comfort Food'],
			nutritionalInfo: {
				calories: 520,
				proteinGrams: 25,
				carbohydratesGrams: 45,
				fatGrams: 28,
				fiberGrams: 2,
				sugarGrams: 2,
				sodiumMg: 850,
			},
		},
		{
			title: 'Chocolate Lava Cake',
			description:
				'Decadent chocolate lava cakes with molten chocolate centers. Served warm with a dusting of powdered sugar and fresh berries.',
			cookingTimeMinutes: 20,
			servings: 4,
			authorUsername: 'emma_bakes',
			imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Dark Chocolate', quantity: 6, unit: 'oz' },
				{ name: 'Butter', quantity: 0.5, unit: 'cup' },
				{ name: 'Eggs', quantity: 3, unit: 'pieces' },
				{ name: 'Sugar', quantity: 0.5, unit: 'cup' },
				{ name: 'All-Purpose Flour', quantity: 0.25, unit: 'cup' },
				{ name: 'Vanilla Extract', quantity: 1, unit: 'tsp' },
				{ name: 'Salt', quantity: 0.25, unit: 'tsp' },
				{ name: 'Powdered Sugar', quantity: 2, unit: 'tbsp' },
				{ name: 'Cocoa Powder', quantity: 1, unit: 'tbsp' },
				{ name: 'Fresh Berries', quantity: 0.5, unit: 'cup' },
			],
			steps: [
				'Preheat oven to 425°F (220°C).',
				'Melt chocolate and butter together.',
				'Whisk eggs and sugar until pale.',
				'Fold in melted chocolate mixture.',
				'Gently fold in flour and vanilla.',
				'Pour into greased ramekins.',
				'Bake for 12-14 minutes until edges are set.',
				'Dust with powdered sugar and serve warm.',
			],
			tags: ['Dessert', 'Baked', 'Vegetarian', 'Chocolate', 'French'],
			nutritionalInfo: {
				calories: 380,
				proteinGrams: 6,
				carbohydratesGrams: 35,
				fatGrams: 24,
				fiberGrams: 2,
				sugarGrams: 28,
				sodiumMg: 150,
			},
		},
		{
			title: 'Grilled Vegetable Platter',
			description:
				'Colorful grilled vegetable platter with zucchini, eggplant, bell peppers, and mushrooms. Dressed with a light herb vinaigrette.',
			cookingTimeMinutes: 30,
			servings: 6,
			authorUsername: 'chef_sarah',
			imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Zucchini', quantity: 3, unit: 'pieces' },
				{ name: 'Eggplant', quantity: 2, unit: 'pieces' },
				{ name: 'Bell Pepper', quantity: 4, unit: 'pieces' },
				{ name: 'Mushroom', quantity: 1, unit: 'lb' },
				{ name: 'Olive Oil', quantity: 4, unit: 'tbsp' },
				{ name: 'Balsamic Vinegar', quantity: 2, unit: 'tbsp' },
				{ name: 'Rosemary', quantity: 2, unit: 'sprigs' },
				{ name: 'Thyme', quantity: 2, unit: 'sprigs' },
				{ name: 'Garlic', quantity: 4, unit: 'cloves' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Black Pepper', quantity: 1, unit: 'tsp' },
				{ name: 'Cherry Tomatoes', quantity: 1, unit: 'cup' },
			],
			steps: [
				'Preheat grill to medium-high heat.',
				'Slice vegetables into uniform pieces.',
				'Toss vegetables with olive oil, herbs, and garlic.',
				'Grill vegetables until tender and charred.',
				'Drizzle with balsamic vinegar.',
				'Season with salt and pepper to taste.',
				'Serve warm or at room temperature.',
			],
			tags: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Grilled', 'Side Dish'],
			nutritionalInfo: {
				calories: 120,
				proteinGrams: 4,
				carbohydratesGrams: 12,
				fatGrams: 8,
				fiberGrams: 5,
				sugarGrams: 6,
				sodiumMg: 200,
			},
		},
		{
			title: 'Beef Burger with Caramelized Onions',
			description:
				'Juicy beef burger with caramelized onions, melted cheese, and all the classic toppings. Served on a toasted brioche bun.',
			cookingTimeMinutes: 35,
			servings: 4,
			authorUsername: 'marcus_kitchen',
			imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Ground Beef', quantity: 1.5, unit: 'lb' },
				{ name: 'Brioche Buns', quantity: 4, unit: 'pieces' },
				{ name: 'Onion', quantity: 2, unit: 'large' },
				{ name: 'Cheese Slices', quantity: 4, unit: 'pieces' },
				{ name: 'Lettuce', quantity: 1, unit: 'head' },
				{ name: 'Tomato', quantity: 2, unit: 'pieces' },
				{ name: 'Pickles', quantity: 8, unit: 'slices' },
				{ name: 'Ketchup', quantity: 4, unit: 'tbsp' },
				{ name: 'Mustard', quantity: 4, unit: 'tbsp' },
				{ name: 'Butter', quantity: 2, unit: 'tbsp' },
				{ name: 'Salt', quantity: 1, unit: 'tsp' },
				{ name: 'Black Pepper', quantity: 1, unit: 'tsp' },
				{ name: 'Worcestershire Sauce', quantity: 1, unit: 'tsp' },
			],
			steps: [
				'Form beef into 4 equal patties.',
				'Caramelize onions in butter until golden.',
				'Grill burgers for 4-5 minutes per side.',
				'Add cheese during last minute of cooking.',
				'Toast brioche buns on the grill.',
				'Assemble burgers with all toppings.',
				'Serve with fries or salad.',
			],
			tags: ['American', 'High-Protein', 'Dinner', 'Grilled', 'Comfort Food'],
			nutritionalInfo: {
				calories: 580,
				proteinGrams: 35,
				carbohydratesGrams: 35,
				fatGrams: 35,
				fiberGrams: 3,
				sugarGrams: 8,
				sodiumMg: 950,
			},
		},
		{
			title: 'Tiramisu',
			description:
				'Classic Italian tiramisu with layers of coffee-soaked ladyfingers and creamy mascarpone filling. Topped with cocoa powder.',
			cookingTimeMinutes: 45,
			servings: 8,
			authorUsername: 'emma_bakes',
			imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop',
			ingredients: [
				{ name: 'Ladyfingers', quantity: 24, unit: 'pieces' },
				{ name: 'Mascarpone Cheese', quantity: 16, unit: 'oz' },
				{ name: 'Heavy Cream', quantity: 1, unit: 'cup' },
				{ name: 'Eggs', quantity: 4, unit: 'pieces' },
				{ name: 'Sugar', quantity: 0.75, unit: 'cup' },
				{ name: 'Strong Coffee', quantity: 1.5, unit: 'cups' },
				{ name: 'Cocoa Powder', quantity: 2, unit: 'tbsp' },
				{ name: 'Vanilla Extract', quantity: 1, unit: 'tsp' },
				{ name: 'Coffee Liqueur', quantity: 2, unit: 'tbsp' },
				{ name: 'Salt', quantity: 0.25, unit: 'tsp' },
			],
			steps: [
				'Brew strong coffee and let cool.',
				'Separate eggs and beat yolks with sugar.',
				'Fold in mascarpone cheese.',
				'Whip cream to stiff peaks and fold in.',
				'Dip ladyfingers in coffee and layer in dish.',
				'Spread mascarpone mixture over ladyfingers.',
				'Repeat layers and dust with cocoa powder.',
				'Refrigerate for at least 4 hours before serving.',
			],
			tags: ['Italian', 'Dessert', 'Vegetarian', 'Coffee', 'No-Bake'],
			nutritionalInfo: {
				calories: 420,
				proteinGrams: 8,
				carbohydratesGrams: 35,
				fatGrams: 28,
				fiberGrams: 1,
				sugarGrams: 25,
				sodiumMg: 120,
			},
		},
	];

	// Create recipes
	for (const recipeData of recipes) {
		const author = createdUsers.find(user => user.username === recipeData.authorUsername);
		if (!author) continue;

		// Create recipe
		const recipe = await prisma.recipe.create({
			data: {
				title: recipeData.title,
				description: recipeData.description,
				cookingTimeMinutes: recipeData.cookingTimeMinutes,
				servings: recipeData.servings,
				authorId: author.id,
				status: VerificationStatus.verified,
				verifiedAt: new Date(),
				verifiedById: createdUsers.find(u => u.username === 'dr_nutrition')?.id,
			},
		});

		// Create ingredients
		for (const ingredientData of recipeData.ingredients) {
			const ingredient = createdIngredients.find(
				i => i.name.toLowerCase() === ingredientData.name.toLowerCase(),
			);
			const unit = createdUnits.find(u => {
				const unitName = u.unitName.toLowerCase();
				const ingredientUnit = ingredientData.unit.toLowerCase();
				return (
					unitName === ingredientUnit ||
					unitName === ingredientUnit.replace(/s$/, '') || // Remove plural 's'
					unitName + 's' === ingredientUnit
				); // Add plural 's'
			});

			if (ingredient && unit) {
				await prisma.recipeIngredient.create({
					data: {
						recipeId: recipe.id,
						ingredientId: ingredient.id,
						unitId: unit.id,
						quantity: ingredientData.quantity,
					},
				});
			} else {
				console.log(
					`Warning: Could not find ingredient "${ingredientData.name}" or unit "${ingredientData.unit}" for recipe "${recipeData.title}"`,
				);
			}
		}

		// Create preparation steps
		for (let i = 0; i < recipeData.steps.length; i++) {
			await prisma.preparationStep.create({
				data: {
					recipeId: recipe.id,
					stepNumber: i + 1,
					instruction: recipeData.steps[i],
				},
			});
		}

		// Create media
		await prisma.media.create({
			data: {
				recipeId: recipe.id,
				mediaType: MediaType.image,
				url: recipeData.imageUrl,
				caption: recipeData.title,
			},
		});

		// Create tags
		for (const tagName of recipeData.tags) {
			const tag = await prisma.tag.findFirst({
				where: { tagName: { equals: tagName, mode: 'insensitive' } },
			});
			if (tag) {
				await prisma.recipeTag.create({
					data: {
						recipeId: recipe.id,
						tagId: tag.id,
					},
				});
			}
		}

		// Create nutritional information
		if (recipeData.nutritionalInfo) {
			await prisma.nutritionalInformation.create({
				data: {
					recipeId: recipe.id,
					calories: recipeData.nutritionalInfo.calories,
					proteinGrams: recipeData.nutritionalInfo.proteinGrams,
					carbohydratesGrams: recipeData.nutritionalInfo.carbohydratesGrams,
					fatGrams: recipeData.nutritionalInfo.fatGrams,
					fiberGrams: recipeData.nutritionalInfo.fiberGrams,
					sugarGrams: recipeData.nutritionalInfo.sugarGrams,
					sodiumMg: recipeData.nutritionalInfo.sodiumMg,
					dataSource: NutritionDataSource.verified_nutritionist,
				},
			});
		}

		console.log(`Created recipe: ${recipe.title}`);
	}

	console.log('Database seeded successfully!');
}

main()
	.catch(e => {
		console.error('Error seeding database:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
