const db = require("../database");

function getAura(userId) {
    const row = db.prepare(`
        SELECT aura FROM users WHERE userId = ?
    `).get(userId);
    return row?.aura || 0;
}

function addAura(userId, amount) {
    db.prepare(`
        INSERT OR IGNORE INTO users (userId, aura)
        VALUES (?, 0)
    `).run(userId);

    db.prepare(`
        UPDATE users SET aura = aura + ? WHERE userId = ?
    `).run(amount, userId);
}

function getUser(userId) {
    return db.prepare(`
        SELECT * FROM users WHERE userId = ?
    `).get(userId);
}

function claimDaily(userId) {
    const now   = Date.now();
    const user  = getUser(userId);
    const last  = user?.lastDaily || 0;
    const diff  = now - last;
    const MS_24H = 24 * 60 * 60 * 1000;

    if (diff < MS_24H) {
        const restante = MS_24H - diff;
        const horas    = Math.floor(restante / 3600000);
        const minutos  = Math.floor((restante % 3600000) / 60000);
        return { success: false, horas, minutos };
    }

    const ganho = Math.floor(Math.random() * 101) + 50; // 50~150

    db.prepare(`
        INSERT OR IGNORE INTO users (userId, aura, lastDaily)
        VALUES (?, 0, 0)
    `).run(userId);

    db.prepare(`
        UPDATE users
        SET aura = aura + ?, lastDaily = ?
        WHERE userId = ?
    `).run(ganho, now, userId);

    return { success: true, ganho };
}

module.exports = { getAura, addAura, getUser, claimDaily };
