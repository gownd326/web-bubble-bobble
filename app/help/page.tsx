'use client'

import Link from 'next/link'

export default function HelpPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#111111] text-white select-none">
      <div className="max-w-2xl w-full flex flex-col items-center p-8 bg-[#1a1a2e] rounded-xl shadow-2xl border-2 border-[#0f3460] space-y-8">
        
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-[#FF5722]">
            도움말 및 조작법
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            웹 보글보글 플레이 방법을 확인하고 최고 기록에 도전하세요!
          </p>
        </div>

        {/* 조작법 안내 */}
        <section className="w-full space-y-4 bg-[#0f3460] p-6 rounded-lg border border-[#e94560]">
          <h2 className="text-2xl font-bold text-[#FF5722] border-b border-gray-700 pb-2">
            🕹️ 키보드 조작법
          </h2>
          <ul className="space-y-3 text-sm md:text-base text-gray-200">
            <li className="flex items-center justify-between">
              <span className="font-medium">좌우 이동</span>
              <span className="bg-[#111111] px-3 py-1 rounded text-[#FF5722] font-bold">← / → 방향키</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">점프</span>
              <span className="bg-[#111111] px-3 py-1 rounded text-[#FF5722] font-bold">스페이스바 (Space)</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">방울 발사 (공격)</span>
              <span className="bg-[#111111] px-3 py-1 rounded text-[#FF5722] font-bold">Z 키</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">일시정지</span>
              <span className="bg-[#111111] px-3 py-1 rounded text-[#FF5722] font-bold">ESC 또는 상단 버튼</span>
            </li>
          </ul>
        </section>

        {/* 모바일 조작 안내 */}
        <section className="w-full space-y-4 bg-[#0f3460] p-6 rounded-lg border border-[#e94560]">
          <h2 className="text-2xl font-bold text-[#FF5722] border-b border-gray-700 pb-2">
            📱 모바일 터치 패드
          </h2>
          <p className="text-sm md:text-base text-gray-200 leading-relaxed">
            모바일 환경에서는 화면 하단에 표시되는 <strong>가상 조이스틱</strong>(좌우 이동)과 <strong>점프(▲)</strong>, <strong>방울(B)</strong> 액션 버튼을 터치하여 PC와 동일하게 쾌적한 플레이를 즐길 수 있습니다.
          </p>
        </section>

        {/* 게임 규칙 안내 */}
        <section className="w-full space-y-4 bg-[#0f3460] p-6 rounded-lg border border-[#e94560]">
          <h2 className="text-2xl font-bold text-[#FF5722] border-b border-gray-700 pb-2">
            💡 게임 규칙 및 플레이 방법
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-200 leading-relaxed">
            <li><strong>방울 발사</strong>: Z키를 눌러 방울을 발사하여 다가오는 적을 방울 속에 가둡니다.</li>
            <li><strong>적 터뜨리기</strong>: 방울에 갇힌 적에게 다가가 건드리면 방울이 터지면서 적을 처치할 수 있습니다.</li>
            <li><strong>스테이지 클리어</strong>: 화면에 있는 모든 적을 처치하면 자동으로 다음 스테이지로 진입합니다.</li>
            <li><strong>세이브 시스템</strong>: 로그인 상태에서 플레이하면 현재 스테이지와 점수가 실시간으로 자동 저장되어, 언제든 이어서 할 수 있습니다.</li>
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
