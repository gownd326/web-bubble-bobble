import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // 회원가입: 아이디(영문/숫자 4~20자), 비밀번호(6자 이상)
    if (!username || !password) {
      return NextResponse.json(
        { message: '아이디와 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    const usernameRegex = /^[a-zA-Z0-9]{4,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: '아이디는 영문/숫자 4~20자 사이여야 합니다.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // 아이디 중복 확인
    const existingUser = await query('SELECT id FROM users WHERE username = $1', [username])
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: '이미 사용 중인 아이디입니다.' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)

    // 사용자 생성
    const result = await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    )

    const newUser = result.rows[0]

    // 기본 게임 세이브 데이터 생성 (high_score 포함)
    await query(
      'INSERT INTO game_saves (user_id, stage, score, high_score, lives) VALUES ($1, 1, 0, 0, 3) ON CONFLICT (user_id) DO NOTHING',
      [newUser.id]
    )

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.', user: { id: newUser.id, username: newUser.username } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
