import { MessageEmbed } from "discord.js";
import { ICommand, ICommandParams } from "../../definitions";
import commands from "../index";

async function execution({ message }:ICommandParams){
    const embed = new MessageEmbed();

    embed.title = "Comandos";
    embed.setAuthor("CavaloBot Enterprises", "https://cdn.discordapp.com/avatars/723180465728520374/88b2b63045eeddd2fb07944ca4a4a5dd.png?size=2048");

    commands.map(command=>{
        const synonymous = command.synonymous? `\nSinonimos: ${command.synonymous.join(", ")}`:"";
        embed.addField(command.id, `${command.description}.${synonymous}`);
    });

    return message.reply({ content: "Listagem de comandos:", embeds: [embed] });
}

const command: ICommand = {
    id: "help",
    synonymous: ["ajuda", "socorro"],
    description: "Ayuda!",
    execution
};

export default command;

