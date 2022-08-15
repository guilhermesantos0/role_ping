const { embedColor, rejectColor, ownerId, memberDeny } = require("../config.json");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { writeFileSync } = require("fs");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shutdown")
        .setDescription("Shutdown the bot."),
    async execute(interaction, args) {
        const embed = new EmbedBuilder();
        if (interaction.user.id != ownerId) {
            embed.setImage(memberDeny)
                .setTimestamp()
                .setColor(rejectColor);
            interaction.reply({ embeds: [embed] })
            return;
        }

        embed.setTitle('Shutting down the bot, TTYL!')
            .setColor(embedColor)
            .setTimestamp();
        interaction.reply({ embeds: [embed], ephemeral: true });
        saveRolesCache(interaction.client.roles);
        setTimeout(() => {
            interaction.client.destroy();
            throw new Error("Shutdown command called.");
        }, ms("10s"));
    }
}

function saveRolesCache(roles) {
    writeFileSync('./commands/roles.json', JSON.stringify(roles, undefined, 4), (err) => {
        if (err) console.error(err)
    });
}
