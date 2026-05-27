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
    let bonus = 0;
    let mensagem_bonus = "";

    if (result.ganho === 67) {
        mensagem_bonus = "**BÔNUS DE SORTE!** 🎉\n Você ganhou + 1000 aura pelo 67!\n";
        bonus = 1000;
    }
    const ganho  = result.ganho + bonus;

    userService.addAura(userid, ganho);

    return interaction.reply({
        content:
            mensagem_bonus + 
            `🌟 Você coletou **+${ganho} aura** hoje!\n` +
            `Volte amanhã para mais.`
    });
}

module.exports = farmar;
