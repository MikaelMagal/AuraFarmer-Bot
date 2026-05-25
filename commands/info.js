async function info(interaction) {

    return interaction.reply({
        content:
            "Bot de votação de aura.\n" +
            "Use /votar para iniciar votação.\n" +
            "Use /leaderboard para ranking.\n" +
            "Use /perfil para perfil.\n" +
            "Use /loja para comprar itens.",
        ephemeral: true
    });
}

module.exports = info;