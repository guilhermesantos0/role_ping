const { embedColor, rejectColor } = require("../config.json");
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ms = require("ms");
const { writeFileSync } = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addrole")
        .setDescription("Add a role for the bot to disable pinging.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles && PermissionFlagsBits.ManageGuild)
        .addRoleOption(option => option.setName("role")
            .setDescription("The role you want to add.")
            .setRequired(true))
        .addStringOption(option => option.setName("timeout")
            .setDescription("The timout to disable the role pinging. DEFAULT: 1h")),
    async execute(interaction, args) {

        let role = args.role;
        let timeout = ms(args.timeout ?? "1h");

        let newRole = {
            timeout: timeout,
            roleId: role,
            guildId: interaction.guild.id,
            underTimeout: false
        };

        var inRoles = false;
        var roleInfo;
        const embed = new EmbedBuilder();

        if (interaction.client.roles != undefined) {
            interaction.client.roles.forEach(async i => {
                if (newRole.roleId == i.roleId) {
                    inRoles = true;
                    roleInfo = i;
                };
            });
        }

        if (!inRoles) {
            let theRole = await interaction.guild.roles.fetch(role);
            let botRole = await interaction.guild.roles.botRoleFor(interaction.client.user);

            if (theRole.comparePositionTo(botRole) > 0) {
                embed.setTitle("Cannot add role!")
                    .setDescription(`I cannot modify <@&${role}>!\nIn order for me to be able to modify this role, you must put my role [<@&${botRole.id}>] higher than <@&${role}>.`)
                    .setColor(rejectColor)
                    .setTimestamp()
                interaction.reply({ embeds: [embed], ephemeral: true })
                return;
            }

            if (!theRole.mentionable) {
                embed.setTitle("Role not emntionable!")
                    .setDescription(`The role <@&${role}> is not mentionable! Please set it to be mentionable before calling this command!`)
                    .setColor(rejectColor)
                    .setTimestamp()
                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            interaction.client.roles.push(newRole);
            saveRolesCache(interaction.client.roles);

            embed.setTitle("Role added!")
                .addFields(
                    {
                        name: "> Role:",
                        value: `<@&${role}>`,
                        inline: false
                    },
                    {
                        name: "> Timeout:",
                        value: `${ms(timeout, { long: true })}`,
                        inline: true
                    }
                )
                .setColor(embedColor)
                .setTimestamp();

            interaction.reply({ embeds: [embed] });

        } else {
            embed.setTitle(`Wait a second...`)
                .setDescription(`<@&${role}> is already in the registry!\nIf you want to modify the timeout, use the \`/updaterole\` command.\n\nCurrent setting for <@&${roleInfo.roleId}> is ${ms(roleInfo.timeout, { long: true })}`)
                .setColor(rejectColor)
                .setTimestamp();
            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}

function saveRolesCache(roles) {
    writeFileSync('./commands/roles.json', JSON.stringify(roles, undefined, 4), (err) => {
        if (err) console.error(err)
    });
}
