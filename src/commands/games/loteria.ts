import { ICommand, ICommandParams, ILotericaPayload } from "../../definitions";
import axios from "axios";
import Generate from "../../utils/embeds/Loterica";
import { CalculateResult } from "../../utils/Games/Bixo";

async function execution({ message }:ICommandParams){
    try{
        const { data } = await axios.get("https://servicebus2.caixa.gov.br/portaldeloterias/api/federal");
        const payload: ILotericaPayload = {
            dezenas: data.listaDezenas,
            gameDate: data.dataApuracao,
            gameNumber: data.numero,
            gameType: data.tipoJogo
        };

        const embed = Generate(payload);

        for(let i = 1; i <= 100; i++){
            CalculateResult(i);
        }

        return message.channel.send({ embeds: [embed] });
    }catch(err: any){
        console.error(err);
    }
}

const command: ICommand = {
    id: "loteria",
    description: "Resultado loteria.",
    execution
};

export default command;