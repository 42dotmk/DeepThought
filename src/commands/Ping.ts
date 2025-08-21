import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import { Ollama } from "ollama";

export default class Ping extends Command {
  private ollama: Ollama;

  constructor(client: CustomClient) {
    super(client, {
      name: "ping",
      description: "Replies with Pong! (from AI)",
      category: Category.Utilities,
      options: [],
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dm_permission: false,
      cooldown: 3,
    });

    this.ollama = new Ollama({
      host: client.config.ollamaUrl,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const stream = await this.ollama.chat({
        model: "gemma3:27b-it-q8_0",
        messages: [
          {
            role: "system",
            content:
              "Respond to the word 'ping' with a fun or clever 'pong!' response. Respond in plain text and in single line.",
          },
        ],
        stream: true,
      });

      let response = "";
      for await (const chunk of stream) {
        response += chunk.message.content;
      }

      await interaction.reply({
        content: response.trim(),
        ephemeral: false,
      });
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      await interaction.reply({
        content: "Failed to get a response from the AI.",
        ephemeral: false,
      });
    }
  }
}
