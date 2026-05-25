require("dotenv").config();

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [

    new SlashCommandBuilder()
        .setName("info")
        .setDescription("Informações sobre o bot"),

    new SlashCommandBuilder()
        .setName("perfil")
        .setDescription("Perfil de aura de um usuário")
        .addUserOption(o => o.setName("usuario").setDescription("Usuário").setRequired(false)),

    new SlashCommandBuilder()
        .setName("votar")
        .setDescription("Inicia uma votação de aura")
        .addUserOption(o => o.setName("usuario").setDescription("Alvo").setRequired(true)),

    new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Top 10 aura"),

    new SlashCommandBuilder()
        .setName("loja")
        .setDescription("Loja de itens"),

    new SlashCommandBuilder()
        .setName("inventario")
        .setDescription("Seu inventário de itens"),

    new SlashCommandBuilder()
        .setName("diario")
        .setDescription("Colete sua aura diária (50~150 aura)"),

    new SlashCommandBuilder()
        .setName("usar")
        .setDescription("Usa um item do inventário")
        .addStringOption(o =>
            o.setName("item")
             .setDescription("ID do item")
             .setRequired(true)
             .addChoices(
                 { name: "⚔️ Espada Lendária (duelo)",         value: "espada_lendaria" },
                 { name: "🎩 Chapéu Sigma (mudar nome)",        value: "chapeu_sigma"    },
                 { name: "🦝 Ladrão Serelepe (roubar item)",    value: "ladrao_serelepe" }
             )
        )
        .addUserOption(o =>
            o.setName("alvo")
             .setDescription("Alvo do item (Espada / Chapéu / Ladrão)")
             .setRequired(false)
        )
        .addStringOption(o =>
            o.setName("nome")
             .setDescription("Novo nome (Chapéu Sigma)")
             .setRequired(false)
        )
        .addIntegerOption(o =>
            o.setName("aposta")
             .setDescription("Aura apostada no duelo (padrão 100)")
             .setRequired(false)
             .setMinValue(10)
        ),

].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registrando comandos...");
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );
        console.log("Comandos registrados com sucesso.");
    } catch (err) {
        console.error(err);
    }
})();
