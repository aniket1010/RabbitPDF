import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Make a request to our backend to check if user exists
    const response = await fetch(`${API_BASE}/user/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      const userData = await response.json();
      return NextResponse.json(userData);
    } else if (response.status === 404) {
      return NextResponse.json({ user: null });
    } else {
      throw new Error('Failed to lookup user');
    }
  } catch (error) {
    console.error('Error looking up user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
