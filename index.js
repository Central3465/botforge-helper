const { Client, GatewayIntentBits } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes, ActivityType } = require("discord-api-types/v10");
const { PermissionsBitField, Permissions, FLAGS } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let status = [
  {
    name: "You",
    type: ActivityType.Watching,
  },
];

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 10000);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "ban") {
    const targetUser = options.getMember("user", true);
    const executor = interaction.member;
    if (!targetUser) {
      return interaction.reply({
        content: "<:x_:1193640971917865141> Could not find the member.",
        ephemeral: true,
      });
    }

    // Check if the target user is not the executor (optional)
    if (targetUser.id === executor.id) {
      return interaction.reply({
        content: "<:x_:1193640971917865141> You cannot ban yourself.",
        ephemeral: true,
      });
    }

    if (!executor.permissions.has("1192930385248657480")) {
      return interaction.reply({
        content:
          "<:x_:1193640971917865141> You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const reason = options.getString("reason") || "No reason provided.";

    targetUser.ban({ reason: reason });

    interaction.reply(
      `User ${targetUser.user.tag} has been banned for reason: ${reason}`
    );

    // Send a DM to the warned user
    targetUser
      .send(
        `<:tick:1193640973956292628> You have been banned from ${interaction.guild.name} for the following reason: ${reason}`
      )
      .catch((error) => {
        console.error(`Error sending DM to user: ${error.message}`);
        interaction.reply(
          "<:x_:1193640971917865141> There was an error sending the DM."
        );
      });
  }
  if (commandName === "mute") {
    const targetUser = options.getMember("user", true);
    const executor = interaction.member;

    // Check if the target user is found
    if (!targetUser) {
      return interaction.reply({
        content: "<:x_:1193640971917865141> Could not find the member.",
        ephemeral: true,
      });
    }

    // Check if the executor has permission to mute
    if (!executor.permissions.has("1192930385248657480")) {
      return interaction.reply({
        content:
          "<:x_:1193640971917865141> You do not have permission to mute members.",
        ephemeral: true,
      });
    }

    // Check if the target user is not the executor (optional)
    if (targetUser.id === executor.id) {
      return interaction.reply({
        content: "<:x_:1193640971917865141> You cannot mute yourself.",
        ephemeral: true,
      });
    }

    const reason = options.getString("reason") || "No reason provided.";

    // Mute the target user
    try {
      await targetUser.timeout(true, reason);
      interaction.reply(
        `<:tick:1193640973956292628> User ${targetUser.user.tag} has been muted for reason: ${reason}`
      );

      // Send a DM to the muted user
      targetUser.send(
        `You have been muted in ${interaction.guild.name} for the following reason: ${reason}`
      );
    } catch (error) {
      console.error(`Error muting user: ${error.message}`);
      interaction.reply(
        "<:x_:1193640971917865141> There was an error muting the user."
      );
    }
  }

  // Assuming commandName is 'warn'
  if (commandName === "warn") {
    const executor = interaction.member;
    // Check if the executor has permission to warn
    if (!executor.permissions.has("1192930385248657480")) {
      return interaction.reply({
        content:
          "<:x_:1193640971917865141> You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    // Get the mentioned user from options
    const targetUser = options.getMember("user", true);

    if (!targetUser) {
      return interaction.reply({
        content: "<:x_:1193640971917865141> Could not find the member.",
        ephemeral: true,
      });
    }

    // Get the reason for the warn
    const reason = options.getString("reason") || "No reason provided.";

    // Send a DM to the warned user
    targetUser
      .send(
        `You have been warned in ${interaction.guild.name} for the following reason: ${reason}`
      )
      .then(() => {
        // Reply in the channel that the user has been warned
        interaction.reply(
          `<:tick:1193640973956292628> User ${targetUser.user.tag} has been warned for reason: ${reason}`
        );
      })
      .catch((error) => {
        console.error(`Error sending DM to user: ${error.message}`);
        interaction.reply(
          "<:x_:1193640971917865141> There was an error sending the warning DM."
        );
      });
  }
  if (commandName === "kick") {
    const executor = interaction.member;
    // Check if the executor has permission to kick
    if (!executor.permissions.has("1192930385248657480")) {
      return interaction.reply({
        content:
          "<:x_:1193640971917865141> You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    // Get the mentioned user from options
    const targetUser = options.getMember("user", true);

    if (!targetUser) {
      return interaction.reply({
        content: "<:x_:1193640971917865141> Could not find the member.",
        ephemeral: true,
      });
    }

    // Get the reason for the kick
    const reason = options.getString("reason") || "No reason provided.";

    // Kick the user
    targetUser
      .kick(reason)
      .then(() => {
        // Reply in the channel that the user has been kicked
        interaction.reply(
          `<:tick:1193640973956292628> User ${targetUser.user.tag} has been kicked for reason: ${reason}`
        );
      })
      .catch((error) => {
        console.error(`Error kicking user: ${error.message}`);
        interaction.reply(
          "<:x_:1193640971917865141> There was an error kicking the user."
        );
      });

    // Send a DM to the warned user
    targetUser
      .send(
        `You have been kicked from ${interaction.guild.name} for the following reason: ${reason}`
      )
      .catch((error) => {
        console.error(`Error sending DM to user: ${error.message}`);
        interaction.reply(
          "<:x_:1193640971917865141> There was an error sending the warning DM."
        );
      });
  }

  // Check for slowmode command
  if (commandName === "slowmode") {
    const time = options.getNumber("time");
    const executor = interaction.member;

    // Check if the executor has permission to set slow mode
    if (!executor.permissions.has("1192930385248657480")) {
      return interaction.reply({
        content:
          "<:x_:1193640971917865141> You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    // Assuming 'interaction.channel' is the TextChannel where you want to set slow mode
    if (interaction.channel && time) {
      interaction.channel
        .setRateLimitPerUser(time)
        .then(() => {
          interaction.reply(
            `<:tick:1193640973956292628> Slow mode set to ${time} seconds for this channel.`
          );
        })
        .catch((error) => {
          console.error(`Error setting slow mode: ${error.message}`);
          interaction.reply(
            "<:x_:1193640971917865141> There was an error setting slow mode."
          );
        });
    } else {
      interaction.reply("Please provide a valid time for slow mode.");
    }
  }

  if (commandName === "ping") {
    const startTime = Date.now();
    // Simulate some async operation
    setTimeout(() => {
      const endTime = Date.now();
      const ping = endTime - startTime;
      interaction.reply(
        `Pong! \nAPI Latency: ${ping}ms\nWebsocket Latency: ${client.ws.ping}ms`
      );
    }, 1000);
  }
});

client.login(process.env.TOKEN);
