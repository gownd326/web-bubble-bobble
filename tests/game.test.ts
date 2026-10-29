import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetSession = vi.fn((token?: string) => {
  if (token === 'mock_token') {
    return { userId: 1, username: 'player1', expiresAt: Date.now() + 10000 }
  }
  return null
})

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn((name) => {
      if (name === 'session_token') return { value: 'mock_token' }
      return undefined
    }),
    set: vi.fn(),
  }),
}))

vi.mock('@/lib/db', () => ({
  query: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  getSession: (token?: string) => mockGetSession(token),
}))

describe('게임 세이브 및 로드 기능 테스트 (Game Save & Load Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockImplementation((token?: string) => {
      if (token === 'mock_token') {
        return { userId: 1, username: 'player1', expiresAt: Date.now() + 10000 }
      }
      return null
    })
  })

  it('로그인된 사용자가 게임 저장 데이터 조회(GET) 시 세이브 정보를 반환해야 한다', async () => {
    const { query } = await import('@/lib/db')
    const mockQuery = query as any

    mockQuery.mockResolvedValueOnce({
      rows: [{ stage: 3, score: 1500, lives: 2, updated_at: new Date() }],
    })

    const { GET } = await import('@/app/api/game/save/route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.save).toBeDefined()
    expect(data.save.stage).toBe(3)
    expect(data.save.score).toBe(1500)
    expect(data.save.lives).toBe(2)
  })

  it('로그인된 사용자가 게임 진행 상황 저장(POST) 시 DB에 upsert 쿼리가 실행되어야 한다', async () => {
    const { query } = await import('@/lib/db')
    const mockQuery = query as any

    mockQuery.mockResolvedValueOnce({ rows: [] })

    const { POST } = await import('@/app/api/game/save/route')
    const request = new Request('http://localhost:3000/api/game/save', {
      method: 'POST',
      body: JSON.stringify({ stage: 3, score: 1500, lives: 2 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('게임 진행 상황이 저장되었습니다.')
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  it('인증되지 않은 사용자가 세이브 저장 또는 로드 시 401 에러를 반환해야 한다', async () => {
    mockGetSession.mockReturnValueOnce(null)

    const { GET } = await import('@/app/api/game/save/route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('인증되지 않은 사용자입니다.')
  })
})
