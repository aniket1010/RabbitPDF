import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { onboardingData } = body

    // Save onboarding data to your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}/user/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        userId: session.user.id,
        onboardingData,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save onboarding data')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ [Onboarding] Error:', error)
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 })
  }
}
