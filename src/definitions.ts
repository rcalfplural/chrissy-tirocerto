import { Client, Message } from "discord.js";

interface ICommandExecution{
    ({ args, message, client}: ICommandParams): Promise<any>;
}
export interface ICommand{
    id: string;
    synonymous?: string[];
    description: string;
    execution: ICommandExecution;
};

export interface ICommandParams {
    client: Client;
    message: Message;
    args: string[];
};


// LOTERIA
export interface ILotericaPayload{
    gameType: string;
    gameNumber: number;
    gameDate: string;
    dezenas: string[];
};