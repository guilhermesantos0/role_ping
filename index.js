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
        description: "Add a role for the bot to disable pinging!",
        options: [
            {
                name: "role",
                type: Discord.ApplicationCommandOptionType.Role,
                required: true,
                description: "The role you want to add!"
            },
            {
                name: "timeout",
                type: Discord.ApplicationCommandOptionType.String,
                required: true,
                description: "The timout to disable the role pinging!"
            }
        ],
        run: async(interaction, args) => {

            let role = args.role
            let timeout = ms(args.timeout)

            let newRole = {
                timeout: timeout,
                roleId: role,
                guildId: interaction.guild.id
            }

            roles.push(newRole)
            rolePingManager(newRole)
            saveRolesCache()

            const embed = new Discord.EmbedBuilder()
            .setTitle("Role added!")
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
            .setColor(config.embedColor)
            .setTimestamp()

            interaction.reply({ embeds: [embed] })

            let guildRoles = await interaction.guild.roles.fetch()
            let disableRole = guildRoles.get(role)

            disableRole.setMentionable(false)

        }
    },
    {
        name: "removerole",
        type: Discord.ApplicationCommandType.ChatInput,
        description: "Remove a role for the bot enable pinging!",
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
            roles.forEach(async i => {
                if(i.roleId == role){

                    
                    const embed = new Discord.EmbedBuilder()
                    .setTitle("Role removed!")
                    .addFields(
                        {
                            name: "> Role:",
                            value: `<@&${role}>`,
                            inline: false
                        }
                    )
                    .setColor(config.embedColor)
                    .setTimestamp()

                    roles.splice(i,1)
                    saveRolesCache()

                    interaction.reply({ embeds: [embed] })

                    let guildRoles = await interaction.guild.roles.fetch()
                    let disableRole = guildRoles.get(role)

                    disableRole.setMentionable(true)
                }
                j++
            })
        }
    }
]

client.on('ready', async() => {

    await client.application.commands.set(commands)
    console.log(`${client.user.tag} is online!`)

    let willSave = false
    let i = 0
    setInterval(() => {
        client.user.setActivity(`${config.activities[i].text}`, { type: config.activities[i].type })
        i == config.activities.length - 1 ? i = 0 : i++

        if(willSave) saveRolesCache()

        willSave = !willSave
    },5000)

    roles.forEach(async i => {
        rolePingManager(i)
    })
})

client.on('messageCreate', async(message) => {
    let roleMentions = message.mentions.roles
    roleMentions.forEach(async i => {
        
        let newRole = {
            timeout: ms(config.defaultTimeout),
            roleId: i.id,
            guildId: message.guild.id
        }

        roles.push(newRole)
        rolePingManager(newRole)
        saveRolesCache()

        let guildChannels = await message.guild.channels.fetch()
        let channel = guildChannels.get(config.logsChannel[message.guild.id])

        const embed = new Discord.EmbedBuilder()
        .setTitle("Role added")
        .addFields(
            {
                name: "> Role:",
                value: `<@&${i.id}>`,
                inline: false
            },
            {
                name: "> Timeout:",
                value: `${ms(ms(config.defaultTimeout), { long: true })}`
            }
        )
        .setColor(config.embedColor)
        .setTimestamp()

        i.setMentionable(false)

        if(channel) channel.send({ embeds: [embed] })
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

async function rolePingManager(pingRole) {
    setInterval(async () => {
        if(pingRole.timeout <= 0){
            let guild = client.guilds.cache.get(pingRole.guildId)
            
            let guildRoles = await guild.roles.fetch()
            let role = guildRoles.get(pingRole.roleId)

            console.log(role)

            role.setMentionable(true)

            let index = roles.indexOf(pingRole)
            
            const embed = new Discord.EmbedBuilder()
            .setTitle("Role removed")
            .addFields(
                {
                    name: "> Role:",
                    value: `<@&${pingRole.roleId}>`,
                    inline: false
                }
            )
            .setColor(config.embedColor)
            .setTimestamp()

            let guildChannels = await guild.channels.fetch()
            let channel = guildChannels.get(config.logsChannel)

            if(channel) channel.send({ embeds: [embed] })

            roles.splice(index, 1)
            saveRolesCache()
        } else{
            pingRole.timeout -= 1000
        }
    },1000)
}

function saveRolesCache(){
    fs.writeFile(
        './roles.json',
        JSON.stringify(roles), 
        function(err) {if(err) console.log(err)}
    )
}

client.login(config.token)
