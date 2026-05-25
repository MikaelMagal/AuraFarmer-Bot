const db = require("../database");

function hasItem(userId, itemId) {
    return db.prepare(`
        SELECT * FROM inventory WHERE userId = ? AND itemId = ?
    `).get(userId, itemId);
}

function addItem(userId, itemId) {
    db.prepare(`
        INSERT OR IGNORE INTO inventory (userId, itemId) VALUES (?, ?)
    `).run(userId, itemId);
}

function removeItem(userId, itemId) {
    db.prepare(`
        DELETE FROM inventory WHERE userId = ? AND itemId = ?
    `).run(userId, itemId);
}

function getInventory(userId) {
    return db.prepare(`
        SELECT itemId FROM inventory WHERE userId = ?
    `).all(userId);
}

module.exports = { hasItem, addItem, removeItem, getInventory };
