import { getDatabase, User, VoiceGeneration, UserUsage } from './database';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const db = getDatabase();

// User functions
export async function createUser(email: string, name: string, password: string): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 10);
  const apiKey = crypto.randomBytes(32).toString('hex');
  
  const stmt = db.prepare(`
    INSERT INTO users (email, name, password_hash, api_key)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(email, name, passwordHash, apiKey);
  
  return {
    id: result.lastInsertRowid as number,
    email,
    name,
    api_key: apiKey,
    created_at: new Date().toISOString()
  };
}

export function getUserByEmail(email: string): User | null {
  const stmt = db.prepare('SELECT id, email, name, api_key, created_at FROM users WHERE email = ?');
  return stmt.get(email) as User | null;
}

export function getUserById(id: number): User | null {
  const stmt = db.prepare('SELECT id, email, name, api_key, created_at FROM users WHERE id = ?');
  return stmt.get(id) as User | null;
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email) as any;
  
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    api_key: user.api_key,
    created_at: user.created_at
  };
}

// Auth token functions
export function createAuthToken(userId: number): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  const stmt = db.prepare(`
    INSERT INTO auth_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(userId, token, expiresAt.toISOString());
  return token;
}

export function getUserByToken(token: string): User | null {
  const stmt = db.prepare(`
    SELECT u.id, u.email, u.name, u.api_key, u.created_at
    FROM users u
    JOIN auth_tokens t ON u.id = t.user_id
    WHERE t.token = ? AND t.expires_at > datetime('now')
  `);
  
  return stmt.get(token) as User | null;
}

export function deleteAuthToken(token: string): void {
  const stmt = db.prepare('DELETE FROM auth_tokens WHERE token = ?');
  stmt.run(token);
}

// Voice generation functions
export function createVoiceGeneration(
  userId: number,
  type: 'tts' | 'multi-speaker',
  text: string,
  voiceConfig: any
): number {
  const stmt = db.prepare(`
    INSERT INTO voice_generations (user_id, type, text, voice_config, characters, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `);
  
  const result = stmt.run(
    userId,
    type,
    text,
    JSON.stringify(voiceConfig),
    text.length
  );
  
  return result.lastInsertRowid as number;
}

export function updateVoiceGeneration(
  id: number,
  updates: Partial<{
    audio_url: string;
    audio_filename: string;
    duration: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error_message: string;
    completed_at: string;
  }>
): void {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  
  const stmt = db.prepare(`UPDATE voice_generations SET ${fields} WHERE id = ?`);
  stmt.run(...values, id);
}

export function getVoiceGenerationsByUser(userId: number, limit = 50, offset = 0): VoiceGeneration[] {
  const stmt = db.prepare(`
    SELECT * FROM voice_generations
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  
  return stmt.all(userId, limit, offset) as VoiceGeneration[];
}

export function getVoiceGenerationById(id: number): VoiceGeneration | null {
  const stmt = db.prepare('SELECT * FROM voice_generations WHERE id = ?');
  return stmt.get(id) as VoiceGeneration | null;
}

// Usage tracking functions
export function updateUserUsage(
  userId: number,
  charactersUsed: number,
  apiCalls: number = 1,
  audioSeconds: number = 0
): void {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  const stmt = db.prepare(`
    INSERT INTO user_usage (user_id, month, characters_used, api_calls, audio_generated_seconds)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, month) DO UPDATE SET
      characters_used = characters_used + excluded.characters_used,
      api_calls = api_calls + excluded.api_calls,
      audio_generated_seconds = audio_generated_seconds + excluded.audio_generated_seconds,
      updated_at = CURRENT_TIMESTAMP
  `);
  
  stmt.run(userId, month, charactersUsed, apiCalls, audioSeconds);
}

export function getUserUsage(userId: number, month?: string): UserUsage | null {
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  
  const stmt = db.prepare(`
    SELECT * FROM user_usage
    WHERE user_id = ? AND month = ?
  `);
  
  return stmt.get(userId, targetMonth) as UserUsage | null;
}

export function getUserStats(userId: number): {
  totalGenerations: number;
  totalCharacters: number;
  totalDuration: number;
  thisMonthUsage: UserUsage | null;
} {
  const totalStmt = db.prepare(`
    SELECT 
      COUNT(*) as total_generations,
      SUM(characters) as total_characters,
      SUM(COALESCE(duration, 0)) as total_duration
    FROM voice_generations
    WHERE user_id = ? AND status = 'completed'
  `);
  
  const totals = totalStmt.get(userId) as any;
  const thisMonthUsage = getUserUsage(userId);
  
  return {
    totalGenerations: totals.total_generations || 0,
    totalCharacters: totals.total_characters || 0,
    totalDuration: totals.total_duration || 0,
    thisMonthUsage
  };
}
