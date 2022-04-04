import { Client, Intents } from "discord.js";
import { config } from "dotenv";

import commands from "./commands";

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES ] });

config();
const prefix = "chris";

client.login(process.env.TOKEN);
client.on("ready", c=>{
    client.user?.setActivity({ type: "PLAYING", name: "BJ with Chrissy Tiro-Certo"});
    console.log("Chrissy Tiro certo pronto pro jogo.");
});

client.on("messageCreate", (message)=>{
    const messageParts = message.content.split(" ");
    if(message.author.bot || messageParts.shift()?.toLocaleLowerCase() != prefix) return;
    const commandId = messageParts.shift();
    const command = commands.find(cmd=>cmd.id == commandId || cmd.synonymous?.includes(<string>commandId));
    
    if(!command) return;

    command.execution({ args: messageParts, client, message });
});