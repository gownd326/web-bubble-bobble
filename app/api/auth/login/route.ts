import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: '아이디와 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    const result = await query('SELECT id, username, password_hash FROM users WHERE username = $1', [username])
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: '존재하지 않거나 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    const user = result.rows[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { message: '존재하지 않거나 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    const token = createSession(user.id, user.username)

    cookies().set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json(
      { message: '로그인 성공', user: { id: user.id, username: user.username } },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
