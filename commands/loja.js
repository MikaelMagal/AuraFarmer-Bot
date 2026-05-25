const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const itens = require("../config/itens");
const db = require("../database");

async function loja(interaction) {

    let index = 0;

    const item = itens[index];

    const userData = db.prepare(`
        SELECT aura
        FROM users
        WHERE userId = ?
    `).get(interaction.user.id);

    const aura = userData?.aura || 0;

    const possuiItem = db.prepare(`
        SELECT *
        FROM inventory
        WHERE userId = ?
        AND itemId = ?
    `).get(
        interaction.user.id,
        item.id
    );

    const embed = new EmbedBuilder()
        .setTitle(item.nome)
        .setDescription(item.descricao)
        .addFields(
            {
                name: "Preço",
                value: `${item.preco}`,
                inline: true
            },
            {
                name: "Aura",
                value: `${aura}`,
                inline: true
            }
        );

    const buttons = [

        new ButtonBuilder()
            .setCustomId(`prev_${index}`)
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary)
    ];

    if (!possuiItem) {

        buttons.push(
            new ButtonBuilder()
                .setCustomId(`buy_${index}`)
                .setLabel("Comprar")
                .setStyle(ButtonStyle.Success)
        );
    }

    buttons.push(
        new ButtonBuilder()
            .setCustomId(`next_${index}`)
            .setLabel("➡️")
            .setStyle(ButtonStyle.Secondary)
    );

    const row =
        new ActionRowBuilder()
            .addComponents(buttons);

    return interaction.reply({
        embeds: [embed],
        components: [row]
    });
}

module.exports = loja;