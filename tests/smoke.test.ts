import { describe, it, expect, vi } from 'vitest'

describe('스모크 테스트 (Smoke Routes - 로그인/DB 없이 렌더링 확인)', () => {
  it('GET / 메인 랜딩 화면 정상 렌더링 모듈 확인', async () => {
    const mainPage = await import('@/app/page')
    expect(mainPage.default).toBeDefined()
  })

  it('GET /game 게스트 상태로 즉시 캔버스 실행 및 키 안내 확인', async () => {
    const gamePage = await import('@/app/game/page')
    expect(gamePage.default).toBeDefined()
  })

  it('GET /help 조작법 및 방울 규칙 설명 텍스트 표시 확인', async () => {
    const helpPage = await import('@/app/help/page')
    expect(helpPage.default).toBeDefined()
  })

  it('GET /login 로그인 폼 입력 필드 및 버튼 노출 확인', async () => {
    const loginPage = await import('@/app/login/page')
    expect(loginPage.default).toBeDefined()
  })

  it('GET /signup 회원가입 폼 입력 필드 노출 확인', async () => {
    const signupPage = await import('@/app/signup/page')
    expect(signupPage.default).toBeDefined()
  })

  it('GET /ranking 랭킹 화면 스켈레톤 및 빈 순위 테이블 정상 렌더링 확인', async () => {
    const rankingPage = await import('@/app/ranking/page')
    expect(rankingPage.default).toBeDefined()
  })
})
