# Flavourly 🍽️

A comprehensive recipe sharing platform with nutritionist verification, meal planning, and smart shopping list generation. Built with Next.js 15, featuring role-based access control, real-time collaboration, and expert-verified recipes.

## ✨ Features

### 🍳 Recipe Management

- **Create & Share Recipes**: Build detailed recipes with ingredients, instructions, and nutritional information
- **Nutritionist Verification**: Expert-verified recipes with health tips and nutritional analysis
- **Recipe Collections**: Organize recipes into custom collections
- **Favorites System**: Save and manage your favorite recipes
- **Advanced Search**: Filter by cuisine, dietary restrictions, cooking time, and more
- **Media Upload**: Add photos and videos to your recipes (Cloudinary integration)

### 👨‍⚕️ Nutritionist Dashboard

- **Recipe Verification**: Review and approve recipes with detailed feedback
- **Health Tips**: Provide nutritional guidance and health recommendations
- **Quality Control**: Ensure recipes meet nutritional standards
- **Statistics & Analytics**: Track verification metrics and platform health

### 🗓️ Meal Planning

- **Smart Meal Planning**: Create weekly meal plans with drag-and-drop interface
- **Nutritional Tracking**: Monitor daily nutritional intake
- **Shopping List Generation**: Automatically generate shopping lists from meal plans
- **Recipe Integration**: Seamlessly add verified recipes to your meal plans

### 🛒 Shopping Lists

- **Smart Generation**: Auto-generate shopping lists from meal plans
- **Manual Management**: Create and manage custom shopping lists
- **Item Organization**: Categorize items by store sections
- **Collaboration**: Share lists with family members

### 👤 User Management

- **Role-Based Access**: Recipe Developers and Nutritionists with different permissions
- **Profile Management**: Detailed user profiles with dietary preferences
- **Dietary Preferences**: Track allergies, restrictions, and cuisine preferences
- **Cooking Skill Levels**: Personalized experience based on expertise

### 🔐 Authentication & Security

- **NextAuth.js Integration**: Secure authentication with email/password
- **Role-Based Routing**: Protected routes based on user roles
- **Session Management**: Persistent user sessions
- **Account Settings**: Profile updates, password changes, and account deletion

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: TanStack React Query
- **Media Storage**: Cloudinary (optional)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Package Manager**: pnpm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

### Installing pnpm

If you don't have pnpm installed:

```bash
# Using npm
npm install -g pnpm

# Using Homebrew (macOS)
brew install pnpm

# Using curl
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flavourly
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
# Generate environment file with default values
pnpm run setup:env
```

This creates a `.env.local` file. You'll need to update the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flavourly"

# Cloudinary (Optional - for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=flavourly_uploads
```

### 4. Set Up Database

```bash
# Push the schema to your database
pnpm run db:push

# Or run migrations if you prefer
pnpm run db:migrate
```

### 5. Seed the Database

```bash
# Seed with sample data including users and roles
pnpm run db:seed
```

This creates:

- **Roles**: RecipeDeveloper, Nutritionist
- **Sample Users**: 3 Recipe Developers + 3 Nutritionists
- **Sample Recipes**: Various verified and pending recipes
- **Sample Data**: Tags, collections, and other metadata

### 6. Start Development Server

```bash
pnpm run dev
```

### 7. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

### Required Variables

| Variable          | Description                  | Example                                           |
| ----------------- | ---------------------------- | ------------------------------------------------- |
| `NEXTAUTH_URL`    | Your application URL         | `http://localhost:3000`                           |
| `NEXTAUTH_SECRET` | Secret key for NextAuth      | Generate with `openssl rand -base64 32`           |
| `DATABASE_URL`    | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/flavourly` |

### Optional Variables (Cloudinary)

| Variable                               | Description                | Example             |
| -------------------------------------- | -------------------------- | ------------------- |
| `CLOUDINARY_CLOUD_NAME`                | Your Cloudinary cloud name | `my-cloud-name`     |
| `CLOUDINARY_API_KEY`                   | Your Cloudinary API key    | `123456789012345`   |
| `CLOUDINARY_API_SECRET`                | Your Cloudinary API secret | `your-secret-key`   |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Public cloud name          | `my-cloud-name`     |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Upload preset name         | `flavourly_uploads` |

## ☁️ Cloudinary Setup (Optional)

For media uploads (profile pictures, recipe images), you can configure Cloudinary:

### Option 1: Interactive Setup

```bash
pnpm run setup:cloudinary
```

This interactive script will guide you through the setup process.

### Option 2: Manual Setup

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard
3. Update your `.env.local` file with the Cloudinary variables
4. Create an upload preset named `flavourly_uploads` in your Cloudinary dashboard

## 🗄️ Database Setup

### PostgreSQL Installation

#### macOS (using Homebrew)

```bash
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows

Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE flavourly;

