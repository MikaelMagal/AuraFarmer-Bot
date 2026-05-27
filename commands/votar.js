const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const activeSessions            = require("../sessions/activeSessions");
const finalizarVotacao          = require("../handlers/finalizarVotacao");
const { isOnCooldown, setCooldown, formatarTempo } = require("../utils/cooldown");

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutos

async function votar(interaction) {

    const alvo  = interaction.options.getUser("usuario");
    const canal = interaction.member.voice.channel;

    if (!canal) {
        return interaction.reply({
            content: "Entre em uma call primeiro.",
            ephemeral: true
        });
    }

    // cooldown por guild
    const cdKey    = `votar:${interaction.guildId}`;
    const expireAt = isOnCooldown(cdKey);

    if (activeSessions.has(canal.id)) {
        return interaction.reply({
            content: "Já existe uma votação ativa nessa call.",
            ephemeral: true
        });
    }

    if (!canal.members.has(alvo.id)) {
        return interaction.reply({
            content: "O alvo precisa estar na mesma call.",
            ephemeral: true
        });
    }

    // pega apelido do alvo (para o Chapéu Sigma)
    const membro    = canal.members.get(alvo.id);
    const nomeAlvo  = membro?.nickname || alvo.username;

    const session = {
        alvoId:    alvo.id,
        nomeAlvo,
        votos:     {},
        interaction,
        sessionId: Date.now().toString()
    };

    activeSessions.set(canal.id, session);
    setCooldown(cdKey, COOLDOWN_MS);

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`vote_10000_${canal.id}`)
            .setLabel("💀 AURA INFINITA")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`vote_5000_${canal.id}`)
            .setLabel("Muita Aura")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`vote_2000_${canal.id}`)
            .setLabel("Aura")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`vote_0_${canal.id}`)
            .setLabel("Sem Aura")
            .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`vote_-5000_${canal.id}`)
            .setLabel("Perdeu Aura")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`vote_-10000_${canal.id}`)
            .setLabel("Sobrou nada 💀")
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
        content:
            `**VOTAÇÃO ATIVA**\n\n` +
            `Alvo: **${nomeAlvo}** (<@${alvo.id}>)\n` +
            `Tempo: 60 segundos\n\n` +
            `Clique para votar!`,
        components: [row1, row2]
    });

    setTimeout(() => finalizarVotacao(canal.id), 60_000);
}

module.exports = votar;
