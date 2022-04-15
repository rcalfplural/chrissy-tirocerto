import { MessageEmbed, MessageActionRow, MessageButton, Message } from "discord.js";
import { ICommand, ICommandParams } from "../../definitions";

interface ICard{
    type: string;
    value: string;
};

interface IGamePlayers{
    username: string;
    cards: ICard[];
    score: number;
    busted: boolean;
    stoped: boolean;
    dealer: boolean;
}
interface IGame{
    started: boolean;
    pickedCards: ICard[];
    players: {
        [key:string]:IGamePlayers
    };
};


const cardsValue: string[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Q", "J", "K"];
const types: string[] = ["♣", "♠", "♦", "♥"];
function generateCards(vals: string[], types: string[]): ICard[]{
    const used: ICard[] = [];
    for(let type of types){
        for(let value of vals){
            used.push({ type, value })
        }
    }
    return used;
}
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

    if(game.pickedCards.includes(card)){
        return pickCard(cards, game);
    }

    return card;
}

// embeds
function updateEmbed(game: IGame, message: Message): MessageEmbed{
    const embed = new MessageEmbed();
    embed.author = {name: `Blackack do ${message.author.username}`, iconURL: `${message.author.avatarURL()}`};
    // const {playerCards, dealerCards} = game;
    // const playerCardsRender: string[] = [];
    // const dealerCardsRender: string[] = [];
    // playerCards.map(card =>{
    //     playerCardsRender.push(`\`${card.type}${card.value}\``);
    // });
    // dealerCards.map(card=>{
    //     dealerCardsRender.push(`\`${card.type}${card.value}\``);
    // });
    // game.playerScore = cardValue(playerCards);
    // game.dealerScore = cardValue(dealerCards);
    // embed.addField("Player", `cards - ${playerCardsRender.join(" ")} \nTotal - \`${game.playerScore}\``);
    // embed.addField("Dealer", `cards - ${dealerCardsRender.join(" ")} \nTotal - \`${game.dealerScore}\``, true);

    return embed;
}

function preStartEmbed(game: IGame, message: Message): MessageEmbed{
    const embed = new MessageEmbed();
    embed.author = {name: `Blackack do ${message.author.username}`, iconURL: `${message.author.avatarURL()}`};
    let playersList: string = "";

    for(let p in game.players){
        const player = game.players[p];
        playersList += `${player.username}\n`;
    }

    embed.addField("Players: ", playersList);

    return embed;
}

function hit(cards: ICard[], game: IGame, player: string | undefined = undefined){
    
}

async function execution({ message }:ICommandParams){

    // game variables init
    const cards: ICard[] = generateCards(cardsValue, types);
    const card = <ICard>choose(cards);
    let embed = new MessageEmbed();
    let components: MessageActionRow;
    let status: string = "Aguardando jogadores";
    let startTimer = 30000;

    const timer = setInterval(()=>{
        startTimer -= 1000;
        if(startTimer <= 1000){
            console.log("Hora de iniciar o jogo");
        }
    }, 1000);

    // game
    const game: IGame = {
        pickedCards: [],
        players: {},
        started: false
    };

    game.players["dealer"] = {
        username: "Dealer",
        cards: [],
        stoped: false,
        busted: false,
        score: 0,
        dealer: true
    };
    game.players[message.author.id] = {
        username: message.author.username,
        cards: [],
        stoped: false,
        busted: false,
        score: 0,
        dealer: false
    };


    // first round 
    embed = preStartEmbed(game, message);

    // embed
    


    // buttons and collector
    const gameButtonsRow = new MessageActionRow();
    const preStartButtonsRow = new MessageActionRow();

    // BUTTONS MENU
    gameButtonsRow.addComponents([
        new MessageButton({ customId: "bj_hit", style: "PRIMARY", label: "Desce" }),
        new MessageButton({ customId: "bj_stand", style: "PRIMARY", label: "Chega" }),
        new MessageButton({ customId: "bj_cancel", style: "DANGER", label: "Larga mão" })
    ]);

    preStartButtonsRow.addComponents([
        new MessageButton({ customId: "bj_start", style: "SUCCESS", label: "Start" }),
        new MessageButton({ customId: "bj_join", style: "PRIMARY", label: "Join" }),
        new MessageButton({ customId: "bj_cancel", style: "DANGER", label: "Larga mão" })
    ]);
    components = preStartButtonsRow;
    // EMBED MENUS

    // COLLECTOR
    const msg = await message.channel.send({ content: "Aguardando jogadores...", embeds: [embed], components: [components] });
    const collector = msg.createMessageComponentCollector({
        componentType: "BUTTON",
        time: 30000
    });

    collector.on("collect", interaction=>{
        interface IInteractions{
            [key: string]: Function;
        };
        const interactions: IInteractions= {
            "bj_hit": function(){
                hit(cards, game);
                embed = updateEmbed(game, message);
                // check game over
                if(game.players[interaction.user.id].score > 21){
                    gameButtonsRow.components.map(comp=>comp.setDisabled(true));
                    components = gameButtonsRow;
                    status = "Fim de Jogo."
                }
            },
            "bj_start": function(){
                if(interaction?.user?.id != message.author.id) return;

                game.started = true;
                embed = updateEmbed(game, message);
                components = gameButtonsRow;
                status = "Jogo iniciado."
            },
            "bj_stand": function(){
                interaction?.channel?.send("Player esperou!");
            },
            "bj_cancel": function(){
                interaction?.channel?.send("Player largou de mao!");
            },
            "bj_join": async function(){
                if(interaction?.user?.id == message.author.id || game.players[interaction?.user?.id]){  
                    if(interaction.replied){
                        return await interaction?.followUp({ content: "Voce ja esta no jogo!", ephemeral: true });
                    }
                    await interaction.reply({ content: "Voce ja esta no jogo!", ephemeral: true });
                }

                game.players[interaction?.user?.id] = {
                    busted: false,
                    stoped: false,
                    dealer: false,
                    score: 0,
                    cards:[],
                    username: interaction?.user?.username
                };

                embed = preStartEmbed(game, message);
                status = "Aguardando jogadores..."
                components = preStartButtonsRow;
            }
        };


        const interactionExecution = interactions[interaction.customId];
        interactionExecution();
        interaction.update({ content: status, embeds: [embed], components: [components]  });
    });
    collector.on("end", interaction=>{
        if(!game.started){
            console.log("Pre start timout ended. Starting now.");
            game.started = true;
            collector.resetTimer({ time: 3000, idle: 3000 });
            return
        }
        console.log("BOOOB");
        gameButtonsRow.components.map(comp=>comp.setDisabled(true));
        msg.edit({ content: "Acabou o tempo", embeds: [embed], components: [gameButtonsRow] });
    });
}

const command: ICommand = {
    id: "blackjack",
    synonymous: ["bj", "21"],
    description: "Jogo de blackjack do pepe.",
    execution
};

export default command;

