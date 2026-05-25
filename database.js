const Database = require("better-sqlite3");
const db = new Database("votos.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS votes (
        sessionId TEXT,
        targetId  TEXT,
        userId    TEXT,
        value     INTEGER,
        PRIMARY KEY (sessionId, userId)
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS results (
        sessionId  TEXT PRIMARY KEY,
        targetId   TEXT,
        finalScore REAL,
        createdAt  INTEGER
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        userId    TEXT PRIMARY KEY,
        aura      REAL DEFAULT 0,
        lastDaily INTEGER DEFAULT 0
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS inventory (
        userId TEXT,
        itemId TEXT,
        PRIMARY KEY (userId, itemId)
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS cooldowns (
        key       TEXT PRIMARY KEY,
        expiresAt INTEGER
    )
`).run();

module.exports = db;
