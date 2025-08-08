import { Collection } from "discord.js";
import Command from "../classes/Command";
import IConfig from "./IConfig";
import SubCommand from "../classes/SubCommand";

export default interface ICustomClient {
  config: IConfig;
  commands: Collection<string, Command>;
  Subcommands: Collection<string, SubCommand>;
  cooldowns: Collection<string, Collection<string, number>>;

  init(): void;
  LoadHandlers(): void;
}
