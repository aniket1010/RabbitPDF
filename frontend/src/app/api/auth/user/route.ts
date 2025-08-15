import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/nextauth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // For development, return mock user data
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        id: 'dev-user',
        name: 'Developer',
        email: 'dev@example.com',
        avatar: '/avatars/Horse.png'
      });
    }

    // In production, fetch from your database
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   select: { id: true, name: true, email: true, avatar: true }
    // });

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      avatar: session.user.avatar || session.user.image
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
