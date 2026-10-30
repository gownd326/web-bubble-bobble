'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RankingItem {
  username: string
  high_score: number
  updated_at: string
}

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/ranking')
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || '순위표를 불러오지 못했습니다.')
        }
        setRankings(data.rankings || [])
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#111111] text-white select-none">
      <div className="max-w-2xl w-full flex flex-col items-center p-8 bg-[#1a1a2e] rounded-xl shadow-2xl border-2 border-[#0f3460] space-y-8">
        
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-[#FF5722]">
            순위표
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            전체 사용자의 최고 점수 순위 표시
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="w-full bg-[#e94560] bg-opacity-20 border border-[#e94560] text-[#e94560] p-3 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* 로딩 표시 */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            순위표를 불러오는 중입니다...
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-[#0f3460] w-full rounded-lg">
            아직 등록된 순위 기록이 없습니다. 첫 번째 주인공이 되어보세요!
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#0f3460] text-[#FF5722] text-sm md:text-base">
                  <th className="py-3 px-4 text-center w-16">순위</th>
                  <th className="py-3 px-4">아이디</th>
                  <th className="py-3 px-4 text-right">최고 점수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm md:text-base">
                {rankings.map((item, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-[#0f3460] transition-colors ${
                      index === 0
                        ? 'bg-yellow-500 bg-opacity-10 text-yellow-300 font-bold'
                        : index === 1
                        ? 'bg-gray-300 bg-opacity-10 text-gray-200'
                        : index === 2
                        ? 'bg-amber-600 bg-opacity-10 text-amber-200'
                        : 'text-gray-300'
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                    </td>
                    <td className="py-3 px-4 font-medium">{item.username}</td>
                    <td className="py-3 px-4 text-right text-green-400 font-bold">
                      {(item.high_score ?? 0).toLocaleString()} 점
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
