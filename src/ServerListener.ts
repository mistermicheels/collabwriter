import ws from "ws";

import { SocketMessage } from "./SocketMessage";

export interface ServerListener {
    onSocketOpened(currentNumberSockets: number, client: ws): void;
    onSocketClosed(currentNumberSockets: number): void;
    onSocketMessage(message: SocketMessage): void;
}
