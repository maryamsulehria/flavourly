import { RoleName } from '@prisma/client';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			id: 'credentials',
			name: 'credentials',
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
					placeholder: 'john@example.com',
				},
				password: {
					label: 'Password',
					type: 'password',
				},
				username: {
					label: 'Username',
					type: 'text',
					placeholder: 'john_doe',
				},
				fullName: {
					label: 'Full Name',
					type: 'text',
					placeholder: 'John Doe',
				},
				role: {
					label: 'Role',
					type: 'text',
				},
				action: {
					label: 'Action',
					type: 'text', // This will be used to determine if it's signin or signup
				},
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error('Email and password are required');
				}

				const email = credentials.email as string;
				const password = credentials.password as string;
				const action = credentials.action as string;

				try {
					if (action === 'signup') {
						// Handle user registration
						const username = credentials.username as string;
						const fullName = credentials.fullName as string;
						const role = credentials.role as string;

						if (!username || !fullName) {
							throw new Error('Username and full name are required for registration');
						}

						// Validate password strength
						if (password.length < 8) {
							throw new Error('Password must be at least 8 characters long');
						}

						const hasLetters = /[a-zA-Z]/.test(password);
						const hasNumbers = /\d/.test(password);
						if (!hasLetters || !hasNumbers) {
							throw new Error('Password must contain both letters and numbers');
						}

						// Check if user already exists
						const existingUser = await prisma.user.findFirst({
							where: {
								OR: [{ email: email }, { username: username }],
							},
						});

						if (existingUser) {
							throw new Error('User with this email or username already exists');
						}

						// Get the role based on selection
						let roleToAssign: RoleName;
						if (role === 'Nutritionist') {
							roleToAssign = RoleName.Nutritionist;
						} else {
							roleToAssign = RoleName.RecipeDeveloper;
						}

						const userRole = await prisma.role.findUnique({
							where: { name: roleToAssign },
						});

						if (!userRole) {
							throw new Error('Role not found. Please seed the database first.');
						}

						// Hash the password
						const hashedPassword = await bcrypt.hash(password, 12);

						// Create new user
						const newUser = await prisma.user.create({
							data: {
								email: email,
								username: username,
								fullName: fullName,
								passwordHash: hashedPassword,
								roleId: userRole.id,
							},
							include: {
								role: true,
							},
						});

						return {
							id: newUser.id.toString(),
							email: newUser.email,
							name: newUser.fullName,
							username: newUser.username,
							role: newUser.role.name,
						};
					} else {
						// Handle user sign in
						const user = await prisma.user.findUnique({
							where: { email: email },
							include: {
								role: true,
							},
						});

						if (!user) {
							throw new Error('No user found with this email');
						}

						const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

						if (!isPasswordValid) {
							throw new Error('Invalid password');
						}

						return {
							id: user.id.toString(),
							email: user.email,
							name: user.fullName,
							username: user.username,
							role: user.role.name,
						};
					}
				} catch (error) {
					console.error('Auth error:', error);

					// Provide more specific error messages for common database issues
					if (error instanceof Error) {
						const errorMessage = error.message;

						// Check for database connection issues
						if (errorMessage.includes('connect') || errorMessage.includes('connection')) {
							throw new Error('Database connection error');
						}

						// Check for Prisma-specific errors
						if (errorMessage.includes('P2002')) {
							throw new Error('User with this email or username already exists');
						}

						if (errorMessage.includes('P2025')) {
							throw new Error('User not found');
						}

						// Re-throw the original error if it's already user-friendly
						throw error;
					}

					// For unknown errors, provide a generic message
					throw new Error('An unexpected error occurred during authentication');
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.username = user.username;
				token.role = user.role;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && token.sub) {
				session.user.id = token.sub;
				session.user.username = token.username as string;
				session.user.role = token.role as RoleName;
			}
			return session;
		},
		async signIn({ user, account, profile, email, credentials }) {
			// This callback is called after successful authentication
			return true;
		},
	},
	pages: {
		signIn: '/signin',
	},
	session: {
		strategy: 'jwt',
	},
	debug: process.env.NODE_ENV === 'development',
});
