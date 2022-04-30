interface IAnimalTable {
    [key: number]: IAnimal;
};
interface IAnimal{
    name: string; emoji: string;
}
interface IBixoResultReturn{
    dezena: number;
    group: number;
    animal: IAnimal;
};

const table: IAnimalTable= {
    1: { name: "Avestruz", emoji: "<:ostrich:969994921358532609>"},
    2: { name: "Aguia", emoji: ""},
    3: { name: "Burro", emoji: "<:donkey:969995406106832906>"},
    4: { name: "Borboleta", emoji: ":butterfly:"},
    5: { name: "Cachorro", emoji: ":dog:"},
    6: { name: "Cabra", emoji: ":goat:"},
    7: { name: "Carneiro", emoji: ":sheep:"},
    8: { name: "Camelo", emoji: ":camel:"},
    9: { name: "Cobra", emoji: ":snake:"},
    10:{ name:  "Coelho", emoji: ":rabbit:"},
    11:{ name:  "Cavalo", emoji: ":horse:"},
    12:{ name:  "Elefante", emoji: ":elephant:"},
    13:{ name:  "Galo", emoji: ":rooster:"},
    14:{ name:  "Gato", emoji: ":cat:"},
    15:{ name:  "Jacare", emoji: ":crocodile:"},
    16:{ name:  "Leao", emoji: ":lion:"},
    17:{ name:  "Macaco", emoji: ":monkey:"},
    18:{ name:  "Porco", emoji: ":pig:"},
    19:{ name:  "Pavao", emoji: ":peacock:"},
    20:{ name:  "Peru", emoji: ":turkey:"},
    21:{ name:  "Touro", emoji: ":ox:"},
    22:{ name:  "Tigre", emoji: ":tiger:"},
    23:{ name:  "Urso", emoji: ":bear:"},
    24:{ name:  "Veado", emoji: ":deer:"},
    25:{ name:  "Vaca", emoji: ":cow:"}
};

function CalculateResult(dezena: number): IBixoResultReturn{
    let group: number = Math.ceil(dezena/4);
    if(group <= 0) group = 1;
    if(group >= 101) group = 100;
    const animal = table[group];

    return { dezena, group, animal };
}

export { CalculateResult, table, IBixoResultReturn, IAnimal };