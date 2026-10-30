'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number; username: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="w-full bg-[#111111] border-b border-[#0f3460] px-4 py-3 flex items-center justify-between z-20">
      <Link href="/" className="flex items-center space-x-2 text-[#FF5722] font-bold text-xl hover:opacity-90">
        <span>🫧 웹 보글보글</span>
      </Link>

      <div className="flex items-center space-x-4 text-sm">
        <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
          도움말
        </Link>
        <Link href="/ranking" className="text-gray-300 hover:text-white transition-colors">
          순위표
        </Link>
        {user ? (
          <div className="flex items-center space-x-3">
            <span className="text-gray-200">
              <strong className="text-[#FF5722]">{user.username}</strong>님
            </span>
            <button
              onClick={handleLogout}
              className="bg-[#e94560] hover:bg-opacity-80 text-white text-xs px-2.5 py-1 rounded transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="bg-[#0f3460] hover:bg-[#1b498a] text-white px-3 py-1 rounded text-xs font-bold transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="bg-[#e94560] hover:bg-[#d63853] text-white px-3 py-1 rounded text-xs font-bold transition-colors"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
