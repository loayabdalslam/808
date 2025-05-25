import Database from 'better-sqlite3';
import path from 'path';

// Database path
const dbPath = path.join(process.cwd(), 'data', 'app.db');

// Initialize database
let db: Database.Database;

export function initDatabase() {
  try {
    // Create data directory if it doesn't exist
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables
    createTables();
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

function createTables() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      api_key TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Auth tokens table for persistent sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Voice generations history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS voice_generations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('tts', 'multi-speaker')),
      text TEXT NOT NULL,
      voice_config TEXT NOT NULL, -- JSON string for voice configuration
      audio_url TEXT,
      audio_filename TEXT,
      duration REAL,
      characters INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // User usage tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month TEXT NOT NULL, -- Format: YYYY-MM
      characters_used INTEGER DEFAULT 0,
      api_calls INTEGER DEFAULT 0,
      audio_generated_seconds REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, month),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_voice_generations_user_id ON voice_generations(user_id);
    CREATE INDEX IF NOT EXISTS idx_voice_generations_created_at ON voice_generations(created_at);
    CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON user_usage(user_id, month);
  `);
}

export function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// User management functions
export interface User {
  id: number;
  email: string;
  name: string;
  api_key?: string;
  created_at: string;
}

export interface VoiceGeneration {
  id: number;
  user_id: number;
  type: 'tts' | 'multi-speaker';
  text: string;
  voice_config: string;
  audio_url?: string;
  audio_filename?: string;
  duration?: number;
  characters: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface UserUsage {
  id: number;
  user_id: number;
  month: string;
  characters_used: number;
  api_calls: number;
  audio_generated_seconds: number;
}

// Initialize database on module load
if (typeof window === 'undefined') {
  // Only initialize on server side
  try {
    initDatabase();
  } catch (error) {
    console.error('Failed to initialize database on startup:', error);
  }
}
