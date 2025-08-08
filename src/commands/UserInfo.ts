import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  Client,
  GuildMemberRoleManager,
} from "discord.js";

export default class UserInfo {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  name = "userinfo";
  description = "Get info about a user";
  default_member_permissions = PermissionFlagsBits.UseApplicationCommands;
  cooldown = 3;
  dm_permission = false;

  async Execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    const member = interaction.member;

    const avatarURL = user.displayAvatarURL({ size: 1024 }) ?? undefined;

    let joinedAt = "Unknown";
    let roles = "None";

    if (member && "joinedAt" in member && member.joinedAt) {
      joinedAt = `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:D>`;
    }

    if (
      member &&
      "roles" in member &&
      member.roles instanceof GuildMemberRoleManager
    ) {
      roles = member.roles.cache
        .filter((role) => role.name !== "@everyone")
        .map((role) => role.name)
        .join(", ");

      if (!roles) roles = "None";
    }

    const embed = new EmbedBuilder()
      .setTitle(`👤 User Info — ${user.username}`)
      .setColor(0x3498db)
      .setThumbnail(avatarURL)
      .addFields(
        {
          name: "🆔 User ID",
          value: user.id,
          inline: true,
        },
        {
          name: "📛 Username",
          value: user.tag,
          inline: true,
        },
        {
          name: "🗓 Account Created",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
          inline: true,
        },
        {
          name: "📅 Joined Server",
          value: joinedAt,
          inline: true,
        },
        {
          name: "🛡 Roles",
          value: roles,
          inline: false,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
