import { ChatInputCommandInteraction } from "discord.js";
import Category from "../enums/Category";
import ICommand from "../interfaces/ICommand";
import CustomClient from "./CustomClient";
import ICommandOptions from "../interfaces/ICommandOptions";

export default class Command implements ICommand {
  client: CustomClient;
  name: string;
  description: string;
  category: Category;
  options: object;
  default_member_permission: bigint;
  dm_permission: Boolean;
  cooldown: number;

  constructor(client: CustomClient, options: ICommandOptions) {
    this.client = client;
    this.name = options.name;
    this.description = options.description;
    this.category = options.category;
    this.options = options.options;
    this.default_member_permission = options.default_member_permissions;
    this.dm_permission = options.dm_permission;
    this.cooldown = options.cooldown;
  }

  Execute(interaction: ChatInputCommandInteraction): void {}
  AutoComplete(interaction: ChatInputCommandInteraction): void {}
}
