import { signIn } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
		}

		const result = await signIn('credentials', {
			email,
			password,
			action: 'signin',
			redirect: false,
		});

		if (result?.error) {
			return NextResponse.json({ error: result.error }, { status: 401 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Signin error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
