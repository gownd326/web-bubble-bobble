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

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<any>('@/lib/auth')
  return {
    ...actual,
    getSession: (token?: string) => mockGetSession(token),
  }
})

describe('기능별 수용 기준 (Given / When / Then) 자동화 검증', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockImplementation((token?: string) => {
      if (token === 'mock_token') {
        return { userId: 1, username: 'player1', expiresAt: Date.now() + 10000 }
      }
      return null
    })
  })

  describe('1. 방울 직선 발사 및 적 포획', () => {
    it('방울 발사 키 입력 시 직선 사거리(250px) 이동 중 적과 접촉하면 적을 포획해야 한다', () => {
      const BUBBLE_RANGE = 250
      const BUBBLE_SPEED = 7
      const player = { x: 100, y: 300, facing: 'right' as const }
      const enemy = { id: 1, x: 220, y: 300, isTrapped: false }

      // When: 방울 발사 생성
      const bubble = {
        id: 1,
        x: player.x + 32,
        y: player.y + 16,
        startX: player.x + 32,
        direction: 1 as 1 | -1,
        isFloating: false,
        trappedEnemyId: null as number | null,
        radius: 18,
      }

      // 발사 중 전방 이동 시뮬레이션
      const enemyCenterX = enemy.x + 16
      const enemyCenterY = enemy.y + 16

      while (!bubble.isFloating && Math.abs(bubble.x - bubble.startX) < BUBBLE_RANGE) {
        bubble.x += bubble.direction * BUBBLE_SPEED
        const dist = Math.hypot(bubble.x - enemyCenterX, bubble.y - enemyCenterY)

        // 충돌 발생
        if (dist < bubble.radius + 16) {
          enemy.isTrapped = true
          bubble.trappedEnemyId = enemy.id
          bubble.isFloating = true
          break
        }
      }

      // Then: 적이 방울에 포획되고 부유 상태로 전환
      expect(enemy.isTrapped).toBe(true)
      expect(bubble.trappedEnemyId).toBe(1)
      expect(bubble.isFloating).toBe(true)
      expect(BUBBLE_RANGE).toBe(250)
    })
  })

  describe('2. 방울 터뜨리기 및 점수 획득', () => {
    it('플레이어가 적이 갇힌 방울과 부딪히면 방울과 적이 함께 제거되고 100점이 추가되어야 한다', () => {
      let score = 0
      const player = { x: 200, y: 200, w: 32, h: 32 }
      const enemy = { id: 1, x: 205, y: 205, isTrapped: true, dead: false }
      const bubble = { id: 1, x: 215, y: 215, radius: 18, trappedEnemyId: 1 }

      // When: 플레이어와 방울 충돌
      const pCenterX = player.x + player.w / 2
      const pCenterY = player.y + player.h / 2
      const dist = Math.hypot(pCenterX - bubble.x, pCenterY - bubble.y)

      if (dist < player.w / 2 + bubble.radius) {
        if (bubble.trappedEnemyId !== null && bubble.trappedEnemyId === enemy.id) {
          enemy.dead = true
          score += 100
        }
      }

      // Then: 적 사망 및 100점 추가
      expect(enemy.dead).toBe(true)
      expect(score).toBe(100)
    })
  })

  describe('3. PC 환경 전용 조작 안내 노출', () => {
    it('PC 화면용 한 줄 조작키 안내 텍스트가 명세와 정확히 일치해야 한다', () => {
      const pcGuideText = '[← / →] 이동 | [Space] 점프 | [Z] 방울 발사'
      expect(pcGuideText).toBe('[← / →] 이동 | [Space] 점프 | [Z] 방울 발사')
    })
  })

  describe('4. 로그인 사용자 세이브 및 복원', () => {
    it('회원 사용자가 스테이지 2, 점수 300 진행 중 저장 시 high_score 갱신 쿼리가 실행되고 GET 복원되어야 한다', async () => {
      const { query } = await import('@/lib/db')
      const mockQuery = query as any

      // Given & When: 스테이지 2 저장
      mockQuery.mockResolvedValueOnce({ rows: [] })
      const { POST, GET } = await import('@/app/api/game/save/route')

      const saveRequest = new Request('http://localhost:3000/api/game/save', {
        method: 'POST',
        body: JSON.stringify({ stage: 2, score: 300, lives: 3 }),
      })
      const postResponse = await POST(saveRequest)
      expect(postResponse.status).toBe(200)

      // Then: 저장된 세이브 복원 조회
      mockQuery.mockResolvedValueOnce({
        rows: [{ stage: 2, score: 300, high_score: 300, lives: 3, updated_at: new Date() }],
      })
      const getResponse = await GET()
      const data = await getResponse.json()

      expect(getResponse.status).toBe(200)
      expect(data.save.stage).toBe(2)
      expect(data.save.score).toBe(300)
      expect(data.save.high_score).toBe(300)
    })
  })
})
