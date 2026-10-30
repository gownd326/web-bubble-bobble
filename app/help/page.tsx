'use client'

import Link from 'next/link'

export default function HelpPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#111111] text-white select-none">
      <div className="max-w-2xl w-full flex flex-col items-center p-8 bg-[#1a1a2e] rounded-xl shadow-2xl border-2 border-[#0f3460] space-y-8">
        
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-[#FF5722]">
            도움말 및 게임 규칙
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            게임 조작법 및 방울 공격/터뜨리기 규칙 상세 안내
          </p>
        </div>

        {/* PC 키보드 조작 안내 */}
        <section className="w-full space-y-4 bg-[#0f3460] p-6 rounded-lg border border-[#e94560]">
          <h2 className="text-2xl font-bold text-[#FF5722] border-b border-gray-700 pb-2">
            🕹️ PC 키보드 조작법
          </h2>
          <ul className="space-y-3 text-sm md:text-base text-gray-200">
            <li className="flex items-center justify-between">
              <span className="font-medium">수평 이동</span>
              <span className="bg-[#111111] px-3 py-1 rounded text-[#FF5722] font-bold">
                [← / →] 방향키
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">발판 위아래 점프</span>
              <span className="bg-[#111111] px-3 py-1 rounded text-[#FF5722] font-bold">
                [Space] 스페이스바
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">방울 발사</span>
              <span className="bg-[#111111] px-3 py-1 rounded text-[#FF5722] font-bold">
                [Z] 방울 발사 키
              </span>
            </li>
          </ul>
        </section>

        {/* 모바일 터치 패드 안내 */}
        <section className="w-full space-y-4 bg-[#0f3460] p-6 rounded-lg border border-[#e94560]">
          <h2 className="text-2xl font-bold text-[#FF5722] border-b border-gray-700 pb-2">
            📱 모바일 조작법
          </h2>
          <p className="text-sm md:text-base text-gray-200 leading-relaxed mb-2">
            화면 너비 768px 미만의 모바일 브라우저 환경에서는 화면 하단에 전용 가상 컨트롤러가 노출됩니다.
          </p>
          <ul className="space-y-2 text-sm md:text-base text-gray-200">
            <li>• <strong>좌측</strong>: 가상 좌우 방향 패드(◀ / ▶)</li>
            <li>• <strong>우측</strong>: <strong>JUMP</strong>(점프) 버튼, <strong>BUBBLE</strong>(발사) 버튼</li>
          </ul>
        </section>

        {/* 방울 공격 및 터뜨리기 메커니즘 */}
        <section className="w-full space-y-4 bg-[#0f3460] p-6 rounded-lg border border-[#e94560]">
          <h2 className="text-2xl font-bold text-[#FF5722] border-b border-gray-700 pb-2">
            🫧 방울 공격 및 터뜨리기 메커니즘
          </h2>
          <ol className="list-decimal list-inside space-y-2.5 text-sm md:text-base text-gray-200 leading-relaxed">
            <li>
              <strong>방울 직선 발사</strong>: 방울 발사 키(Z 또는 BUBBLE 버튼)를 누르면 캐릭터 전방으로 지면과 수평한 직선 궤적으로 약 250px 발사된 후 부유 상태로 전환됩니다.
            </li>
            <li>
              <strong>적 포획</strong>: 발사 중인 방울이 적 캐릭터와 충돌하면 적이 방울 내부에 즉시 포획되어 상단으로 서서히 떠오릅니다.
            </li>
            <li>
              <strong>방울 터뜨리기 및 적 처치</strong>:
              <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-gray-300">
                <li>플레이어 캐릭터가 방울(빈 방울 또는 적이 갇힌 방울)과 부딪히면 방울이 터집니다.</li>
                <li>방울 안에 적 캐릭터가 들어있는 상태에서 플레이어가 부딪히면 적과 방울이 함께 터지며 적이 처치되고 <strong>100점</strong>을 획득합니다.</li>
              </ul>
            </li>
            <li>
              <strong>스테이지 진행</strong>: 맵 내의 모든 적을 처치하면 스테이지 클리어 후 다음 스테이지로 즉시 이동합니다. (기본 총 5개 스테이지 순환)
            </li>
            <li>
              <strong>게임 오버 및 세이브</strong>: 목숨이 0이 되면 게임 오버 화면이 노출됩니다. 회원으로 플레이 시 스테이지와 최고 점수가 서버에 자동 저장됩니다.
            </li>
          </ol>
        </section>

        {/* 하단 버튼 */}
        <div className="w-full flex items-center justify-between pt-4 border-t border-gray-800">
          <Link
            href="/"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all text-white font-bold rounded-lg shadow-md"
          >
            ← 메인으로
          </Link>
          <Link
            href="/game"
            className="px-8 py-3 bg-[#FF5722] hover:bg-[#f4511e] active:scale-95 transition-all text-white font-bold rounded-lg shadow-lg text-lg"
          >
            게임 하러 가기 →
          </Link>
        </div>

      </div>
    </main>
  )
}
