const {
    EmbedBuilder
} = require("discord.js");

function leaderboardEmbed(texto) {

    return new EmbedBuilder()

        .setTitle(
            "🏆 Leaderboard Global"
        )

        .setDescription(texto);
}

module.exports =
    leaderboardEmbed;