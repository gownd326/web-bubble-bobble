'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MainPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.refresh()
  }

  const handleGuestPlay = () => {
    router.push('/game')
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#111111] text-white select-none">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-8 p-8 bg-[#1a1a2e] rounded-xl shadow-2xl border-2 border-[#0f3460]">
        
        {/* 타이틀 로고 / 감성 헤더 */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold tracking-wider text-[#FF5722] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            웹 보글보글
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            고전 아케이드의 즐거움을 웹 브라우저에서!
          </p>
        </div>

        {/* 로그인 상태 표시 */}
        {!loading && user && (
          <div className="w-full bg-[#0f3460] p-3 rounded-lg text-sm flex items-center justify-between">
            <span>환영합니다, <strong className="text-[#FF5722]">{user.username}</strong>님!</span>
            <button
              onClick={handleLogout}
              className="text-xs bg-[#e94560] hover:bg-opacity-80 px-2 py-1 rounded text-white transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}

        {/* 메인 버튼 그룹 */}
        <div className="w-full flex flex-col space-y-4">
          <button
            onClick={handleGuestPlay}
            className="w-full py-4 bg-[#FF5722] hover:bg-[#f4511e] active:scale-95 transition-all text-white font-bold text-xl rounded-lg shadow-lg flex items-center justify-center space-x-2"
          >
            <span>비회원 시작</span>
          </button>

          {!user ? (
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/login"
                className="w-full py-3 bg-[#0f3460] hover:bg-[#1b498a] active:scale-95 transition-all text-white font-bold text-lg rounded-lg shadow-md flex items-center justify-center"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="w-full py-3 bg-[#e94560] hover:bg-[#d63853] active:scale-95 transition-all text-white font-bold text-lg rounded-lg shadow-md flex items-center justify-center"
              >
                회원가입
              </Link>
            </div>
          ) : (
            <Link
              href="/game"
              className="w-full py-4 bg-[#e94560] hover:bg-[#d63853] active:scale-95 transition-all text-white font-bold text-xl rounded-lg shadow-lg flex items-center justify-center"
            >
              이어하기 / 게임 시작
            </Link>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Link
              href="/help"
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all text-white font-bold rounded-lg shadow-md flex items-center justify-center"
            >
              도움말 / 조작법
            </Link>
            <Link
              href="/ranking"
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all text-white font-bold rounded-lg shadow-md flex items-center justify-center"
            >
              순위표
            </Link>
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-4 border-t border-gray-800 w-full">
          Web Bubble Bobble · Next.js & Neon PostgreSQL
        </div>
      </div>
    </main>
  )
}
