'use client'

import React, { useEffect, useRef } from 'react'

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
  onStateUpdate: (score: number, stage: number, lives: number) => void
}

interface Platform {
  x: number
  y: number
  w: number
  h: number
}

interface Bubble {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  trappedEnemyIndex: number | null
  life: number
}

interface Enemy {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  isTrapped: boolean
  trapTimer: number
  dead: boolean
}

interface Projectile {
  x: number
  y: number
  vx: number
  radius: number
  life: number
}

export default function GameCanvas({
  controls,
  isPaused,
  initialStage,
  initialScore,
  initialLives,
  onStateUpdate,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // 게임 상태를 Ref로 유지하여 requestAnimationFrame 내에서 최신 값 참조
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

  // 키보드 조작 상태 관리
  const keysRef = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'z', 'Z'].includes(e.key)) {
        if (e.key === ' ') e.preventDefault()
      }
      keysRef.current[e.key.toLowerCase()] = true
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

    // 캔버스 기본 크기
    const WIDTH = 800
    const HEIGHT = 600

    // 플레이어 객체
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
      shootCooldown: 0,
    }

    // 플랫폼 설정 (보글보글 아케이드 풍 발판 구성)
    const platforms: Platform[] = [
      { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 }, // 바닥
      { x: 100, y: 460, w: 200, h: 20 },
      { x: 500, y: 460, w: 200, h: 20 },
      { x: 200, y: 340, w: 400, h: 20 },
      { x: 100, y: 220, w: 200, h: 20 },
      { x: 500, y: 220, w: 200, h: 20 },
      { x: 300, y: 110, w: 200, h: 20 },
    ]

    let bubbles: Bubble[] = []
    let projectiles: Projectile[] = []
    let enemies: Enemy[] = []

    // 스테이지별 적 생성 함수
    const spawnEnemies = (stage: number) => {
      const count = Math.min(2 + stage, 8)
      const newEnemies: Enemy[] = []
      for (let i = 0; i < count; i++) {
        newEnemies.push({
          x: 150 + (i * 100) % (WIDTH - 250),
          y: 100 + (i * 50) % 300,
          w: 32,
          h: 32,
          vx: (i % 2 === 0 ? 1 : -1) * (1.5 + stage * 0.1),
          vy: 0,
          isTrapped: false,
          trapTimer: 0,
          dead: false,
        })
      }
      return newEnemies
    }

    enemies = spawnEnemies(gameStateRef.current.stage)

    let lastShootTime = 0

    const update = () => {
      if (isPaused) return

      // 조작 입력 통합 (가상패드 + 키보드)
      const left = controls.left || keysRef.current['arrowleft'] || keysRef.current['a']
      const right = controls.right || keysRef.current['arrowright'] || keysRef.current['d']
      const jump = controls.jump || keysRef.current['arrowup'] || keysRef.current['w'] || keysRef.current[' ']
      const shoot = controls.shoot || keysRef.current['z']

      // 플레이어 좌우 이동
      if (left) {
        player.vx = -player.speed
        player.facing = 'left'
      } else if (right) {
        player.vx = player.speed
        player.facing = 'right'
      } else {
        player.vx = 0
      }

      // 점프
      if (jump && player.grounded) {
        player.vy = player.jumpPower
        player.grounded = false
      }

      // 중력 적용
      player.vy += player.gravity

      // 위치 업데이트 및 충돌 검사
      player.x += player.vx
      player.y += player.vy

      // 화면 경계 제한
      if (player.x < 0) player.x = 0
      if (player.x > WIDTH - player.w) player.x = WIDTH - player.w

      // 플랫폼 충돌 검사 (플레이어)
      player.grounded = false
      for (const p of platforms) {
        // 위에서 아래로 떨어질 때 착지
        if (
          player.x + player.w > p.x &&
          player.x < p.x + p.w &&
          player.y + player.h >= p.y &&
          player.y + player.h - player.vy <= p.y + 10 &&
          player.vy >= 0
        ) {
          player.y = p.y - player.h
          player.vy = 0
          player.grounded = true
        }
      }

      // 방울 발사 (Z키 또는 가상패드 슛)
      const now = Date.now()
      if (shoot && now - lastShootTime > 300) {
        projectiles.push({
          x: player.facing === 'right' ? player.x + player.w : player.x - 10,
          y: player.y + player.h / 2,
          vx: player.facing === 'right' ? 6 : -6,
          radius: 16,
          life: 90, // 수명 프레임
        })
        lastShootTime = now
      }

      // 방울(발사체) 업데이트
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i]
        proj.x += proj.vx
        proj.life--

        // 방울이 위로 떠오르는 성질 부여 (일정 시간 후 부상)
        if (proj.life < 60) {
          proj.y -= 1.5
        }

        // 화면 밖으로 나가거나 수명이 다하면 제거
        if (proj.x < 0 || proj.x > WIDTH || proj.y < 0 || proj.life <= 0) {
          bubbles.push({
            x: proj.x,
            y: proj.y,
            vx: 0,
            vy: -1,
            radius: 18,
            trappedEnemyIndex: null,
            life: 300,
          })
          projectiles.splice(i, 1)
        }
      }

      // 방울(고정 및 부상) 업데이트
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        b.y += b.vy
        b.life--

        // 적과 방울 충돌 확인 (적을 방울에 가두기)
        if (b.trappedEnemyIndex === null) {
          for (let j = 0; j < enemies.length; j++) {
            const en = enemies[j]
            if (!en.isTrapped && !en.dead) {
              const dist = Math.hypot(b.x - (en.x + en.w / 2), b.y - (en.y + en.h / 2))
              if (dist < b.radius + 15) {
                en.isTrapped = true
                en.trapTimer = 250 // 가혀있는 시간
                b.trappedEnemyIndex = j
                break
              }
            }
          }
        } else {
          // 갇힌 적이 있다면 방울과 함께 이동
          const enIdx = b.trappedEnemyIndex
          if (enemies[enIdx] && !enemies[enIdx].dead) {
            enemies[enIdx].x = b.x - enemies[enIdx].w / 2
            enemies[enIdx].y = b.y - enemies[enIdx].h / 2
          }
        }

        // 수명이 다하거나 화면 상단에 도달하면 소멸
        if (b.life <= 0 || b.y < 0) {
          if (b.trappedEnemyIndex !== null) {
            const enIdx = b.trappedEnemyIndex
            if (enemies[enIdx] && enemies[enIdx].isTrapped) {
              enemies[enIdx].dead = true
              gameStateRef.current.score += 100
            }
          }
          bubbles.splice(i, 1)
        }
      }

      // 적 업데이트
      for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i]
        if (en.dead) continue

        if (en.isTrapped) {
          en.trapTimer--
          if (en.trapTimer <= 0) {
            // 탈출!
            en.isTrapped = false
            // 해당 방울 제거
            bubbles = bubbles.filter((b) => b.trappedEnemyIndex !== i)
          }
        } else {
          // 좌우 이동 및 벽 반사
          en.x += en.vx
          if (en.x < 0 || en.x > WIDTH - en.w) {
            en.vx *= -1
          }

          // 플레이어와 적 충돌 (목숨 감소)
          const pCenterX = player.x + player.w / 2
          const pCenterY = player.y + player.h / 2
          const eCenterX = en.x + en.w / 2
          const eCenterY = en.y + en.h / 2

          if (Math.hypot(pCenterX - eCenterX, pCenterY - eCenterY) < 28) {
            // 플레이어 피격
            gameStateRef.current.lives--
            player.x = 100
            player.y = HEIGHT - 150
            player.vx = 0
            player.vy = 0

            if (gameStateRef.current.lives <= 0) {
              alert('GAME OVER! 점수: ' + gameStateRef.current.score)
              gameStateRef.current.score = 0
              gameStateRef.current.stage = 1
              gameStateRef.current.lives = 3
              enemies = spawnEnemies(1)
            }
            onStateUpdate(gameStateRef.current.score, gameStateRef.current.stage, gameStateRef.current.lives)
            break
          }
        }
      }

      // 방울 터뜨리기 (플레이어가 갇힌 적이 있는 방울을 건드렸을 때)
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        if (b.trappedEnemyIndex !== null) {
          const dist = Math.hypot((player.x + player.w / 2) - b.x, (player.y + player.h / 2) - b.y)
          if (dist < player.w / 2 + b.radius) {
            // 적 처치 성공!
            const enIdx = b.trappedEnemyIndex
            if (enemies[enIdx]) {
              enemies[enIdx].dead = true
              gameStateRef.current.score += 200
            }
            bubbles.splice(i, 1)
            onStateUpdate(gameStateRef.current.score, gameStateRef.current.stage, gameStateRef.current.lives)
          }
        }
      }

      // 모든 적 처치 확인 -> 다음 스테이지
      const aliveEnemies = enemies.filter((en) => !en.dead)
      if (aliveEnemies.length === 0) {
        gameStateRef.current.stage += 1
        gameStateRef.current.score += 500
        enemies = spawnEnemies(gameStateRef.current.stage)
        bubbles = []
        projectiles = []
        onStateUpdate(gameStateRef.current.score, gameStateRef.current.stage, gameStateRef.current.lives)
      }
    }

    const draw = () => {
      // 배경 클리어
      ctx.fillStyle = '#111111'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      // 배경 그리드 패턴 및 레트로 감성 테두리
      ctx.strokeStyle = '#1a1a2e'
      ctx.lineWidth = 2
      for (let x = 0; x < WIDTH; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, HEIGHT)
        ctx.stroke()
      }

      // 플랫폼 렌더링 (#0f3460 블루 계열)
      ctx.fillStyle = '#0f3460'
      ctx.strokeStyle = '#e94560'
      ctx.lineWidth = 2
      for (const p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h)
        ctx.strokeRect(p.x, p.y, p.w, p.h)
      }

      // 플레이어 렌더링 (보글보글 버블론 주황/핑크 감성 캐릭터)
      ctx.fillStyle = '#FF5722'
      ctx.beginPath()
      ctx.arc(player.x + player.w / 2, player.y + player.h / 2, player.w / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // 눈 렌더링
      ctx.fillStyle = '#ffffff'
      const eyeOffsetX = player.facing === 'right' ? 8 : -8
      ctx.beginPath()
      ctx.arc(player.x + player.w / 2 + eyeOffsetX, player.y + 12, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.arc(player.x + player.w / 2 + eyeOffsetX + (player.facing === 'right' ? 1 : -1), player.y + 12, 1.5, 0, Math.PI * 2)
      ctx.fill()

      // 발사체 렌더링
      ctx.fillStyle = '#00ffff'
      for (const proj of projectiles) {
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.stroke()
      }

      // 방울 렌더링
      for (const b of bubbles) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.25)'
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#00ffff'
        ctx.lineWidth = 2
        ctx.stroke()

        // 방울 하이라이트
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.beginPath()
        ctx.arc(b.x - 5, b.y - 5, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      // 적 렌더링
      for (const en of enemies) {
        if (en.dead) continue

        ctx.fillStyle = en.isTrapped ? '#ff0055' : '#e94560'
        ctx.fillRect(en.x, en.y, en.w, en.h)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.strokeRect(en.x, en.y, en.w, en.h)

        // 악당 눈
        ctx.fillStyle = '#ffff00'
        ctx.fillRect(en.x + 6, en.y + 8, 6, 6)
        ctx.fillRect(en.x + 20, en.y + 8, 6, 6)
      }
    }

    const gameLoop = () => {
      update()
      draw()
      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [controls, isPaused, onStateUpdate])

  return (
    <div className="flex items-center justify-center w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full max-w-[800px] aspect-[4/3] bg-black rounded-lg shadow-2xl focus:outline-none"
      />
    </div>
  )
}
