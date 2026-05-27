const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db               = require("../database");
const activeSessions   = require("../sessions/activeSessions");
const itens            = require("../config/itens");
const shopService      = require("../services/shopService");
const userService      = require("../services/userService");
const inventoryService = require("../services/inventoryService");
const lojaEmbed        = require("../embeds/lojaEmbed");

async function buttonHandler(interaction) {

    const { customId } = interaction;

    /* ── Loja: prev_ / next_ / buy_ ── */
    if (
        customId.startsWith("prev_") ||
        customId.startsWith("next_") ||
        customId.startsWith("buy_")
    ) {
        const [action, indexStr] = customId.split("_");
        let index = Number(indexStr);

        if (action === "prev") index = (index - 1 + itens.length) % itens.length;
        if (action === "next") index = (index + 1) % itens.length;

        if (action === "buy") {
            const item   = itens[index];
            if (!item) return interaction.reply({ content: "Item não encontrado.", ephemeral: true });

            const result = shopService.buyItem(interaction.user.id, item);
            if (!result.success) return interaction.reply({ content: result.message, ephemeral: true });

            return interaction.reply({
                content: `✅ Você comprou **${item.nome}** por ${item.preco} aura.`,
                ephemeral: true
            });
        }

        const item  = itens[index];
        const aura  = userService.getAura(interaction.user.id);
        const owned = inventoryService.hasItem(interaction.user.id, item.id);

        const embed   = lojaEmbed(item, aura);
        const buttons = [
            new ButtonBuilder().setCustomId(`prev_${index}`).setLabel("⬅️").setStyle(ButtonStyle.Secondary)
        ];

        if (!owned) {
            buttons.push(new ButtonBuilder().setCustomId(`buy_${index}`).setLabel("Comprar").setStyle(ButtonStyle.Success));
        } else {
            buttons.push(new ButtonBuilder().setCustomId(`owned_${index}`).setLabel("Já possui").setDisabled(true).setStyle(ButtonStyle.Secondary));
        }

        buttons.push(new ButtonBuilder().setCustomId(`next_${index}`).setLabel("➡️").setStyle(ButtonStyle.Secondary));
        const row = new ActionRowBuilder().addComponents(buttons);

        return interaction.update({ embeds: [embed], components: [row] });
    }

    /* ── Inventário: inv_prev / inv_next / inv_usar ── */
    if (customId.startsWith("inv_")) {
        const parts  = customId.split("_");
        const action = parts[1]; // prev | next | usar
        const ownerId = parts[parts.length - 1];

        // só o dono pode navegar
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: "Este inventário não é seu.", ephemeral: true });
        }

        const rows           = inventoryService.getInventory(ownerId);
        const itensDoUsuario = rows.map(r => itens.find(i => i.id === r.itemId)).filter(Boolean);

        if (action === "usar") {
            const itemId   = parts[2];
            const infoItem = itens.find(i => i.id === itemId);
            return interaction.reply({
                content:
                    `Para usar este item, digite:\n` +
                    `\`/usar item:${itemId}\`\n\n` +
                    `**${infoItem?.nome}** — ${infoItem?.descricao}`,
                ephemeral: true
            });
        }

        let index = Number(parts[2]);
        if (action === "prev") index = (index - 1 + itensDoUsuario.length) % itensDoUsuario.length;
        if (action === "next") index = (index + 1) % itensDoUsuario.length;

        const item = itensDoUsuario[index];

        const embed = new (require("discord.js").EmbedBuilder)()
            .setTitle(`🎒 Inventário — ${item.nome}`)
            .setDescription(`${item.descricao}\n\n*Item ${index + 1} de ${itensDoUsuario.length}*`)
            .addFields({ name: "✨ Raridade", value: item.raridade, inline: true })
            .setColor("#a855f7");

        const buttons = [];
        if (itensDoUsuario.length > 1) {
            buttons.push(
                new ButtonBuilder().setCustomId(`inv_prev_${index}_${ownerId}`).setLabel("⬅️").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`inv_next_${index}_${ownerId}`).setLabel("➡️").setStyle(ButtonStyle.Secondary)
            );
        }
        buttons.push(
            new ButtonBuilder().setCustomId(`inv_usar_${item.id}_${ownerId}`).setLabel(`Usar ${item.nome}`).setStyle(ButtonStyle.Success)
        );

        const row = new ActionRowBuilder().addComponents(buttons);
        return interaction.update({ embeds: [embed], components: [row] });
    }

    /* ── Votos: vote_<valor>_<channelId> ── */
    if (customId.startsWith("vote_")) {
        const parts     = customId.split("_");
        const channelId = parts[parts.length - 1];
        const value     = Number(parts.slice(1, -1).join("_"));

        const session = activeSessions.get(channelId);
        if (!session) {
            return interaction.reply({ content: "Essa votação já acabou.", ephemeral: true });
        }

        const canal = interaction.member.voice.channel;
        if (!canal || canal.id !== channelId) {
            return interaction.reply({ content: "Você precisa estar na call da votação.", ephemeral: true });
        }

        if (interaction.user.id === session.alvoId) {
            return interaction.reply({ content: "Você não pode votar em si mesmo.", ephemeral: true });
        }

        session.votos[interaction.user.id] = value;

        db.prepare(`
            INSERT INTO votes (sessionId, targetId, userId, value)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(sessionId, userId) DO UPDATE SET value = excluded.value
        `).run(session.sessionId, session.alvoId, interaction.user.id, value);

        return interaction.reply({
            content: `✅ Seu voto: **${value > 0 ? "+" : ""}${value} aura**`,
            ephemeral: true
        });
    }
}

module.exports = buttonHandler;
