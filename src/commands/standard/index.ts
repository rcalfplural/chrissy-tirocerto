import { ICommand } from "../../definitions";
import ping from "./ping";
import help from "./help";

export default <ICommand[]>[
    ping,
    help
];