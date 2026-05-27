const userService = require("../services/userService");

async function farmar(interaction) {
    const result = userService.claimDaily(interaction.user.id);

    if (!result.success) {
        return interaction.reply({
            content:
                `⏳ Você já coletou sua aura diária.\n` +
                `Volte em **${result.horas}h ${result.minutos}m**.`,
            ephemeral: true
        });
    }

    const userid = interaction.user.id;
    const ganho  = result.ganho;

    userService.addAura(userid, ganho);

    return interaction.reply({
        content:
            `🌟 Você coletou **+${result.ganho} aura** hoje!\n` +
            `Volte amanhã para mais.`
    });
}

module.exports = farmar;
