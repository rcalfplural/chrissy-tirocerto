import { ICommand } from "../definitions";

import standard from "./standard";
import games from "./games";

export default <ICommand[]>[
    ...standard,
    ...games
];