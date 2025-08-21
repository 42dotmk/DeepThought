import {
  ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import { Ollama } from "ollama";

export default class Summarize extends Command {
  private ollama: Ollama;

  constructor(client: CustomClient) {
    super(client, {
      name: "summarize",
      description: "Summarizes the last 5 messages in this channel.",
      category: Category.Utilities,
      options: [],
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dm_permission: false,
      cooldown: 5,
    });

    this.ollama = new Ollama({
      host: client.config.ollamaUrl,
    });
  }

 async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const channel = interaction.channel;
  if (!channel?.isTextBased()) {
    await interaction.reply({
      content: "This command can only be used in text channels.",
      ephemeral: true,
    });
    return;
  }

  try {
    const fetched = await channel.messages.fetch({ limit: 15 });

    console.log("[Summarize] Fetched messages count:", fetched.size);
    const userMessages = fetched
      .filter((msg) => !msg.author.bot)
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .toJSON()
      .slice(-5);

    console.log("[Summarize] Filtered messages count:", userMessages.length);
    userMessages.forEach((msg, i) => {
      console.log(`[Summarize] #${i + 1}: ${msg.author.username}: "${msg.content}" | Attachments: ${msg.attachments.size}`);
    });

    if (userMessages.length === 0) {
      await interaction.reply({
        content: "No user messages to summarize.",
        ephemeral: true,
      });
      return;
    }

    const combinedMessages = userMessages
      .map((msg) => {
        const content =
          msg.content.trim() ||
          (msg.attachments.size > 0 ? "[Attachment]" : "[Empty]");
        return `${msg.author.username}: ${content}`;
      })
      .join("\n");

    console.log("[Summarize] Combined prompt for AI:\n", combinedMessages);

    await interaction.deferReply();

    const stream = await this.ollama.chat({
      model: "gemma3:27b-it-q8_0",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes Discord conversations into a concise paragraph.",
        },
        {
          role: "user",
          content: combinedMessages,
        },
      ],
      stream: true,
    });

    let response = "";
    for await (const chunk of stream) {
      response += chunk.message.content;
    }

    console.log("[Summarize] AI response:", response);

    await interaction.editReply({
      content: response.trim() || "The AI returned an empty response.",
    });
  } catch (error) {
    console.error("Error summarizing messages:", error);
    await interaction.reply({
      content: "Failed to summarize the messages.",
      ephemeral: true,
    });
  }
  
}

 }

