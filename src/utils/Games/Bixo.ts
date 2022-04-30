interface IAnimalTable {
    [key: number]: string;
};
interface IBixoResultReturn{
    dezena: number;
    group: number;
    animal: string;
};

const table: IAnimalTable= {
    1: "Avestruz",
    2: "Aguia",
    3: "Burro",
    4: "Borboleta",
    5: "Cachorro",
    6: "Cabra",
    7: "Carneiro",
    8: "Camelo",
    9: "Cobra",
    10: "Coelho",
    11: "Cavalo",
    12: "Elefante",
    13: "Galo",
    14: "Gato",
    15: "Jacare",
    16: "Leao",
    17: "Macaco",
    18: "Porco",
    19: "Pavao",
    20: "Peru",
    21: "Touro",
    22: "Tigre",
    23: "Urso",
    24: "Veado",
    25: "Vaca"
};

function CalculateResult(dezena: number): IBixoResultReturn{
    let group: number = Math.ceil(dezena/4);
    if(group <= 0) group = 1;
    if(group >= 101) group = 100;
    const animal = table[group];

    return { dezena, group, animal };
}

export { CalculateResult, table, IBixoResultReturn };