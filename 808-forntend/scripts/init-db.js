import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, '..', 'data', 'app.db');

// Create data directory if it doesn't exist
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Creating database tables...');

// Create tables
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

db.exec(`
  CREATE TABLE IF NOT EXISTS voice_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('tts', 'multi-speaker')),
    text TEXT NOT NULL,
    voice_config TEXT NOT NULL,
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

db.exec(`
  CREATE TABLE IF NOT EXISTS user_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    characters_used INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    audio_generated_seconds REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_voice_generations_user_id ON voice_generations(user_id);
  CREATE INDEX IF NOT EXISTS idx_voice_generations_created_at ON voice_generations(created_at);
  CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON user_usage(user_id, month);
`);

console.log('Database tables created successfully!');

// Create a demo user
async function createDemoUser() {
  const email = 'demo@808voice.com';
  const name = 'Demo User';
  const password = 'demo123';

  // Check if demo user already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    console.log('Demo user already exists');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const apiKey = crypto.randomBytes(32).toString('hex');

  const stmt = db.prepare(`
    INSERT INTO users (email, name, password_hash, api_key)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(email, name, passwordHash, apiKey);
  console.log(`Demo user created with ID: ${result.lastInsertRowid}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`API Key: ${apiKey}`);
}

// Create demo user
createDemoUser().then(() => {
  console.log('Database initialization complete!');
  db.close();
}).catch(error => {
  console.error('Error creating demo user:', error);
  db.close();
});
