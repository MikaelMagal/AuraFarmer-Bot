const db = require("../database");

// key: string única ex "votar:guildId" ou "farmar:userId"
function isOnCooldown(key) {
    const row = db.prepare(`
        SELECT expiresAt FROM cooldowns WHERE key = ?
    `).get(key);

    if (!row) return false;
    if (Date.now() < row.expiresAt) return row.expiresAt;
    return false;
}

function setCooldown(key, ms) {
    const expiresAt = Date.now() + ms;
    db.prepare(`
        INSERT OR REPLACE INTO cooldowns (key, expiresAt)
        VALUES (?, ?)
    `).run(key, expiresAt);
}

function formatarTempo(ms) {
    const total  = Math.ceil(ms / 1000);
    const horas  = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = total % 60;

    if (horas > 0)    return `${horas}h ${minutos}m`;
    if (minutos > 0)  return `${minutos}m ${segundos}s`;
    return `${segundos}s`;
}

module.exports = { isOnCooldown, setCooldown, formatarTempo };
