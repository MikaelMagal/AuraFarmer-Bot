const {
    EmbedBuilder
} = require("discord.js");

function perfilEmbed(
    user,
    aura,
    votacoes
) {

    return new EmbedBuilder()

        .setColor(
            aura >= 0
                ? "#00ff88"
                : "#ff4444"
        )

        .setTitle("Aura Profile")

        .setThumbnail(
            user.displayAvatarURL({
                dynamic: true
            })
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
                value: `${votacoes}`,
                inline: true
            }
        );
}

module.exports = perfilEmbed;