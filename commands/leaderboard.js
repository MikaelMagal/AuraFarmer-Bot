const db = require("../database");

async function leaderboard(interaction) {

    const rows = db.prepare(`
        SELECT userId, aura
        FROM users
        ORDER BY aura DESC
        LIMIT 10
    `).all();

    if (rows.length === 0) {

        return interaction.reply({
            content:
                "Ainda não há usuários."
        });
    }

    const texto = rows
        .map((r, i) =>
            `${i + 1}. <${r.userId}>: ${r.aura.toFixed(2)} aura`
        )
        .join("\n");

    return interaction.reply({
        content:
            `🏆 Leaderboard Global\n\n${texto}`
    });
}

module.exports = leaderboard;