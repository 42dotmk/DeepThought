import { ChatInputCommandInteraction } from "discord.js";
import ISubCommand from "../interfaces/ISubCommand";
import CustomClient from "./CustomClient";

export default class SubCommand implements ISubCommand {
  client: CustomClient;
  name: string;

  constructor(client: CustomClient, options: ISubCommand) {
    this.client = client;
    this.name = options.name;
  }

  Execute(interaction: ChatInputCommandInteraction): void {}
}
