const { REST } = require('@discordjs/rest');
const { Routes, ApplicationCommandOptionType} = require('discord-api-types/v10');
require('dotenv').config();

const commands = [
    {
        name: 'ping',
        description: 'Grabs your ping latency.',
    },
    {
        name: 'ban',
        description: 'Ban a user from the server.',
        options: [
            {
                name: 'user',
                description: 'The user to ban.',
                type: 6, // User type
                required: true,
            },
            {
                name: 'reason',
                description: 'Reason for banning the user.',
                type: 3, // String type
                required: false,
            },
        ],
    },
    {
        name: 'mute',
        description: 'Mute a user.',
        options: [
            {
                name: 'user',
                description: 'The user to mute.',
                type: 6, // User type
                required: true,
            },
        ],
    },
    {
        name: 'warn',
        description: 'Warn a user.',
        options: [
            {
                name: 'user',
                description: 'The user to warn.',
                type: 6, // User type
                required: true,
            },
            {
                name: 'reason',
                description: 'Reason',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ],
    },
    {
        name: 'kick',
        description: 'Kick a user from the server.',
        options: [
            {
                name: 'user',
                description: 'The user to kick.',
                type: 6, // User type
                required: true,
            },
            {
                name: 'reason',
                description: 'Reason for kicking the user.',
                type: 3, // String type
                required: false,
            },
        ],
    },
    {
        name: 'slowmode',
        description: 'Set slow mode for the channel.',
        options: [
            {
                name: 'time',
                description: 'Time duration for slow mode in seconds.',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const globalRoute = Routes.applicationCommands(process.env.CLIENT_ID);
        const guildRoute = Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);

        // Register global commands
        await rest.put(globalRoute, { body: commands });

        // Register guild-specific commands if GUILD_ID is defined
        if (process.env.GUILD_ID) {
            await rest.put(guildRoute, { body: commands });
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
