const db = require("../database");

const {
    EmbedBuilder
} = require("discord.js");

async function perfil(interaction) {

    const user =
        interaction.options.getUser("usuario")
        || interaction.user;

    const data = db.prepare(`
        SELECT aura
        FROM users
        WHERE userId = ?
    `).get(user.id);

    const aura = data?.aura || 0;

    const votacoes = db.prepare(`
        SELECT COUNT(*) as total
        FROM results
        WHERE targetId = ?
    `).get(user.id);

    let badge = "🙂";

    if (aura >= 10000)
        badge = "👑";

    else if (aura >= 5000)
        badge = "🔥";

    else if (aura <= -5000)
        badge = "💀";

    const embed = new EmbedBuilder()
        .setColor(
            aura >= 0
                ? "#00ff88"
                : "#ff4444"
        )
        .setTitle(`${badge} Aura Profile`)
        .setThumbnail(
            user.displayAvatarURL()
        )
        .addFields(
            {
                name: "Usuário",
                value: `<@${user.id}>`,
                inline: true
            },
            {
                name: "Aura",
                value: aura.toFixed(2),
                inline: true
            },
            {
                name: "Votações",
                value: `${votacoes.total}`,
                inline: true
            }
        );

    return interaction.reply({
        embeds: [embed]
    });
}

module.exports = perfil;