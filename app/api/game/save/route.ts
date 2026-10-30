import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('session_token')?.value
    const session = getSession(token)

    if (!session) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const result = await query(
      'SELECT stage, score, high_score, lives, updated_at FROM game_saves WHERE user_id = $1',
      [session.userId]
    )

    if (result.rows.length === 0) {
      await query(
        'INSERT INTO game_saves (user_id, stage, score, high_score, lives) VALUES ($1, 1, 0, 0, 3) ON CONFLICT (user_id) DO NOTHING',
        [session.userId]
      )
      return NextResponse.json(
        { save: { stage: 1, score: 0, high_score: 0, lives: 3 } },
        { status: 200 }
      )
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

    // SPEC 주요 쿼리 규칙:
    // 스테이지 완료 시 stage, score, lives를 UPDATE하며, 기존 high_score보다 현재 score가 높으면 high_score도 함께 갱신
    await query(
      `INSERT INTO game_saves (user_id, stage, score, high_score, lives, updated_at) 
       VALUES ($1, $2, $3, $3, $4, NOW()) 
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         stage = $2, 
         score = $3, 
         high_score = GREATEST(game_saves.high_score, $3),
         lives = $4, 
         updated_at = NOW()`,
      [session.userId, stage, score, lives]
    )

    return NextResponse.json({ message: '게임 진행 상황이 저장되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('Save game save error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
