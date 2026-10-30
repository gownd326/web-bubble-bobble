import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { UserSession } from '@/types/game'

const SALT_ROUNDS = 10

// 인메모리 세션 스토어
const sessions = new Map<string, UserSession>()

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

export function createSession(userId: number, username: string): string {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24시간 유효
  sessions.set(token, { userId, username, expiresAt })
  return token
}

export function getSession(token: string | undefined): UserSession | null {
  if (!token) return null
  const session = sessions.get(token)
  if (!session) return null
  if (Date.now() > session.expiresAt) {
    sessions.delete(token)
    return null
  }
  return session
}

export function destroySession(token: string | undefined) {
  if (!token) return
  sessions.delete(token)
}
