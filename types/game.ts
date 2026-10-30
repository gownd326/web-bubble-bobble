export interface UserSession {
  userId: number
  username: string
  expiresAt: number
}

export interface GameSave {
  id?: number
  user_id?: number
  stage: number
  score: number
  high_score: number
  lives: number
  updated_at?: string
}

export interface RankingEntry {
  username: string
  high_score: number
  updated_at: string
}

export interface Player {
  x: number
  y: number
  w: number
  h: number
  vx: number
  vy: number
  speed: number
  jumpPower: number
  gravity: number
  grounded: boolean
  facing: 'left' | 'right'
}

export interface Platform {
  x: number
  y: number
  w: number
  h: number
}

export interface BubbleEntity {
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

export interface EnemyEntity {
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

export interface PopEffect {
  x: number
  y: number
  timer: number
  text?: string
}
