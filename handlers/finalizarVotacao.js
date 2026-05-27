const db             = require("../database");
const mediaRobusta   = require("../utils/mediaRobusta");
const activeSessions = require("../sessions/activeSessions");
const userService    = require("../services/userService");

async function finalizarVotacao(channelId) {

    const session = activeSessions.get(channelId);
    if (!session) return;

    const { alvoId, votos, interaction, sessionId, duelo } = session;
    const valores = Object.values(votos);

    const userId = interaction.user.id;

    /* ── DUELO (Espada Lendária) ── */
    if (duelo) {
        activeSessions.delete(channelId);

        if (valores.length === 0) {
            return interaction.followUp({ content: "⚔️ Duelo sem votos. Ninguém foi moggado." });
        }

        const soma = valores.reduce((a, b) => a + b, 0);

        // empate
        if (soma === 0) {
            const perda = Math.floor(duelo.aposta / 2);
            userService.addAura(duelo.desafianteId, -perda);
            userService.addAura(duelo.alvoId,       -perda);

            return interaction.followUp({
                content:
                    `⚔️ **Duelo Empatado!**\n\n` +
                    `Sem vencedor — ambos foram moggados e perderam **${perda} aura** (metade da aposta).\n` +
                    `Votos: ${valores.filter(v => v === 1).length} x ${valores.filter(v => v === -1).length}`
            });
        }

        const desafianteVenceu = soma > 0;
        const vencedor = desafianteVenceu ? duelo.desafianteId : duelo.alvoId;
        const perdedor = desafianteVenceu ? duelo.alvoId       : duelo.desafianteId;

        userService.addAura(vencedor,  duelo.aposta);
        userService.addAura(perdedor, -duelo.aposta);

        return interaction.followUp({
            content:
                `⚔️ **Duelo Encerrado!**\n\n` +
                `🏆 Moggador: <@${vencedor}> **+${duelo.aposta} aura**\n` +
                `💀 Moggado: <@${perdedor}> **-${duelo.aposta} aura**\n` +
                `Votos: ${valores.filter(v => v === 1).length} x ${valores.filter(v => v === -1).length}`
        });
    }

    /* ── VOTAÇÃO NORMAL ── */
    if (valores.length === 0) {
        await interaction.followUp({ content: "Votação encerrada. Ninguém votou." });
        activeSessions.delete(channelId);
        return;
    }

    let media = mediaRobusta(valores);

    const pocaoRow = db.prepare(`
        SELECT data FROM efeitos_ativos
        WHERE userId = ? AND tipo = 'pocao' AND expiresAt > ?
    `).get(alvoId, Date.now());

    if (pocaoRow) {
        const efeito = JSON.parse(pocaoRow.data);
        media = media * efeito.multiplicador;

        db.prepare(`DELETE FROM efeitos_ativos WHERE userId = ? AND tipo = 'pocao'`)
        .run(alvoId);
    }

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
