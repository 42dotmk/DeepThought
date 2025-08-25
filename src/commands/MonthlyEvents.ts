import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import axios from "axios";
import { CALENDAR_ID } from "../base/constants/Calendar";
import { formatEventsTable, getCountdown } from "../base/utilities/Calendar";

export default class MonthlyEvents extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "monthlyevents",
      description: "Shows events for the next 30 days",
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
    const apiKey = this.client.config.googleApiKey;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events?key=${apiKey}&timeMin=${now.toISOString()}&timeMax=${endDate.toISOString()}&singleEvents=true&orderBy=startTime`;

    try {
      const res = await axios.get(url);
      const events = res.data.items || [];

      if (events.length === 0) {
        await interaction.reply({
          content: "No events found in the next 30 days.",
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
          countdown: dateObj ? getCountdown(dateObj) : "",
        };
      });

      const table = formatEventsTable(
        formattedEvents,
        "📅 Monthly Events (Next 30 Days)"
      );

      await interaction.reply({
        content: table,
        ephemeral: true,
      });
    } catch (err) {
      console.error("❌ Error fetching monthly events:", err);
      await interaction.reply({
        content: "Failed to fetch monthly events.",
        ephemeral: true,
      });
    }
  }
}
