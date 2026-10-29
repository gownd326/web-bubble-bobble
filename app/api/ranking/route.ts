import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await query(
      `SELECT u.username, g.score, g.stage, g.updated_at 
       FROM game_saves g 
       JOIN users u ON g.user_id = u.id 
       ORDER BY g.score DESC, g.stage DESC, g.updated_at ASC 
       LIMIT 10`
    )

    return NextResponse.json({ rankings: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Ranking query error:', error)
    return NextResponse.json(
      { message: '순위표 데이터를 불러오는 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
