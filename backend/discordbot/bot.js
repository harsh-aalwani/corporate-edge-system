import { Client, GatewayIntentBits } from "discord.js";
import { BOT_TOKEN, DISCORD_CHANNEL_ID } from "../config.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, // For sending messages
    ],
});

client.once("ready", () => {
    console.log("✅ Bot is online!");
});

client.login(BOT_TOKEN);

/**
 * Sends an announcement to the Discord channel.
 * @param {string} title - The title of the announcement.
 * @param {string} description - The announcement description.
 */
export const sendAnnouncement = async (title, description) => {
    try {
        const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error("❌ Channel not found.");
            return;
        }

        // Ensure title is bold and uppercase
        const formattedTitle = `**${title.toUpperCase()}**`;

        // Send the formatted announcement
        await channel.send({
            embeds: [
                {
                    title: formattedTitle,
                    description: description,
                    color: 5814783, // Customize embed color
                    timestamp: new Date().toISOString(),
                },
            ],
        });

        console.log("✅ Announcement sent successfully!");
    } catch (error) {
        console.error("❌ Error sending announcement:", error.message);
    }
};
