const { Client, PermissionFlagsBits, Collection, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { token, activities, rejectColor, ownerId } = require("./config.json");
const { writeFileSync, readdirSync } = require("fs");
const ms = require("ms");
const { join } = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.User
    ]
});

client.roles = require("./commands/roles.json") ?? [];
client.startTime = Date.now();
client.commands = new Collection();
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('js'));

for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
}

client.on('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    setBotActivity(client.user);

    client.roles.forEach(async (i) => {
        setTimeout(() => {
            if (i.underTimeout) {
                client.guilds.fetch(i.guildId).then(async (guild) => {
                    if (guild.available) {
                        guild.roles.fetch(i.roleId).then(async (role) => {
                            role.setMentionable(true);
                            i.underTimeout = false;
                            saveRolesCache();
                            console.log(`Role with ID [${i.roleId}] has been reset.`)
                        })
                    } else console.log(`${guild.name} [${guild.id}] is not available!`)
                })
            }
        }, ms('2s'));
    })
    
    setInterval(() => setBotActivity(client.user), 300000);
});

client.on('messageCreate', async (message) => {
    let roleMentions = message.mentions.roles;

    if (message.author == client.user || message.author.bot) return;

    if (!message.member.permissions.has(PermissionFlagsBits.MentionEveryone)) {
        roleMentions.forEach(async i => {
            client.roles.forEach(async j => {
                if (i.id == j.roleId) {
                    if (!j.underTimeout) {
                        j.underTimeout = true;
                        saveRolesCache();
                        startPingTimeout(i);
                    }
                }
            });
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    const args = [];

    if (!command) return;

    for (let option of interaction.options.data) {
        if (option.value) args[option.name] = option.value;
    }

    const embed = new EmbedBuilder()
        .setTitle("Command failed to execute!")
        .setDescription(`There was an error while executing this command!\nLet <@${ownerId}> know which command and **all** arguements used!`)
        .setColor(rejectColor)
        .setTimestamp();

    try {
        await command.execute(interaction, args)
    } catch (err) {
        console.error(err);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});

client.on('roleDelete', async (role) => {
    client.roles.forEach(async i => {
        if (i.roleId == role.id) {
            client.roles.splice(i, 1);
            saveRolesCache();

            console.log(`[${role.name}] was deleted on the server [${role.guild.id}]; therefore, it has been deleted from the registry.`);
        }
    })
});

client.on('error', error => {
    console.error(error)
});

async function startPingTimeout(role) {
    try {
        role.setMentionable(false);
        console.log(`${role.name} was mentioned.\nStarting timeout...`);

        client.roles.forEach(async (i) => {
            if (role.id == i.roleId) {
                setTimeout(async () => {
                    role.setMentionable(true);
                    i.underTimeout = false;
                    saveRolesCache();
                    console.log(`Timeout comepleted after ${ms(i.timeout, { long: true })}.`);
                }, i.timeout);
            };
        })
    } catch {
        console.log("Unable to start ping timeout!")
    }
}

function setBotActivity(clientUser) {
    let i = Math.floor(Math.random() * activities.length)
    clientUser.setActivity(activities[i].text, { type: activities[i].type });
}

function saveRolesCache() {
    writeFileSync('./commands/roles.json', JSON.stringify(client.roles, undefined, 4), (err) => {
        if (err) console.error(err)
    });
}

client.login(token);