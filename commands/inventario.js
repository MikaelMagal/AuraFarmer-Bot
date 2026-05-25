const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const inventoryService = require("../services/inventoryService");
const itens            = require("../config/itens");

async function inventario(interaction) {

    const rows = inventoryService.getInventory(interaction.user.id);

    if (rows.length === 0) {
        return interaction.reply({
            content: "Seu inventário está vazio.",
            ephemeral: true
        });
    }

    const itensDoUsuario = rows.map(r => itens.find(i => i.id === r.itemId)).filter(Boolean);

    // mostra o primeiro item
    let index = 0;
    const item = itensDoUsuario[index];

    const embed = new EmbedBuilder()
        .setTitle(`🎒 Inventário — ${item.nome}`)
        .setDescription(`${item.descricao}\n\n*Item ${index + 1} de ${itensDoUsuario.length}*`)
        .addFields({ name: "✨ Raridade", value: item.raridade, inline: true })
        .setColor("#a855f7");

    const buttons = [];

    if (itensDoUsuario.length > 1) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId(`inv_prev_${index}_${interaction.user.id}`)
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`inv_next_${index}_${interaction.user.id}`)
                .setLabel("➡️")
                .setStyle(ButtonStyle.Secondary)
        );
    }

    buttons.push(
        new ButtonBuilder()
            .setCustomId(`inv_usar_${item.id}_${interaction.user.id}`)
            .setLabel(`Usar ${item.nome}`)
            .setStyle(ButtonStyle.Success)
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    });
}

module.exports = inventario;
