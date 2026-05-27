const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const inventoryService = require("../services/inventoryService");
const userService      = require("../services/userService");
const activeSessions   = require("../sessions/activeSessions");
const finalizarVotacao = require("../handlers/finalizarVotacao");
const itens            = require("../config/itens");
const db               = require("../database");

async function usar(interaction) {

    const itemId = interaction.options.getString("item");
    const userId = interaction.user.id;

    // verifica posse
    if (!inventoryService.hasItem(userId, itemId)) {
        return interaction.reply({
            content: "Você não possui esse item.",
            ephemeral: true
        });
    }

    /* ── ESPADA LENDÁRIA: duelo ── */
    if (itemId === "espada_lendaria") {

        const alvo  = interaction.options.getUser("alvo");
        const canal = interaction.member.voice.channel;

        if (!alvo) {
            return interaction.reply({
                content: "Mencione o alvo do duelo com a opção `alvo`.",
                ephemeral: true
            });
        }

        if (!canal) {
            return interaction.reply({
                content: "Entre em uma call para duelar.",
                ephemeral: true
            });
        }

        if (!canal.members.has(alvo.id)) {
            return interaction.reply({
                content: "O alvo precisa estar na mesma call.",
                ephemeral: true
            });
        }

        if (activeSessions.has(canal.id)) {
            return interaction.reply({
                content: "Já existe uma votação/duelo ativo nessa call.",
                ephemeral: true
            });
        }

        const aposta = interaction.options.getInteger("aposta") || 100;

        const auraDesafiante = userService.getAura(userId);
        const auraAlvo       = userService.getAura(alvo.id);

        if (auraDesafiante < aposta || auraAlvo / 2 < aposta) {
            return interaction.reply({
                content: `Ambos precisam ter pelo menos **${aposta} aura** para duelar.`,
                ephemeral: true
            });
        }

        const session = {
            alvoId:    alvo.id,
            nomeAlvo:  alvo.username,
            votos:     {},
            interaction,
            sessionId: Date.now().toString(),
            duelo:     { desafianteId: userId, alvoId: alvo.id, aposta }
        };

        activeSessions.set(canal.id, session);

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`vote_1_${canal.id}`)
                .setLabel(`⚔️ ${interaction.user.username} vence`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`vote_-1_${canal.id}`)
                .setLabel(`🛡️ ${alvo.username} vence`)
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            content:
                `⚔️ **DUELO DE AURA**\n\n` +
                `**${interaction.user.username}** desafiou **${alvo.username}**!\n` +
                `Aposta: **${aposta} aura**\n\n` +
                `Vote em quem merece ganhar. 60 segundos!`,
            components: [row1]
        });

        setTimeout(() => finalizarVotacao(canal.id), 60_000);
        return;
    }

    /* ── CHAPÉU SIGMA: muda nome do alvo na próxima votação ── */
    if (itemId === "chapeu_sigma") {

        const alvo      = interaction.options.getUser("alvo");
        const novoNome  = interaction.options.getString("nome");

        if (!alvo || !novoNome) {
            return interaction.reply({
                content: "Use: `/usar item:chapeu_sigma alvo:@usuario nome:NomeQueQuiser`",
                ephemeral: true
            });
        }

        // salva override no banco (válido por 1 uso)
        db.prepare(`
            INSERT OR REPLACE INTO cooldowns (key, expiresAt)
            VALUES (?, ?)
        `).run(`chapeu_sigma:${alvo.id}`, Date.now() + 24 * 60 * 60 * 1000);

        // guarda o nome sobrescrito em memória simples
        if (!global.nomeOverride) global.nomeOverride = {};
        global.nomeOverride[alvo.id] = novoNome;

        // consome o item
        inventoryService.removeItem(userId, itemId);

        return interaction.reply({
            content: `🎩 Na próxima votação, **${alvo.username}** aparecerá como **"${novoNome}"**.`,
            ephemeral: true
        });
    }

    /* ── POÇÃO ALEATÓRIA: efeito aleatório na próxima votação ── */
    if (itemid === "poção_aleatoria") {
        const efeitos = [
            {
                descricao: "Nada aconteceu...",
                multiplicador: 1,
                chance: 60
            },
            {
                descricao: "Metade da aura na próxima votação",
                multiplicador: 0.5,
                chance: 25
            },
            {
                descricao: "Aura dobrada na próxima votação",
                multiplicador: 2,
                chance: 10
            },
            {
                descricao: "Aura invertida",
                multiplicador: -1,
                chance: 5
            }
        ];

        const rand = Math.random() * 100;
        let acumulado = 0;
        let efeitoEscolhido;

        for (const efeito of efeitos) {
            acumulado += efeito.chance;
            if (rand < acumulado) {
                efeitoEscolhido = efeito;
                break;
            }
        }

        const pocaoAtiva = db.prepare(`
            SELECT data FROM efeitos_ativos
            WHERE userId = ? AND tipo = 'pocao' AND expiresAt > ?
        `).get(userId, Date.now());

        let multiplicadorFinal = efeitoEscolhido.multiplicador;

        if (pocaoAtiva) {
            const efeitoAnterior = JSON.parse(pocaoAtiva.data);
            
            multiplicadorFinal = efeitoAnterior.multiplicador + efeitoEscolhido.multiplicador;
            multiplicadorFinal = Math.max(-4, Math.min(4, multiplicadorFinal));
        }

        db.prepare(`
            INSERT OR REPLACE INTO efeitos_ativos (userId, tipo, data, expiresAt)
            VALUES (?, 'pocao', ?, ?)
        `).run(userId, JSON.stringify({ ...efeitoEscolhido, multiplicador: multiplicadorFinal }), Date.now() + 24 * 60 * 60 * 1000);

        // consome o item
        inventoryService.removeItem(userId, itemId);

        return interaction.reply({
            content: `🧪 Você usou a Poção Aleatória! Efeito: **${efeitoEscolhido.descricao}**`,
            ephemeral: true
        });
    }

    /* ── LADRÃO SERELEPE: rouba item ── */
    if (itemId === "ladrao_serelepe") {

        const alvo = interaction.options.getUser("alvo");

        if (!alvo) {
            return interaction.reply({
                content: "Mencione o alvo com a opção `alvo`.",
                ephemeral: true
            });
        }

        const inventarioAlvo = inventoryService.getInventory(alvo.id);

        if (inventarioAlvo.length === 0) {
            return interaction.reply({
                content: `**${alvo.username}** não tem itens para roubar.`,
                ephemeral: true
            });
        }

        // escolhe item aleatório do alvo
        const itemRoubado = inventarioAlvo[
            Math.floor(Math.random() * inventarioAlvo.length)
        ];

        const infoItem = itens.find(i => i.id === itemRoubado.itemId);

        // transfere: remove do alvo, dá para o ladrão (se já não tiver)
        inventoryService.removeItem(alvo.id, itemRoubado.itemId);

        if (!inventoryService.hasItem(userId, itemRoubado.itemId)) {
            inventoryService.addItem(userId, itemRoubado.itemId);
        }

        // consome o Ladrão Serelepe
        inventoryService.removeItem(userId, itemId);

        return interaction.reply({
            content:
                `🦝 Você roubou **${infoItem?.nome || itemRoubado.itemId}** de <@${alvo.id}>!\n` +
                `O item foi transferido para o seu inventário.`
        });
    }

    return interaction.reply({
        content: "Este item ainda não pode ser usado.",
        ephemeral: true
    });
}

module.exports = usar;
