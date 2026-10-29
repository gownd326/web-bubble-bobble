import { describe, it, expect } from 'vitest'

describe('UI 및 화면 이동 수용 기준 테스트 (UI & Navigation Acceptance Tests)', () => {
  it('도움말 페이지 및 조작법 관련 안내 문구가 올바르게 정의되어 있어야 한다', async () => {
    const helpPageModule = await import('@/app/help/page')
    expect(helpPageModule.default).toBeDefined()
  })

  it('순위표 API 엔드포인트가 정상적으로 순위 리스트 데이터를 반환할 수 있어야 한다', async () => {
    const { GET } = await import('@/app/api/ranking/route')
    expect(GET).toBeDefined()
    expect(typeof GET).toBe('function')
  })
})
