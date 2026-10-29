'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.')
      }

      router.push('/login')
    } catch (err: any) {
      setError(err.message || '서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#111111] text-white select-none">
      <div className="max-w-md w-full flex flex-col items-center p-8 bg-[#1a1a2e] rounded-xl shadow-2xl border-2 border-[#0f3460] space-y-6">
        
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-wider text-[#FF5722]">
            회원가입
          </h1>
          <p className="text-sm text-gray-300">
            새로운 계정을 만들어 게임을 저장하세요.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="w-full bg-[#e94560] bg-opacity-20 border border-[#e94560] text-[#e94560] p-3 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleSignup} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              아이디
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#111111] border border-[#0f3460] rounded-lg focus:outline-none focus:border-[#FF5722] text-white"
              placeholder="사용할 아이디를 입력하세요"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#111111] border border-[#0f3460] rounded-lg focus:outline-none focus:border-[#FF5722] text-white"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              비밀번호 확인
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#111111] border border-[#0f3460] rounded-lg focus:outline-none focus:border-[#FF5722] text-white"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#FF5722] hover:bg-[#f4511e] active:scale-95 transition-all text-white font-bold text-lg rounded-lg shadow-lg flex items-center justify-center disabled:opacity-50 mt-2"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="flex items-center justify-between w-full text-sm text-gray-400 pt-4 border-t border-gray-800">
          <Link href="/" className="hover:text-white transition-colors">
            ← 메인으로 돌아가기
          </Link>
          <Link href="/login" className="text-[#FF5722] hover:underline font-bold">
            로그인하기
          </Link>
        </div>

      </div>
    </main>
  )
}
