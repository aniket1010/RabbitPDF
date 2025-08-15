import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const { id, email, name, image } = await request.json();
    
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    console.log('🔍 [UserCreate] Creating new user:', { id, email, name });

    // Make a request to our backend to create the user
    const response = await fetch(`${API_BASE}/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, email, name, image })
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ [UserCreate] User created successfully:', userData);
      return NextResponse.json(userData);
    } else {
      const errorText = await response.text();
      console.error('❌ [UserCreate] Failed to create user:', errorText);
      throw new Error('Failed to create user');
    }
  } catch (error) {
    console.error('❌ [UserCreate] Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
