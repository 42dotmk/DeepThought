import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  Client,
} from "discord.js";

export default class GuildInfo {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  name = "info";
  description = "Get information about Base42";
  default_member_permissions = PermissionFlagsBits.UseApplicationCommands;
  cooldown = 3;
  dm_permission = false;

  async Execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.reply({
        content: "Unable to fetch server information.",
        ephemeral: true,
      });
    }

    const fetchedGuild = await this.client.guilds.fetch(guild.id);

    await fetchedGuild.channels.fetch();

    const iconURL = fetchedGuild.iconURL({ size: 1024 }) ?? undefined;

    const memberCount = fetchedGuild.memberCount
      ? fetchedGuild.memberCount.toLocaleString()
      : "Unknown";

    const channelCount = fetchedGuild.channels.cache.size;

    const embed = new EmbedBuilder()
      .setTitle("🏠 Base42 Server Info")
      .setURL("https://base42.mk/")
      .setColor(0x1abc9c)
      .setDescription(
        "Welcome to **Base42** — a hackerspace community based in Skopje, Macedonia. Learn, build, and share with fellow enthusiasts."
      )
      .addFields(
        {
          name: "📆 Created On",
          value: `<t:${Math.floor(fetchedGuild.createdTimestamp / 1000)}:D>`,
          inline: true,
        },
        {
          name: "👥 Members",
          value: memberCount,
          inline: true,
        },
        {
          name: "🧵 Channels",
          value: `${channelCount}`,
          inline: true,
        },
        {
          name: "📍 Location",
          value:
            "[Base42 Location](https://www.google.com/maps/place/Rimska+25,+Skopje+1000)",
          inline: true,
        },

        {
          name: "🔗 Website",
          value: "[base42.mk](https://base42.mk/)",
          inline: true,
        }
      )
      .setTimestamp();

    if (iconURL) {
      embed.setThumbnail(iconURL);
      embed.setFooter({ text: "Base42 Hackerspace", iconURL });
    } else {
      embed.setFooter({ text: "Base42 Hackerspace" });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
