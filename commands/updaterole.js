const roles = require("./roles.json") ?? [];
const { embedColor, rejectColor } = require("../config.json");
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ms = require("ms");
const { writeFileSync } = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("updaterole")
        .setDescription("Update an existing role in the registry.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles && PermissionFlagsBits.ManageGuild)
        .addRoleOption(option => option.setName("role")
            .setDescription("The role you want to update.")
            .setRequired(true))
        .addStringOption(option => option.setName("timeout")
            .setDescription("The new timout length. DEFAULT: 1h")
            .setRequired(true)),
    async execute(interaction, args) {
        let role = args.role;
        let timeout = args.timeout;
        let noChange = false;
        let oldTimeout;
        let newTimeout;

        if (roles.includes(role)) {
            embed.setTitle("Role Not in Registry!")
                .setDescription(`The role <@&${role}> was not in the registry.\nDid you choose the wrong role?`)
                .setColor(rejectColor)
                .setTimestamp();

            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        roles.forEach(async (i) => {
            if (i.roleId == role) {
                if (i.timeout != ms(timeout)) {
                    oldTimeout = i.timeout;
                    i.timeout = ms(timeout);
                    newTimeout = i.timeout;
                    saveRolesCache();
                } else {
                    oldTimeout = i.timeout;
                    noChange = true
                };
            }
        });

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTimestamp()

        if (!noChange) {
            embed.setTitle("Role updated!")
                .setDescription(`The timeout info for <@&${role}> has been updated.`)
                .addFields([
                    {
                        name: "> Role",
                        value: `<@&${role}>`,
                        inline: false
                    },
                    {
                        name: "> Old Timeout",
                        value: `${ms(oldTimeout, { long: true })}`,
                        inline: true
                    },
                    {
                        name: "> New Timeout",
                        value: `${ms(newTimeout, { long: true })}`,
                        inline: true
                    }
                ])
        } else {
            embed.setTitle("No change to role!")
                .setDescription(`No change for <@&${role}>.`)
                .addFields([
                    {
                        name: "> Role",
                        value: `<@&${role}>`,
                        inline: false
                    },
                    {
                        name: "> Timeout",
                        value: `${ms(oldTimeout, { long: true })}`,
                        inline: false
                    }
                ])
        }
        interaction.reply({ embeds: [embed] })
    }
}

function saveRolesCache() {
    writeFileSync('./commands/roles.json', JSON.stringify(roles, undefined, 4), (err) => {
        if (err) console.error(err)
    });
}
