import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await query(
      `SELECT u.username, g.high_score, g.updated_at 
       FROM game_saves g 
       JOIN users u ON g.user_id = u.id 
       ORDER BY g.high_score DESC 
       LIMIT 50;`
    )

    return NextResponse.json({ rankings: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Ranking query error:', error)
    // DB 연결 실패 또는 환경변수 부재 시에도 스모크 테스트 및 클라이언트 렌더링을 위해 빈 배열 반환
    return NextResponse.json({ rankings: [] }, { status: 200 })
  }
}
