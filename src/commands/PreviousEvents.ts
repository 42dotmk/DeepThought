import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import axios from "axios";
import { formatEventsTable } from "../base/utilities/Calendar";
import { CALENDAR_ID } from "../base/constants/Calendar";

export default class PastEvents extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "pastevents",
      description: "Shows events from the past 30 days",
      category: Category.Utilities,
      options: [],
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dm_permission: false,
      cooldown: 3,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30 days ago
    const apiKey = this.client.config.googleApiKey;

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events?key=${apiKey}&timeMin=${startDate.toISOString()}&timeMax=${now.toISOString()}&singleEvents=true&orderBy=startTime`;

    try {
      const res = await axios.get(url);
      const events = res.data.items || [];

      if (events.length === 0) {
        await interaction.reply({
          content: "No events found in the past 30 days.",
          ephemeral: true,
        });
        return;
      }

      const formattedEvents = events.map((event: any) => {
        const start = event.start?.dateTime || event.start?.date;
        const dateObj = start ? new Date(start) : null;

        return {
          title: event.summary?.trim() || "(No Title)",
          date:
            dateObj?.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }) || "Unknown date",
          time:
            dateObj?.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }) || "Unknown time",
          countdown: "⏳ Event ended",
        };
      });

      const table = formatEventsTable(
        formattedEvents,
        "📅 Past Events (Last 30 Days)"
      );

      await interaction.reply({
        content: table,
        ephemeral: true,
      });
    } catch (err) {
      console.error("❌ Error fetching past events:", err);
      await interaction.reply({
        content: "Failed to fetch past events.",
        ephemeral: true,
      });
    }
  }
}
