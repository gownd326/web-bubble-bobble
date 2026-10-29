import { describe, it, expect, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}))

vi.mock('@/lib/db', () => ({
  query: vi.fn(),
}))

describe('인증 및 회원가입 테스트 (Authentication & Signup Tests)', () => {
  it('비밀번호 해싱 및 검증이 올바르게 동작해야 한다', async () => {
    const { hashPassword, verifyPassword } = await import('@/lib/auth')
    const password = 'password123'
    const hash = await hashPassword(password)
    expect(hash).toBeDefined()
    expect(typeof hash).toBe('string')

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)

    const isInvalid = await verifyPassword('wrongpassword', hash)
    expect(isInvalid).toBe(false)
  })

  it('세션 생성 및 검증이 정상적으로 작동해야 한다', async () => {
    const { createSession, getSession, destroySession } = await import('@/lib/auth')
    const userId = 1
    const username = 'player1'

    const token = createSession(userId, username)
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')

    const session = getSession(token)
    expect(session).not.toBeNull()
    expect(session?.userId).toBe(userId)
    expect(session?.username).toBe(username)

    destroySession(token)
    const expiredSession = getSession(token)
    expect(expiredSession).toBeNull()
  })

  it('회원가입 수용 기준: 아이디와 비밀번호로 계정이 생성되어야 한다', async () => {
    const { query } = await import('@/lib/db')
    const mockQuery = query as any

    mockQuery.mockResolvedValueOnce({ rows: [] })
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, username: 'player1', created_at: new Date() }],
    })
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const { POST } = await import('@/app/api/auth/signup/route')
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: 'player1', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('회원가입이 완료되었습니다.')
    expect(data.user.username).toBe('player1')
  })
})
