'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GameCanvas from '@/components/GameCanvas'
import VirtualPad from '@/components/VirtualPad'

export default function GamePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number; username: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState({
    score: 0,
    stage: 1,
    lives: 3,
  })
  const [isPaused, setIsPaused] = useState(false)
  const [controls, setControls] = useState({
    left: false,
    right: false,
    jump: false,
    shoot: false,
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then(async (data) => {
        if (data.user) {
          setUser(data.user)
          // 세이브 데이터 불러오기
          try {
            const saveRes = await fetch('/api/game/save')
            const saveData = await saveRes.json()
            if (saveRes.ok && saveData.save) {
              setGameState({
                score: saveData.save.score ?? 0,
                stage: saveData.save.stage ?? 1,
                lives: saveData.save.lives ?? 3,
              })
            }
          } catch (e) {
            console.error('Failed to load save data', e)
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveGame = useCallback(async (currentScore: number, currentStage: number, currentLives: number) => {
    if (!user) return
    try {
      await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: currentScore,
          stage: currentStage,
          lives: currentLives,
        }),
      })
    } catch (e) {
      console.error('Failed to save game state', e)
    }
  }, [user])

  const handleStateUpdate = (newScore: number, newStage: number, newLives: number) => {
    setGameState({
      score: newScore,
      stage: newStage,
      lives: newLives,
    })
    handleSaveGame(newScore, newStage, newLives)
  }

  const handlePadChange = (newControls: { left: boolean; right: boolean; jump: boolean; shoot: boolean }) => {
    setControls(newControls)
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-between p-2 md:p-4 bg-[#1a1a2e] text-white select-none min-h-screen">
      {/* 상단 정보 패널 */}
      <header className="w-full max-w-[800px] bg-[#0f3460] border-2 border-[#e94560] rounded-lg p-3 flex flex-wrap items-center justify-between shadow-lg mb-2">
        <div className="flex items-center space-x-4 text-sm md:text-base font-bold">
          <div>
            플레이어: <span className="text-[#FF5722]">{user ? user.username : '게스트'}</span>
          </div>
          <div>
            스테이지: <span className="text-yellow-400">{gameState.stage}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm md:text-base font-bold">
          <div>
            점수: <span className="text-green-400">{gameState.score}</span>
          </div>
          <div>
            목숨: <span className="text-red-400">{'♥'.repeat(Math.max(0, gameState.lives))}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-2 md:mt-0 w-full md:w-auto justify-end">
          <Link
            href="/help"
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold transition-colors"
          >
            도움말
          </Link>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1 bg-[#FF5722] hover:bg-[#f4511e] rounded text-xs font-bold transition-colors"
          >
            {isPaused ? '계속하기' : '일시정지'}
          </button>
          <Link
            href="/"
            onClick={() => handleSaveGame(gameState.score, gameState.stage, gameState.lives)}
            className="px-3 py-1 bg-[#e94560] hover:bg-[#d63853] rounded text-xs font-bold transition-colors"
          >
            나가기
          </Link>
        </div>
      </header>

      {/* 중앙 게임 캔버스 영역 */}
      <div className="relative flex items-center justify-center bg-black border-4 border-[#0f3460] rounded-xl shadow-2xl overflow-hidden max-w-full">
        <GameCanvas
          controls={controls}
          isPaused={isPaused}
          initialStage={gameState.stage}
          initialScore={gameState.score}
          initialLives={gameState.lives}
          onStateUpdate={handleStateUpdate}
        />
        {isPaused && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center space-y-4">
            <h2 className="text-4xl font-bold text-[#FF5722] animate-pulse">게임 일시정지</h2>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 bg-[#e94560] hover:bg-[#d63853] text-white font-bold rounded-lg shadow-lg text-lg"
            >
              게임 재개
            </button>
          </div>
        )}
      </div>

      {/* 하단 모바일용 가상 조이스틱 및 액션 버튼 */}
      <footer className="w-full max-w-[800px] mt-2">
        <VirtualPad onChange={handlePadChange} />
      </footer>
    </main>
  )
}
