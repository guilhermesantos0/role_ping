const Discord = require('discord.js');
const config = require("./config.json");
const roles = require("./roles.json");
const fs = require("fs");
const ms = require('ms');

const client = new Discord.Client({ 
    intents: [
        Discord.GatewayIntentBits.Guilds, 
        Discord.GatewayIntentBits.GuildMembers, 
        Discord.GatewayIntentBits.DirectMessages, 
        Discord.GatewayIntentBits.GuildMessages, 
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates
    ], 
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.Message,
        Discord.Partials.User
    ]
});

const commands = [
    {
        name: "addrole",
        type: Discord.ApplicationCommandType.ChatInput,
        description: "Add a role for the bot to ping!",
        options: [
            {
                name: "role",
                type: Discord.ApplicationCommandOptionType.Role,
                required: true,
                description: "The role you want to add!"
            },
            {
                name: "channel",
                type: Discord.ApplicationCommandOptionType.Channel,
                required: true,
                description: "The channel that the role will be pingged!"
            },
            {
                name: "timeout",
                type: Discord.ApplicationCommandOptionType.String,
                required: true,
                description: "The timout to ping the role!"
            }
        ],
        run: async(interaction, args) => {

            let role = args.role
            let channel = args.channel
            let timeout = ms(args.timeout)

            let newRole = {
                timeout: timeout,
                roleId: role,
                guildId: interaction.guild.id,
                channelId: channel
            }

            roles.push(newRole)
            startRolePing(newRole)

            fs.writeFile(
                './roles.json',
                JSON.stringify(roles), 
                function(err) {if(err) console.log(err)}
            )

            const embed = new Discord.EmbedBuilder()
            .setTitle("Role added!")
            .addFields(
                {
                    name: "> Role:",
                    value: `<@&${role}>`,
                    inline: false
                },
                {
                    name: "> Channel:",
                    value: `<#${channel}>`,
                    inline: false
                },
                {
                    name: "> Timeout:",
                    value: `${ms(timeout, { long: true })}!`,
                    inline: false
                }
            )
            .setColor(config.embedColor)

            interaction.reply({ embeds: [embed] })
        }
    },
    {
        name: "removerole",
        type: Discord.ApplicationCommandType.ChatInput,
        description: "Remove a role for the bot to ping!",
        options: [
            {
                name: "role",
                type: Discord.ApplicationCommandOptionType.Role,
                required: true,
                description: "The role you want to remove!"
            }
        ],
        run: async(interaction, args) => {

            let role = args.role

            let j = 0;
            roles.forEach(i => {
                if(i.roleId == role.id){

                    
                    const embed = new Discord.EmbedBuilder()
                    .setTitle("Role removed!")
                    .addFields(
                        {
                            name: "> Role:",
                            value: `<@&${role}>`,
                            inline: false
                        },
                        {
                            name: "> Channel:",
                            value: `<#${i.channelId}>`
                        }
                    )
                    .setColor(config.embedColor)

                    roles.splice(i,1)
                    fs.writeFile(
                        './roles.json',
                        JSON.stringify(roles), 
                        function(err) {if(err) console.log(err)}
                    )

                    interaction.reply({ embeds: [embed] })
                }
                j++
            })
        }
    }
]

client.on('ready', async() => {

    await client.application.commands.set(commands)
    console.log(`${client.user.tag} is online!`)

    let i = 0
    setInterval(() => {
        client.user.setActivity(`${config.activities[i].text}`, { type: config.activities[i].type })
        i == config.activities.length - 1 ? i = 0 : i++
    },5000)

    roles.forEach(async i => {
        startRolePing(i)
    })
})

client.on('interactionCreate', async(interaction) => {
    if (interaction.type == Discord.InteractionType.ApplicationCommand) {
        const args = [];
        
        for (let option of interaction.options.data) {
            if (option.value) args[option.name] = option.value;
            
        }
        
        commands.forEach(c => {
            if(c.name == interaction.commandName){
                return c.run(interaction, args);
            }
        })
    }
})

async function startRolePing(pingRole) {
    setInterval(async () => {
        console.log(pingRole)
        let guild = client.guilds.cache.get(pingRole.guildId)

        let guildChannels = await guild.channels.fetch()
        let channel = guildChannels.get(pingRole.channelId)

        let guildRoles = await guild.roles.fetch()
        let role = guildRoles.get(pingRole.roleId)

        if(channel && role){
            channel.send(`<@&${pingRole.roleId}>`)
        }
    },pingRole.timeout)
}

client.login(config.token)