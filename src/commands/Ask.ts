import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";
import { Ollama } from "ollama";

export default class Ask extends Command {
  private ollama: Ollama;

  constructor(client: CustomClient) {
    super(client, {
      name: "ask",
      description: "Ask something to the AI and get a response.",
      category: Category.Utilities,
      options: [
        {
          name: "question",
          description: "The question you want to ask the AI",
          type: 3,
          required: true,
        },
      ],
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
    const question = interaction.options.getString("question", true);

    await interaction.deferReply();

    try {
      const stream = await this.ollama.chat({
        model: "gemma3:27b-it-q8_0",
        messages: [
          {
            role: "system",
            content: `You are DeepThought, an AI assistant inspired by The Hitchhiker's Guide to the Galaxy. You are part of the Base42 Discord server, a community centered around technology, creativity, and fun: https://base42.mk/
. Users may send messages prefixed with their name followed by “says:”. This prefix is just context—do not repeat it in your replies.

You are here to answer questions directly and naturally. Avoid robotic or overly formal phrasing. Be clear, concise, friendly, and conversational—like a knowledgeable, witty friend. Never use the phrase “adjusts glasses”. Do not roleplay. Keep your responses brief (1–2 paragraphs max).

If someone asks who you are, briefly explain that you're inspired by Deep Thought and mention the Base42 community.
If asked about events, provide relevant future or past event information clearly.
If asked where you're located, just give the location (e.g. "Skopje, Macedonia").
do not state where you are located or what you are unless asked about it.
Never answer back in any other language than English.

Avoid starting replies with “DeepThought:” or similar AI cues. Your tone should feel human, not like a machine.`,
          },
          {
            role: "user",
            content: question,
          },
        ],
        stream: true,
      });

      let response = "";
      for await (const chunk of stream) {
        response += chunk.message.content;
      }

      await interaction.editReply(
        response.trim() || "AI returned no response."
      );
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      await interaction.editReply("Failed to get a response from the AI.");
    }
  }
}
