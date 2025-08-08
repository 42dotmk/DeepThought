import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import IConfig from "../interfaces/IConfig";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import * as dotenv from "dotenv";

export default class CustomClient extends Client implements ICustomClient {
  handler: Handler;
  config: IConfig;
  commands: Collection<string, Command>;
  Subcommands: Collection<string, SubCommand>;
  cooldowns: Collection<string, Collection<string, number>>;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
      ],
    });

    // Load environment variables
    dotenv.config();

    this.config = {
      token: process.env.DISCORD_TOKEN!,
      discordClientId: process.env.DISCORD_CLIENT_ID!,
      guildId: process.env.GUILD_ID!,
      googleApiKey: process.env.GOOGLE_API_KEY!,
    };
    this.handler = new Handler(this);
    this.commands = new Collection();
    this.Subcommands = new Collection();
    this.cooldowns = new Collection();
  }

  async init() {
    try {
      await this.LoadHandlers();
      await this.login(this.config.token);
    } catch (error) {
      console.error(error);
    }
  }

  async LoadHandlers(): Promise<void> {
    await this.handler.LoadEvents();
    await this.handler.LoadCommands();
  }
}
