const { embedColor, rejectColor } = require("../config.json");
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { writeFileSync } = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removerole")
        .setDescription("Remove a role for the bot enable pinging.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles && PermissionFlagsBits.ManageGuild)
        .addRoleOption(option => option.setName("role")
            .setDescription("The role you want to remove.")
            .setRequired(true)),
    async execute(interaction, args) {

        let role = args.role;
        const embed = new EmbedBuilder();
        let theRole;
        let index = 0;
        let inRoles = false;
        for (let blob of interaction.client.roles) {
            if (blob.roleId == role) {
                inRoles = true;
                theRole = blob;
                index = interaction.client.roles.indexOf(blob);
                break;
            }
        }

        if (!inRoles) {
            embed.setTitle("Role Not in Registry!")
                .setDescription(`The role <@&${role}> was not in the registry.\nDid you choose the wrong role?`)
                .setColor(rejectColor)
                .setTimestamp();

            interaction.reply({ embeds: [reject], ephemeral: true });
            return;
        }

        interaction.client.roles.splice(index, 1);
        saveRolesCache(interaction.client.roles);

        var guildRole = await interaction.guild.roles.fetch(role);
        if (!guildRole.mentionable) guildRole.setMentionable(true);

        embed.setTitle("Role removed!")
            .addFields(
                {
                    name: "> Role:",
                    value: `<@&${role}>`,
                    inline: false
                }
            )
            .setColor(embedColor)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
}

function saveRolesCache(roles) {
    writeFileSync('./commands/roles.json', JSON.stringify(roles, undefined, 4), (err) => {
        if (err) console.error(err)
    });
}
