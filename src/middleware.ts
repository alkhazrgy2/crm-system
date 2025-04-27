import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserById } from '@/lib/api/users';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  // استثناء مسارات المصادقة من التحقق
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname === '/api/health'
  ) {
    return NextResponse.next();
  }

  // التحقق من وجود رمز المصادقة
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse(
      JSON.stringify({ error: 'غير مصرح بالوصول' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    // التحقق من وجود المستخدم
    const user = await getUserById(decoded.userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'المستخدم غير موجود' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // إضافة معلومات المستخدم إلى الطلب
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id.toString());
    requestHeaders.set('x-user-role', user.role);
    
    // متابعة الطلب
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'رمز المصادقة غير صالح' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};
