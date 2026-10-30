'use client'

import React, { useEffect, useRef, useState } from 'react'

interface GameCanvasProps {
  controls: {
    left: boolean
    right: boolean
    jump: boolean
    shoot: boolean
  }
  isPaused: boolean
  initialStage: number
  initialScore: number
  initialLives: number
  onStateUpdate: (score: number, stage: number, lives: number, isGameOver?: boolean) => void
  onGameOver?: (finalScore: number) => void
}

interface Platform {
  x: number
  y: number
  w: number
  h: number
}

interface BubbleEntity {
  id: number
  x: number
  y: number
  startX: number
  direction: 1 | -1
  isFloating: boolean
  trappedEnemyId: number | null
  radius: number
  life: number
}

interface EnemyEntity {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  isTrapped: boolean
  dead: boolean
}

interface PopParticle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
}

interface ScorePopup {
  x: number
  y: number
  text: string
  life: number
}

export default function GameCanvas({
  controls,
  isPaused,
  initialStage,
  initialScore,
  initialLives,
  onStateUpdate,
  onGameOver,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [gameOverScreen, setGameOverScreen] = useState<{ show: boolean; score: number }>({
    show: false,
    score: 0,
  })

  // 스테이지 및 점수 ref
  const gameStateRef = useRef({
    score: initialScore,
    stage: initialStage,
    lives: initialLives,
  })

  useEffect(() => {
    gameStateRef.current.score = initialScore
    gameStateRef.current.stage = initialStage
    gameStateRef.current.lives = initialLives
  }, [initialScore, initialStage, initialLives])

  // 키보드 조작
  const keysRef = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'z'].includes(k)) {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault()
        }
      }
      keysRef.current[k] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const WIDTH = 800
    const HEIGHT = 600
    const BUBBLE_RANGE = 250 // 방울 수평 직선 사거리 (250px)
    const BUBBLE_SPEED = 7

    // 플레이어
    const player = {
      x: 100,
      y: HEIGHT - 150,
      w: 32,
      h: 32,
      vx: 0,
      vy: 0,
      speed: 4,
      jumpPower: -11,
      gravity: 0.5,
      grounded: false,
      facing: 'right' as 'left' | 'right',
      invulnerableTimer: 0,
    }

    // 맵 발판 (보글보글 스타일 5개 스테이지별 발판 레이아웃)
    const getStagePlatforms = (stg: number): Platform[] => {
      const baseFloor: Platform = { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 }
      const stageIdx = ((stg - 1) % 5) + 1

      if (stageIdx === 1) {
        return [
          baseFloor,
          { x: 80, y: 460, w: 240, h: 18 },
          { x: 480, y: 460, w: 240, h: 18 },
          { x: 220, y: 340, w: 360, h: 18 },
          { x: 100, y: 220, w: 220, h: 18 },
          { x: 480, y: 220, w: 220, h: 18 },
          { x: 300, y: 110, w: 200, h: 18 },
        ]
      } else if (stageIdx === 2) {
        return [
          baseFloor,
          { x: 50, y: 470, w: 700, h: 18 },
          { x: 120, y: 360, w: 260, h: 18 },
          { x: 420, y: 360, w: 260, h: 18 },
          { x: 200, y: 240, w: 400, h: 18 },
          { x: 280, y: 130, w: 240, h: 18 },
        ]
      } else if (stageIdx === 3) {
        return [
          baseFloor,
          { x: 100, y: 480, w: 180, h: 18 },
          { x: 320, y: 440, w: 160, h: 18 },
          { x: 520, y: 480, w: 180, h: 18 },
          { x: 180, y: 330, w: 440, h: 18 },
          { x: 100, y: 200, w: 200, h: 18 },
          { x: 500, y: 200, w: 200, h: 18 },
          { x: 300, y: 100, w: 200, h: 18 },
        ]
      } else if (stageIdx === 4) {
        return [
          baseFloor,
          { x: 50, y: 480, w: 200, h: 18 },
          { x: 300, y: 480, w: 200, h: 18 },
          { x: 550, y: 480, w: 200, h: 18 },
          { x: 150, y: 360, w: 500, h: 18 },
          { x: 80, y: 240, w: 280, h: 18 },
          { x: 440, y: 240, w: 280, h: 18 },
          { x: 250, y: 120, w: 300, h: 18 },
        ]
      } else {
        return [
          baseFloor,
          { x: 100, y: 490, w: 600, h: 18 },
          { x: 150, y: 390, w: 500, h: 18 },
          { x: 200, y: 290, w: 400, h: 18 },
          { x: 250, y: 190, w: 300, h: 18 },
          { x: 300, y: 100, w: 200, h: 18 },
        ]
      }
    }

    let platforms = getStagePlatforms(gameStateRef.current.stage)

    let nextBubbleId = 1
    let nextEnemyId = 1
    let bubbles: BubbleEntity[] = []
    let enemies: EnemyEntity[] = []
    let particles: PopParticle[] = []
    let scorePopups: ScorePopup[] = []

    const spawnEnemies = (stg: number) => {
      const stageIdx = ((stg - 1) % 5) + 1
      const count = 2 + stageIdx
      const list: EnemyEntity[] = []
      for (let i = 0; i < count; i++) {
        list.push({
          id: nextEnemyId++,
          x: 140 + ((i * 120) % (WIDTH - 280)),
          y: 90 + ((i * 65) % 320),
          vx: (i % 2 === 0 ? 1 : -1) * (1.6 + stageIdx * 0.2),
          vy: 0,
          w: 32,
          h: 32,
          isTrapped: false,
          dead: false,
        })
      }
      return list
    }

    enemies = spawnEnemies(gameStateRef.current.stage)

    let lastShootTime = 0
    let stageClearTimer = 0

    // 파티클 생성기
    const createPopEffect = (x: number, y: number, color: string = '#00ffff') => {
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.5 + Math.random() * 3
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          life: 25,
        })
      }
    }

    const resetForNewStage = (newStage: number) => {
      platforms = getStagePlatforms(newStage)
      enemies = spawnEnemies(newStage)
      bubbles = []
      particles = []
      player.x = 100
      player.y = HEIGHT - 150
      player.vx = 0
      player.vy = 0
    }

    const update = () => {
      if (isPaused || gameOverScreen.show) return

      if (player.invulnerableTimer > 0) {
        player.invulnerableTimer--
      }

      // 조작 입력
      const left = controls.left || keysRef.current['arrowleft'] || keysRef.current['a']
      const right = controls.right || keysRef.current['arrowright'] || keysRef.current['d']
      const jump =
        controls.jump ||
        keysRef.current['arrowup'] ||
        keysRef.current['w'] ||
        keysRef.current[' ']
      const shoot = controls.shoot || keysRef.current['z']

      if (left) {
        player.vx = -player.speed
        player.facing = 'left'
      } else if (right) {
        player.vx = player.speed
        player.facing = 'right'
      } else {
        player.vx = 0
      }

      if (jump && player.grounded) {
        player.vy = player.jumpPower
        player.grounded = false
      }

      // 중력
      player.vy += player.gravity
      player.x += player.vx
      player.y += player.vy

      if (player.x < 0) player.x = 0
      if (player.x > WIDTH - player.w) player.x = WIDTH - player.w

      // 발판 충돌
      player.grounded = false
      for (const p of platforms) {
        if (
          player.x + player.w > p.x &&
          player.x < p.x + p.w &&
          player.y + player.h >= p.y &&
          player.y + player.h - player.vy <= p.y + 12 &&
          player.vy >= 0
        ) {
          player.y = p.y - player.h
          player.vy = 0
          player.grounded = true
        }
      }

      // [SPEC 규칙] 방울 직선 발사:
      // Z키를 누르면 캐릭터 전방으로 지면과 수평한 직선 궤적으로 약 250px 발사된 후 부유 상태로 전환
      const now = Date.now()
      if (shoot && now - lastShootTime > 320) {
        const dir: 1 | -1 = player.facing === 'right' ? 1 : -1
        const startX = player.facing === 'right' ? player.x + player.w + 6 : player.x - 6
        const startY = player.y + player.h / 2

        bubbles.push({
          id: nextBubbleId++,
          x: startX,
          y: startY,
          startX: startX,
          direction: dir,
          isFloating: false,
          trappedEnemyId: null,
          radius: 18,
          life: 450,
        })
        lastShootTime = now
      }

      // 방울 업데이트 및 충돌
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        b.life--

        if (!b.isFloating) {
          // 직선 수평 이동 (약 250px 사거리)
          b.x += b.direction * BUBBLE_SPEED
          const distanceTravelled = Math.abs(b.x - b.startX)
          if (distanceTravelled >= BUBBLE_RANGE || b.x <= b.radius || b.x >= WIDTH - b.radius) {
            b.isFloating = true
            b.x = Math.max(b.radius + 2, Math.min(WIDTH - b.radius - 2, b.x))
          }

          // [SPEC 규칙] 발사 중인 방울이 적 캐릭터와 충돌하면 적이 방울 내부에 즉시 포획되어 둥둥 떠오름
          if (b.trappedEnemyId === null) {
            for (const en of enemies) {
              if (!en.dead && !en.isTrapped) {
                const enCenterX = en.x + en.w / 2
                const enCenterY = en.y + en.h / 2
                const dist = Math.hypot(b.x - enCenterX, b.y - enCenterY)
                if (dist < b.radius + 16) {
                  en.isTrapped = true
                  b.trappedEnemyId = en.id
                  b.isFloating = true
                  createPopEffect(b.x, b.y, '#e94560')
                  break
                }
              }
            }
          }
        } else {
          // 부유 상태 (상단으로 서서히 떠오름)
          b.y -= 1.1
          // 약간의 좌우 흔들림
          b.x += Math.sin((b.life + b.id * 10) * 0.05) * 0.6

          if (b.x < b.radius) b.x = b.radius
          if (b.x > WIDTH - b.radius) b.x = WIDTH - b.radius

          // 상단 천장에 닿았을 때
          if (b.y <= b.radius + 10) {
            b.y = b.radius + 10
          }

          // 포획 중인 적과 좌표 동기화
          if (b.trappedEnemyId !== null) {
            const en = enemies.find((e) => e.id === b.trappedEnemyId)
            if (en) {
              en.x = b.x - en.w / 2
              en.y = b.y - en.h / 2
            }
          }
        }

        // [SPEC 규칙] 방울 터뜨리기 및 적 처치:
        // 플레이어 캐릭터가 방울(빈 방울 또는 적이 갇힌 방울)과 부딪히면 방울이 터짐.
        // 방울 안에 적 캐릭터가 들어있는 상태에서 플레이어가 부딪히면 적과 방울이 함께 터지며 적이 처치되고 100점 획득
        const pCenterX = player.x + player.w / 2
        const pCenterY = player.y + player.h / 2
        const distToPlayer = Math.hypot(pCenterX - b.x, pCenterY - b.y)

        if (distToPlayer < player.w / 2 + b.radius) {
          if (b.trappedEnemyId !== null) {
            const en = enemies.find((e) => e.id === b.trappedEnemyId)
            if (en && !en.dead) {
              en.dead = true
              gameStateRef.current.score += 100
              scorePopups.push({ x: b.x, y: b.y, text: '+100', life: 40 })
              createPopEffect(b.x, b.y, '#FF5722')
            }
          } else {
            createPopEffect(b.x, b.y, '#00ffff')
          }
          bubbles.splice(i, 1)
          onStateUpdate(gameStateRef.current.score, gameStateRef.current.stage, gameStateRef.current.lives)
          continue
        }

        // 수명 다한 방울 제거
        if (b.life <= 0) {
          // 적이 갇혀있으면 적도 탈출 또는 제거
          if (b.trappedEnemyId !== null) {
            const en = enemies.find((e) => e.id === b.trappedEnemyId)
            if (en && !en.dead) {
              en.isTrapped = false
            }
          }
          createPopEffect(b.x, b.y, '#00ffff')
          bubbles.splice(i, 1)
        }
      }

      // 적 업데이트 (움직임 및 플레이어 충돌)
      for (const en of enemies) {
        if (en.dead || en.isTrapped) continue

        en.x += en.vx
        if (en.x <= 20 || en.x >= WIDTH - en.w - 20) {
          en.vx *= -1
        }

        // 플레이어와 충돌 -> 피격
        if (player.invulnerableTimer <= 0) {
          const pCenterX = player.x + player.w / 2
          const pCenterY = player.y + player.h / 2
          const eCenterX = en.x + en.w / 2
          const eCenterY = en.y + en.h / 2

          if (Math.hypot(pCenterX - eCenterX, pCenterY - eCenterY) < 26) {
            gameStateRef.current.lives -= 1
            player.invulnerableTimer = 90
            player.x = 100
            player.y = HEIGHT - 150
            player.vx = 0
            player.vy = 0

            if (gameStateRef.current.lives <= 0) {
              // 게임 오버
              setGameOverScreen({ show: true, score: gameStateRef.current.score })
              if (onGameOver) onGameOver(gameStateRef.current.score)
              onStateUpdate(
                gameStateRef.current.score,
                gameStateRef.current.stage,
                0,
                true
              )
              return
            } else {
              onStateUpdate(
                gameStateRef.current.score,
                gameStateRef.current.stage,
                gameStateRef.current.lives
              )
            }
          }
        }
      }

      // 스테이지 클리어 확인: 맵 내의 모든 적을 처치하면 스테이지 클리어 효과 후 다음 스테이지로 즉시 이동
      const remainingEnemies = enemies.filter((e) => !e.dead)
      if (remainingEnemies.length === 0) {
        stageClearTimer++
        if (stageClearTimer > 35) {
          stageClearTimer = 0
          // 기본 총 5개 스테이지 순환
          let nextStg = gameStateRef.current.stage + 1
          if (nextStg > 5) nextStg = 1
          gameStateRef.current.stage = nextStg
          resetForNewStage(nextStg)
          onStateUpdate(gameStateRef.current.score, gameStateRef.current.stage, gameStateRef.current.lives)
        }
      }

      // 파티클 & 팝업 업데이트
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life--
        if (p.life <= 0) particles.splice(i, 1)
      }

      for (let i = scorePopups.length - 1; i >= 0; i--) {
        const s = scorePopups[i]
        s.y -= 1
        s.life--
        if (s.life <= 0) scorePopups.splice(i, 1)
      }
    }

    const draw = () => {
      // 배경
      ctx.fillStyle = '#111111'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      // 그리드 라인
      ctx.strokeStyle = '#1a1a2e'
      ctx.lineWidth = 1
      for (let x = 0; x < WIDTH; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y < HEIGHT; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(WIDTH, y)
        ctx.stroke()
      }

      // 발판 렌더링
      ctx.fillStyle = '#0f3460'
      ctx.strokeStyle = '#e94560'
      ctx.lineWidth = 2
      for (const p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h)
        ctx.strokeRect(p.x, p.y, p.w, p.h)
      }

      // 플레이어 렌더링
      if (player.invulnerableTimer % 6 < 3) {
        ctx.save()
        ctx.fillStyle = '#FF5722'
        ctx.beginPath()
        ctx.arc(player.x + player.w / 2, player.y + player.h / 2, player.w / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()

        // 눈
        ctx.fillStyle = '#ffffff'
        const eyeOffset = player.facing === 'right' ? 8 : -8
        ctx.beginPath()
        ctx.arc(player.x + player.w / 2 + eyeOffset, player.y + 12, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(player.x + player.w / 2 + eyeOffset + (player.facing === 'right' ? 1 : -1), player.y + 12, 1.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 적 렌더링
      for (const en of enemies) {
        if (en.dead) continue
        ctx.save()
        if (en.isTrapped) {
          ctx.fillStyle = '#ff0055'
        } else {
          ctx.fillStyle = '#e94560'
        }
        ctx.fillRect(en.x, en.y, en.w, en.h)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.strokeRect(en.x, en.y, en.w, en.h)

        // 적 눈
        ctx.fillStyle = '#ffff00'
        ctx.fillRect(en.x + 6, en.y + 8, 6, 6)
        ctx.fillRect(en.x + 20, en.y + 8, 6, 6)
        ctx.restore()
      }

      // 방울 렌더링
      for (const b of bubbles) {
        ctx.save()
        // 방울 원체
        ctx.fillStyle = b.trappedEnemyId !== null ? 'rgba(233, 69, 96, 0.4)' : 'rgba(0, 255, 255, 0.3)'
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = b.trappedEnemyId !== null ? '#e94560' : '#00ffff'
        ctx.lineWidth = 2
        ctx.stroke()

        // 방울 하이라이트
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.beginPath()
        ctx.arc(b.x - 5, b.y - 5, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 파티클 렌더링
      for (const p of particles) {
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // 점수 팝업 렌더링
      ctx.font = '16px DungGeunMo, sans-serif'
      ctx.fillStyle = '#ffff00'
      for (const s of scorePopups) {
        ctx.fillText(s.text, s.x - 14, s.y)
      }
    }

    const loop = () => {
      update()
      draw()
      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [controls, isPaused, gameOverScreen.show, onStateUpdate, onGameOver])

  const handleRestart = () => {
    gameStateRef.current.score = 0
    gameStateRef.current.stage = 1
    gameStateRef.current.lives = 3
    setGameOverScreen({ show: false, score: 0 })
    onStateUpdate(0, 1, 3)
  }

  return (
    <div className="relative flex items-center justify-center w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full max-w-[800px] aspect-[4/3] bg-black rounded-lg shadow-2xl block"
      />

      {gameOverScreen.show && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center select-none z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-[#e94560] mb-3 animate-pulse">
            GAME OVER
          </h2>
          <p className="text-xl md:text-2xl text-white mb-2">
            최종 점수: <span className="text-yellow-400 font-bold">{gameOverScreen.score}</span>점
          </p>
          <p className="text-sm text-gray-300 mb-6">
            모든 목숨을 잃었습니다. 다시 도전해 보세요!
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-[#FF5722] hover:bg-[#f4511e] text-white font-bold text-lg rounded-lg shadow-lg active:scale-95 transition-all"
            >
              다시 시작
            </button>
            <a
              href="/ranking"
              className="px-6 py-3 bg-[#0f3460] hover:bg-[#1b498a] text-white font-bold text-lg rounded-lg shadow-lg active:scale-95 transition-all"
            >
              순위표 보기
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
