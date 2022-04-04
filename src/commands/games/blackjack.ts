import { MessageEmbed, MessageActionRow, MessageButton, Message } from "discord.js";
import { ICommand, ICommandParams } from "../../definitions";

interface ICard{
    type: string;
    value: string;
};

interface IGame{
    playerScore: number;
    dealerScore: number;
    playerCards: ICard[];
    dealerCards: ICard[];
    status: "PLAYING" | "IDLE" | "ENDED";
};

function generateCards(vals: string[], types: string[]): ICard[]{
    const used: ICard[] = [];
    for(let type of types){
        for(let value of vals){
            used.push({ type, value })
        }
    }
    return used;
}

const cardsValue: string[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Q", "J", "K"];
const types: string[] = ["♣", "♠", "♦", "♥"];
function choose(arr: Array<any>){
    const i = Math.floor(Math.random()*arr.length-1);

    const chosen = arr[i]
    return chosen;
}

function cardValue(cards: ICard[]){
    let total = 0;

    cards.map(card=>{
        const index = cardsValue.indexOf(card.value);
        const val = (index + 1 >= 10)? 10 : index+1;

        total += val;
    });

    return total;
}

function pickCard(cards: ICard[], game: IGame): ICard{
    const card = choose(cards);

    if(game.dealerCards.includes(card) || game.playerCards.includes(card)){
        return pickCard(cards, game);
    }

    return card;
}
function updateEmbed(game: IGame, message: Message): MessageEmbed{
    const embed = new MessageEmbed();
    embed.author = {name: `Blackack do ${message.author.username}`, iconURL: `${message.author.avatarURL()}`};
    const {playerCards, dealerCards} = game;
    const playerCardsRender: string[] = [];
    const dealerCardsRender: string[] = [];
    playerCards.map(card =>{
        playerCardsRender.push(`\`${card.type}${card.value}\``);
    });
    dealerCards.map(card=>{
        dealerCardsRender.push(`\`${card.type}${card.value}\``);
    });
    game.playerScore = cardValue(playerCards);
    game.dealerScore = cardValue(dealerCards);
    embed.addField("Player", `cards - ${playerCardsRender.join(" ")} \nTotal - \`${game.playerScore}\``);
    embed.addField("Dealer", `cards - ${dealerCardsRender.join(" ")} \nTotal - \`${game.dealerScore}\``, true);

    return embed;
}
function hit(cards: ICard[], game: IGame){
    game.playerCards.push(pickCard(cards, game));
    game.playerScore = cardValue(game.playerCards);
}

async function execution({ message }:ICommandParams){

    // game variables init
    const cards: ICard[] = generateCards(cardsValue, types);
    const card = <ICard>choose(cards);
    let embed = new MessageEmbed();
    
    // game
    const game: IGame = {
        playerCards: [],
        playerScore: 0,
        dealerCards: [],
        dealerScore: 0,
        status: "IDLE"
    };

    game.playerCards.push(pickCard(cards, game));
    game.dealerCards.push(pickCard(cards, game));
    // first round 
    embed = updateEmbed(game, message);

    // embed
    


    // buttons and collector
    const buttonsRow = new MessageActionRow();
    buttonsRow.addComponents([
        new MessageButton({ customId: "bj_hit", style: "PRIMARY", label: "Desce" }),
        new MessageButton({ customId: "bj_stand", style: "PRIMARY", label: "Chega" }),
        new MessageButton({ customId: "bj_cancel", style: "PRIMARY", label: "Larga mão" })
    ]);
    const msg = await message.channel.send({ embeds: [embed], components: [buttonsRow] });
    const collector = msg.createMessageComponentCollector({
        componentType: "BUTTON",
        time: 30000
    });

    collector.on("collect", interaction=>{
        if(interaction.user.id != message.author.id) return;

        interface IInteractions{
            [key: string]: Function;
        };
        const interactions: IInteractions= {
            "bj_hit": function(){
                hit(cards, game);
                embed = updateEmbed(game, message);
                // check game over
                if(game.playerScore > 21){
                    buttonsRow.components.map(comp=>comp.setDisabled(true));
                    msg.edit({ content: "Fim de Jogo.", embeds: [embed], components: [buttonsRow] })
                }
            },
            "bj_stand": function(){
                interaction?.channel?.send("Player esperou!");
            },
            "bj_cancel": function(){
                interaction?.channel?.send("Player largou de mao!");
            },
        };


        const interactionExecution = interactions[interaction.customId];
        interactionExecution();
        interaction.update({ embeds: [embed], components: [buttonsRow]  });
    });
    collector.on("end", interaction=>{
        buttonsRow.components.map(comp=>comp.setDisabled(true));
        msg.edit({ content: "Acabou o tempo", embeds: [embed], components: [buttonsRow] })
    });
}

const command: ICommand = {
    id: "blackjack",
    synonymous: ["bj", "21"],
    description: "Jogo de blackjack do pepe.",
    execution
};

export default command;

