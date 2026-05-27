require("dotenv").config();

const express = require("express");
const app = express();

const db = require("./database");

const { Client, GatewayIntentBits, Events } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const buttonHandler = require("./handlers/buttonHandler");

const commands = {
    info:        require("./commands/info"),
    perfil:      require("./commands/perfil"),
    leaderboard: require("./commands/leaderboard"),
    loja:        require("./commands/loja"),
    votar:       require("./commands/votar"),
    inventario:  require("./commands/inventario"),
    diario:      require("./commands/diario"),
    usar:        require("./commands/usar"),
};

client.once(Events.ClientReady, c => {
    console.log(`Bot online: ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isChatInputCommand()) {
        const command = commands[interaction.commandName];
        if (command) return command(interaction);
    }

    if (interaction.isButton()) {
        return buttonHandler(interaction);
    }
});

client.login(process.env.TOKEN);
