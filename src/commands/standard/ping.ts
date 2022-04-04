import { ICommand, ICommandParams } from "../../definitions";

async function execution({ message, args }:ICommandParams){
    console.log(args);
    return message.channel.send("IPHONE :thumbsup:");
}

const command: ICommand = {
    id: "ping",
    synonymous: ["pingpong", "oi", "teste"],
    description: "Ping Pong thing",
    execution
};

export default command;