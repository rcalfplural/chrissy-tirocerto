import { MessageEmbed } from "discord.js";
import { ILotericaPayload } from "../../definitions";
import { CalculateResult } from "../Games/Bixo";

function Generate({ dezenas, gameDate, gameType, gameNumber }:ILotericaPayload): MessageEmbed{
    const embed = new MessageEmbed();

    embed.setTitle(`Resultado ${gameType.replace("_", " ")} nº ${gameNumber} - ${gameDate}`);
    embed.addField("Dezenas Sorteadas: ", `**1º** - ${dezenas[0]}\n**2º** - ${dezenas[1]}\n**3º** - ${dezenas[2]}\n**4º** - ${dezenas[3]}\n**5º** - ${dezenas[4]}`);

    const resultsBixo: string[] = [];
    dezenas.map(dez=>{
        resultsBixo.push(CalculateResult(Number(dez.toString().slice(-2))).animal);
    }); 
    embed.addField(`Jogo do Bixo Federal`, `**1º** - ${resultsBixo[0]} (cabeça)\n**2º** - ${resultsBixo[1]}\n**3º** - ${resultsBixo[2]}\n**4º** - ${resultsBixo[3]}\n**5º** - ${resultsBixo[4]}\n`);

    return embed;
}

export default Generate;