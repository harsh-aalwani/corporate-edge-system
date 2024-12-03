import { Client, GatewayIntentBits } from 'discord.js';
import { BOT_TOKEN, DISCORD_CHANNEL_ID } from './config.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,  // For sending messages
    ],
});

client.once('ready', () => {
    console.log('Bot is online!');
});

client.login(BOT_TOKEN);

// Function to send the announcement
export const sendAnnouncement = async (title, message) => {
    try {
        const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
        if (channel) {
            channel.send({
                embeds: [
                    {
                        title: title,
                        description: message,
                        color: 5814783, // Customize embed color
                    },
                ],
            });
            console.log("Announcement sent successfully!");
        } else {
            console.log("Channel not found.");
        }
    } catch (error) {
        console.error("Error sending announcement:", error.message);
    }
};
