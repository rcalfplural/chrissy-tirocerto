import { MessageEmbed, MessageActionRow, MessageButton, Message, ButtonInteraction } from "discord.js";
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
    turnOf: string | null;
    winners: string[];
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
const cardsPack: ICard[] = generateCards(cardsValue, types);

function choose(arr: Array<any>){
    const i = Math.floor(Math.random()*arr.length);

    const chosen = arr[i];
    return chosen;
}

/**
 * @param cards: ICard[] - array containing the cards possessed.
 * @description calculate the value of the hand.
 */
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
function updateEmbed(game: IGame, message: Message, gameOver: boolean = false): MessageEmbed{
    const embed = new MessageEmbed();
    embed.author = {name: `Blackack do ${message.author.username}`, iconURL: `${message.author.avatarURL()}`};
    
    if(gameOver){
        embed.setDescription("**Game Over**! Round winners: **"+game.winners.join(", ")+"**");
    }else{
        embed.setDescription("Turn of: "+game.players[`${game.turnOf}`].username);
    }
    for(let p in game.players){
        const player = game.players[p];
        const playerCardsRender: string[] = [];
        player.cards.map(c => playerCardsRender.push(`\`${c.type}${c.value}\``)); 
        const sufix: string = (player.busted)?"(Estourou)":"";
        embed.addField(player.username+sufix, `cards - ${playerCardsRender.join(" ")} \nTotal - \`${player.score}\``);
    }

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

function start(game: IGame, timer: NodeJS.Timer){
    clearInterval(timer);

    // first round
    for(let p in game.players){
        const player = game.players[p];
        const cardsToGive = (player.dealer)? 1: 2;

        for(let i = 0; i < cardsToGive; i++){
            const card = pickCard(cardsPack, game);
            game.pickedCards.push(card);
            player.cards.push(card);
        }

        player.score = cardValue(player.cards);
        if(!player.dealer && game.turnOf == null){
            game.turnOf = p;
        }
    }
}

function hit(game: IGame){
    const player = game.players[`${game.turnOf}`];
    const { cards } = player;

    const card = pickCard(cardsPack, game);
    game.pickedCards.push(card);
    cards.push(card);

    player.score = cardValue(cards);
}

function setTurnToNext(game: IGame): boolean{
    for(let p in game.players){
        const player = game.players[p];
        if(game.turnOf == p || player.stoped || player.busted) continue;

        game.turnOf = p;
    }

    const next = game.players[`${game.turnOf}`];
    if(next.dealer){
        while(next.score < 17){
            hit(game);
            if(next.score > 21){
                next.busted = true;
            }
        }
        return true;
    }
    return false;
}

function calculateFinalResults(game: IGame): string[]{
    const winners: string[] = [];
    const findDealer = () => {
        for(let p in game.players){
            const player = game.players[p];
            if(player.dealer) return player;
        }
    };
    const dealer = findDealer();

    for(let p in game.players){
        const player = game.players[p];
        if(!dealer || player.busted) continue;
        if(dealer.busted && player.score <= 21 || player.score >= dealer.score && !dealer.busted || player.score == 21){
            winners.push(player.username);
        }
    }

    return winners;
}

async function updateInteraction(interaction: ButtonInteraction, status: string, embed: MessageEmbed){

}


async function execution({ message }:ICommandParams){

    // game variables init
    let embed = new MessageEmbed();
    let components: MessageActionRow;
    let status: string = "Aguardando jogadores";
    let startTimer = 30000;
    let gameOver: boolean;
    let shouldUpdate: boolean = true;

    const timer = setInterval(()=>{
        startTimer -= 1000;
        if(startTimer <= 1000){
            console.log("Inciando jooj.");
            clearInterval(timer);
        }
    }, 1000);

    // game
    const game: IGame = {
        pickedCards: [],
        players: {},
        started: false,
        turnOf: null,
        winners: []
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
        time: 120000
    });

    collector.on("collect", interaction=>{
        interface IInteractions{
            [key: string]: Function;
        };
        const interactions: IInteractions= {
            "bj_hit": function(){
                if(interaction.user.id != game.turnOf) return;
                hit(game);
                // check game over
                if(game.players[interaction.user.id].score > 21){
                    game.players[interaction.user.id].busted = true;
                    gameOver = setTurnToNext(game);
                }
                if(game.players[interaction.user.id].score == 21){
                    gameOver = setTurnToNext(game);
                }
                embed = updateEmbed(game, message);
                shouldUpdate = true;
            },
            "bj_start": function(){
                if(interaction?.user?.id != message.author.id) return;

                game.started = true;
                start(game, timer);
                embed = updateEmbed(game, message);
                components = gameButtonsRow;
                status = "Jogo iniciado."
                shouldUpdate = true;
            },
            "bj_stand": function(){
                if(interaction.user.id != game.turnOf) return;
                // check game over
                game.players[interaction.user.id].stoped = true;
                gameOver = setTurnToNext(game);
                shouldUpdate = true;
                embed = updateEmbed(game, message);
            },
            "bj_cancel": function(){
                if(interaction.user.id != message.author.id) return;
                status = "Jogo cancelado";
                gameButtonsRow.components.map(c=>c.disabled=true);
                shouldUpdate = true;  
                components = gameButtonsRow;
            },
            "bj_join": async function(){
                if(game.started) return;
                if(interaction?.user?.id == message.author.id || game.players[interaction?.user?.id]){  
                    shouldUpdate = false;  
                    await interaction.reply({ content: "Você ja esta nessa partida.", ephemeral: true });
                    return;
                }

                game.players[interaction?.user?.id] = {
                    busted: false,
                    stoped: false,
                    dealer: false,
                    score: 0,
                    cards:[],
                    username: interaction?.user?.username
                };

                shouldUpdate = true; 
                embed = preStartEmbed(game, message);
                status = "Aguardando jogadores..."
                components = preStartButtonsRow;
            }
        };


        const interactionExecution = interactions[interaction.customId];
        interactionExecution();
        collector.resetTimer();
        if(gameOver){
            status = "Fim de jogo.";
            gameButtonsRow.components.map(c=>c.disabled=true);
            components = gameButtonsRow;
            game.winners = calculateFinalResults(game);
            embed = updateEmbed(game, message, gameOver);
        }
        if(shouldUpdate){
            interaction.update({ content: status, embeds: [embed], components: [components]  });
        }
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