# Create user (optional)
CREATE USER flavourly_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE flavourly TO flavourly_user;

# Exit
\q
```

## 👥 Sample Users

After seeding the database, you can log in with these sample accounts:

### Recipe Developers

- **Username**: `chef_sarah` | **Email**: `sarah.chen@example.com` | **Password**: `password123`
- **Username**: `marcus_kitchen` | **Email**: `marcus.rodriguez@example.com` | **Password**: `password123`
- **Username**: `emma_bakes` | **Email**: `emma.wilson@example.com` | **Password**: `password123`

### Nutritionists

- **Username**: `dr_nutrition` | **Email**: `dr.lisa.patel@example.com` | **Password**: `password123`
- **Username**: `health_coach_mike` | **Email**: `mike.thompson@example.com` | **Password**: `password123`
- **Username**: `nutrition_expert` | **Email**: `jessica.garcia@example.com` | **Password**: `password123`

## 🧪 Testing

### Test Authentication

```bash
# Test authentication error handling
pnpm run test:auth

# Test specific auth scenarios
pnpm run test:signup
pnpm run test:signin
```

### Test Features

```bash
# Test various application features
pnpm run test:dashboard
pnpm run test:media-upload
pnpm run test:nutritionist
```

## 📁 Project Structure

```
flavourly/
├── app/                    # Next.js App Router
│   ├── (main)/            # Main layout pages
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard pages
│   └── nutritionist/      # Nutritionist-specific pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── nutritionist/     # Nutritionist-specific components
├── lib/                  # Utility libraries
│   ├── hooks/           # Custom React hooks
│   ├── queries/         # React Query configurations
│   └── prisma.ts        # Database client
├── prisma/              # Database schema and migrations
├── scripts/             # Setup and utility scripts
└── types/               # TypeScript type definitions
```

## 🔍 Available Scripts

| Script                        | Description                             |
| ----------------------------- | --------------------------------------- |
| `pnpm run dev`                | Start development server with Turbopack |
| `pnpm run build`              | Build for production                    |
| `pnpm run start`              | Start production server                 |
| `pnpm run lint`               | Run ESLint                              |
| `pnpm run db:seed`            | Seed database with sample data          |
| `pnpm run setup:env`          | Generate environment file               |
| `pnpm run setup:cloudinary`   | Interactive Cloudinary setup            |
| `pnpm run disable:cloudinary` | Disable Cloudinary integration          |

## 🐛 Troubleshooting

### Common Issues

#### Authentication Errors

- **"Configuration" Error**: Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- **"Sign In Failed"**: Verify database connection and seeded data
- **"No account found"**: Ensure database is seeded with sample users

#### Database Connection Issues

- **Connection refused**: Ensure PostgreSQL is running
- **Authentication failed**: Check `DATABASE_URL` credentials
- **Database doesn't exist**: Create the database first

#### Media Upload Issues

- **Cloudinary errors**: Verify Cloudinary credentials and upload preset
- **Upload fails**: Check network connection and file size limits

### Debug Commands

```bash
# Check database connection
pnpm run db:check

# Verify seeded data
pnpm run verify:seed

# Check roles
pnpm run check:roles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Happy cooking! 🍳✨**
