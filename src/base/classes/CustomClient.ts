import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import IConfig from "../interfaces/IConfig";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";

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

    this.config = require(`${process.cwd()}/data/config.json`);
    this.handler = new Handler(this);
    this.commands = new Collection();
    this.Subcommands = new Collection();
    this.cooldowns = new Collection();
  }

  async init() {
    try {
      await this.LoadHandlers();
      await this.login(this.config.token);
      console.log("Test Bot is now ready!");
    } catch (error) {
      console.error(error);
    }
  }

  async LoadHandlers(): Promise<void> {
    await this.handler.LoadEvents();
    await this.handler.LoadCommands();
  }
}
