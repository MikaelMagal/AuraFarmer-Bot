async function info(interaction) {

    return interaction.reply({
        content:
            "Bot de votação de aura.\n" +
            "Use /votar para iniciar votação.\n" +
            "Use /leaderboard para ranking.\n" +
            "Use /perfil para perfil.\n" +
            "Use /loja para comprar itens." +
            "Use /farmar para coletar aura diária." +
            "Use /inventario para ver seus itens." +
            "Use /usar {item} {alvo se necessário} para usar um item do inventário.",
        ephemeral: true
    });
}

module.exports = info;