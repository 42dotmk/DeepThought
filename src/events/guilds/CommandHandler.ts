import {
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  Events,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";
import Command from "../../base/classes/Command";
import SubCommand from "../../base/classes/SubCommand";

export default class CommandHandler extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.InteractionCreate,
      description: "Command handler event",
      once: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command: Command | undefined = this.client.commands.get(
      interaction.commandName
    );

    console.log(command);
    if (!command) {
      await interaction.reply({
        content: "❌ This command does not exist!",
        ephemeral: true,
      });
      this.client.commands.delete(interaction.commandName);
      return;
    }

    const { cooldowns } = this.client;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        (timestamps.get(interaction.user.id) || 0) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                `❌ Please wait another \`${timeLeft}\` seconds to use this command again.`
              ),
          ],
          ephemeral: true,
        });
        return;
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      const subCommandGroup = interaction.options.getSubcommandGroup(false);
      const subCommand = interaction.options.getSubcommand(false);

      const fullSubCommandName = [
        interaction.commandName,
        subCommandGroup,
        subCommand,
      ]
        .filter(Boolean)
        .join(".");

      const subcommandInstance =
        this.client.Subcommands.get(fullSubCommandName);

      if (subcommandInstance && subcommandInstance instanceof SubCommand) {
        return subcommandInstance.Execute(interaction);
      }

      return command.Execute(interaction);
    } catch (ex) {
      console.error("❌ Error while executing command:", ex);
      await interaction.reply({
        content: "An error occurred while executing the command.",
        ephemeral: true,
      });
    }
  }
}
