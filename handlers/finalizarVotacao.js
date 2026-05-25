const db             = require("../database");
const mediaRobusta   = require("../utils/mediaRobusta");
const activeSessions = require("../sessions/activeSessions");
const userService    = require("../services/userService");

async function finalizarVotacao(channelId) {

    const session = activeSessions.get(channelId);
    if (!session) return;

    const { alvoId, votos, interaction, sessionId, duelo } = session;
    const valores = Object.values(votos);

    /* ── DUELO (Espada Lendária) ── */
    if (duelo) {
        activeSessions.delete(channelId);

        if (valores.length === 0) {
            return interaction.followUp({ content: "⚔️ Duelo sem votos. Ninguém ganhou." });
        }

        const soma = valores.reduce((a, b) => a + b, 0);
        // vote_1 = desafiante vence | vote_-1 = alvo vence
        const desafianteVenceu = soma > 0;
        const vencedor  = desafianteVenceu ? duelo.desafianteId : duelo.alvoId;
        const perdedor  = desafianteVenceu ? duelo.alvoId       : duelo.desafianteId;

        userService.addAura(vencedor,  duelo.aposta);
        userService.addAura(perdedor, -duelo.aposta);

        return interaction.followUp({
            content:
                `⚔️ **Duelo Encerrado!**\n\n` +
                `🏆 Vencedor: <@${vencedor}> +${duelo.aposta} aura\n` +
                `💀 Perdedor: <@${perdedor}> -${duelo.aposta} aura\n` +
                `Votos: ${valores.filter(v => v === 1).length} x ${valores.filter(v => v === -1).length}`
        });
    }

    /* ── VOTAÇÃO NORMAL ── */
    if (valores.length === 0) {
        await interaction.followUp({ content: "⏰ Votação encerrada. Ninguém votou." });
        activeSessions.delete(channelId);
        return;
    }

    const media = mediaRobusta(valores);

    db.prepare(`
        INSERT INTO results (sessionId, targetId, finalScore, createdAt)
        VALUES (?, ?, ?, ?)
    `).run(sessionId, alvoId, media, Date.now());

    userService.addAura(alvoId, media);

    // verifica nome sobrescrito pelo Chapéu Sigma
    const nomeExibido = global.nomeOverride?.[alvoId] || session.nomeAlvo || `<@${alvoId}>`;
    if (global.nomeOverride?.[alvoId]) delete global.nomeOverride[alvoId];

    await interaction.followUp({
        content:
            `**⏰ Votação Encerrada**\n\n` +
            `Alvo: **${nomeExibido}**\n` +
            `Aura recebida: **${media.toFixed(0)}**\n` +
            `Total de votos: ${valores.length}`
    });

    activeSessions.delete(channelId);
}

module.exports = finalizarVotacao;
