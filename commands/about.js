const { embedColor } = require("../config.json");
const { uptime, config } = require("process");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { version } = require("../package.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("What is P3 Timer?"),
    async execute(interaction, args) {
        let i = 0;
        interaction.client.roles.forEach(async j => i++);

        const embed = new EmbedBuilder()
            .setTitle(interaction.client.user.username)
            .setDescription(config.aboutText)
            .addFields([
                {
                    name: "> Current instance started at",
                    value: `<t:${Math.floor(interaction.client.startTime / 1000)}:F>`,
                    inline: true
                },
                {
                    name: "Instance Uptime",
                    value: getUptimeString(),
                    inline: true
                },
                {
                    name: "> Roles Overwatching",
                    value: `${i} role${i > 1 ? "s" : ""}`,
                    inline: false
                },
                {
                    name: "> Version",
                    value: `v${version}`,
                    inline: false
                }
            ])
            .setColor(embedColor)
            .setTimestamp()

        interaction.reply({ embeds: [embed] });
    }
}

function getUptimeString() {
    let lSecs = uptime();
    let lMins = Math.floor(lSecs / 60);
    let rSecs = lSecs - (lMins * 60) ?? 0;
    let lHrs = Math.floor(lMins / 60);
    let rMins = lMins - (lHrs * 60) ?? 0;
    let lDays = Math.floor(lHrs / 24);
    let rHrs = lHrs - (lDays * 24) ?? 0;

    let days = lDays > 0 ? `${lDays}day${lDays > 1 ? "s" : ""} ` : "";
    let hrs = rHrs > 0 ? `${rHrs}hr${rHrs > 1 ? "s" : ""} ` : "";
    let mins = rMins > 0 ? `${rMins}min${rMins > 1 ? "s" : ""} ` : "";

    return `${days}${hrs}${mins}${rSecs.toFixed(3)}sec${rSecs > 1 ? "s" : ""}`;
}