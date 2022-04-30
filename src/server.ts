import { Client, Intents, TextChannel } from "discord.js";
import { config } from "dotenv";
import cron from "node-cron";
import axios from "axios";

import commands from "./commands";
import { ILotericaPayload } from "./definitions";
import Generate from "./utils/embeds/Loterica";

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES ] });

config();
const prefix = "chris";

client.login(process.env.TOKEN);
client.on("ready", async c=>{
    client.user?.setActivity({ type: "PLAYING", name: "BJ with Chrissy Tiro-Certo"});
    console.log("Chrissy Tiro certo pronto pro jogo.");

    cron.schedule("00 00 19 */1 * WED,SAT 2022", async ()=>{
        const channel = client.channels.cache.find(channel => (<TextChannel>channel).id == "869922145835307019");
        const { data } = await axios.get("https://servicebus2.caixa.gov.br/portaldeloterias/api/federal");
        const payload: ILotericaPayload = {
            dezenas: data.listaDezenas,
            gameDate: data.dataApuracao,
            gameNumber: data.numero,
            gameType: data.tipoJogo
        };

        const embed = Generate(payload);

        (channel as TextChannel)?.send({ embeds: [embed] });
        const now = Date.now();
        const date = new Date(now);
        console.log(date);
    },{
            timezone: "America/Sao_Paulo",
            scheduled: true
    });

});

client.on("messageCreate", async (message)=>{
    const messageParts = message.content.split(" ");
    if(message.author.bot || messageParts.shift()?.toLocaleLowerCase() != prefix) return;
    const commandId = messageParts.shift();
    const command = commands.find(cmd=>cmd.id == commandId || cmd.synonymous?.includes(<string>commandId));
    
    if(!command) return;

    try{
        command.execution({ args: messageParts, client, message });
    }catch(err: any){
        console.error(err);
        await message.reply("Deu erro la meu querido");
        return;
    }
});