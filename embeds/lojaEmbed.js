const {
    EmbedBuilder
} = require("discord.js");

function lojaEmbed(
    item,
    aura
) {

    return new EmbedBuilder()

        .setTitle(item.nome)

        .setDescription(
            item.descricao
        )

        .setImage(item.imagem)

        .addFields(
            {
                name: "Preço",
                value: `${item.preco}`,
                inline: true
            },
            {
                name: "Raridade",
                value: item.raridade,
                inline: true
            },
            {
                name: "Sua Aura",
                value: `${aura}`,
                inline: true
            }
        );
}

module.exports = lojaEmbed;