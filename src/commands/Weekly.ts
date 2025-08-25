import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  EmbedBuilder,
} from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import axios from "axios";
import { CALENDAR_ID } from "../base/constants/Calendar";
import { getCountdown } from "../base/utilities/Calendar";

export default class WeeklyEvents extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "weeklyevents",
      description: "Shows events for the next 7 days",
      category: Category.Utilities,
      options: [],
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dm_permission: false,
      cooldown: 3,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const apiKey = this.client.config.googleApiKey;
    const now = new Date();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events?key=${apiKey}&timeMin=${now.toISOString()}&timeMax=${endDate.toISOString()}&singleEvents=true&orderBy=startTime`;

    try {
      const res = await axios.get(url);
      const events = res.data.items ?? [];

      if (events.length === 0) {
        await interaction.reply({
          content: "📭 No events found in the next 7 days.",
          ephemeral: true,
        });
        return;
      }

      const eventBlocks = events.map((event: any) => {
        const start = event.start?.dateTime || event.start?.date;
        const dateObj = start ? new Date(start) : null;

        const title = event.summary?.trim() || "(No Title)";
        const date = dateObj
          ? dateObj.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          : "Unknown date";
        const time = dateObj
          ? dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Unknown time";
        const countdown = dateObj ? getCountdown(dateObj) : "";

        return (
          "```" +
          `📌 ${title}\n` +
          `📅 ${date}\n` +
          `⏰ ${time}\n` +
          `${countdown}` +
          "```"
        );
      });

      const embed = new EmbedBuilder()
        .setTitle("📅 Weekly Events (Next 7 Days)")
        .setDescription(
          eventBlocks.join("\n") +
            "\n\n🌐 Book an event 👉 https://base42.mk/events"
        )
        .setColor("#2b2d31")
        .setFooter({ text: "Google Calendar Events" })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (err: any) {
      console.error("❌ Error fetching weekly events:", err.message || err);

      await interaction.reply({
        content: "⚠️ Failed to fetch weekly events. Please try again later.",
        ephemeral: true,
      });
    }
  }
}

