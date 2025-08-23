import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the body to prevent errors

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      // NextAuth logs captured here
      // console.log('[NextAuth Log]', body);
    }

    // You can forward these logs to your backend API if needed
    // For now, just return success
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[NextAuth Log Error]', error);
    return new NextResponse(null, { status: 204 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Auth logging endpoint' });
}
