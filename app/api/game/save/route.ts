import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('session_token')?.value
    const session = getSession(token)

    if (!session) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const result = await query(
      'SELECT stage, score, lives, updated_at FROM game_saves WHERE user_id = $1',
      [session.userId]
    )

    if (result.rows.length === 0) {
      // 세이브 데이터가 없으면 기본값 반환 후 생성
      await query(
        'INSERT INTO game_saves (user_id, stage, score, lives) VALUES ($1, 1, 0, 3) ON CONFLICT (user_id) DO NOTHING',
        [session.userId]
      )
      return NextResponse.json({ save: { stage: 1, score: 0, lives: 3 } }, { status: 200 })
    }

    return NextResponse.json({ save: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Load game save error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('session_token')?.value
    const session = getSession(token)

    if (!session) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const { stage, score, lives } = await request.json()

    if (stage === undefined || score === undefined || lives === undefined) {
      return NextResponse.json({ message: '필수 게임 데이터가 누락되었습니다.' }, { status: 400 })
    }

    await query(
      `INSERT INTO game_saves (user_id, stage, score, lives, updated_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       ON CONFLICT (user_id) 
       DO UPDATE SET stage = $2, score = $3, lives = $4, updated_at = NOW()`,
      [session.userId, stage, score, lives]
    )

    return NextResponse.json({ message: '게임 진행 상황이 저장되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('Save game save error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
