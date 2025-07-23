import { RoleName } from '@prisma/client';

declare module 'next-auth' {
	interface User {
		id: string;
		email: string;
		name: string | null;
		username: string;
		role: RoleName;
	}

	interface Session {
		user: {
			id: string;
			email: string;
			name: string | null;
			username: string;
			role: RoleName;
		};
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		username: string;
		role: RoleName;
	}
}
