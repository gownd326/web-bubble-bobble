import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('session_token')?.value
    const session = getSession(token)

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json(
      { user: { id: session.userId, username: session.username } },
      { status: 200 }
    )
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
