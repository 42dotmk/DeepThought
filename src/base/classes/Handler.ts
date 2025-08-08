import IHandler from "../interfaces/IHandler";
import path from "path";
import { glob } from "glob";
import CustomClient from "./CustomClient";
import Event from "./Events";
import SubCommand from "./SubCommand";

export default class Handler implements IHandler {
  client: CustomClient;
  constructor(client: CustomClient) {
    this.client = client;
  }

  async LoadEvents() {
    const files = (await glob(`build/events/**/*.js`)).map((filePath) =>
      path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const event: Event = new (await import(file)).default(this.client);

      if (!event.name)
        return (
          delete require.cache[require.resolve(file)] &&
          console.log(`${file.split("/").pop()} does not have a name`)
        );
      const Execute = (...args: any) => event.Execute(...args);

      //@ts-ignore
      if (event.once) this.client.once(event.name, Execute);
      //@ts-ignore
      else this.client.on(event.name, Execute);

      return delete require.cache[require.resolve(file)];
    });
  }
  async LoadCommands() {
    const files = (await glob(`build/commands/**/*.js`)).map((filePath) =>
      path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const CommandClass = (await import(file)).default;
      const command = new CommandClass(this.client);

      if (!command.name) {
        delete require.cache[require.resolve(file)];
        console.log(`${file.split("/").pop()} does not have a name`);
        return;
      }

      if (command instanceof SubCommand) {
        this.client.Subcommands.set(command.name, command);
      } else {
        this.client.commands.set(command.name, command);
      }

      delete require.cache[require.resolve(file)];
    });
  }
}
