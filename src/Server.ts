import express from "express";
import expressWs from "express-ws";
import ws from "ws";

import { SocketMessage } from "./SocketMessage";
import { ServerListener } from "./ServerListener";

export class Server {
    private webSocketServer: ws.Server;

    constructor(private readonly port: number) {}

    initialize(listener: ServerListener) {
        const expressWsInstance = expressWs(express());
        this.webSocketServer = expressWsInstance.getWss();

        const app = expressWsInstance.app;

        app.use("/", express.static("frontend"));

        app.ws("/socket", client => {
            listener.onSocketOpened(this.webSocketServer.clients.size, client);

            client.on("message", data => {
                try {
                    listener.onSocketMessage(JSON.parse(data.toString()));
                } catch (error) {}
            });

            client.on("close", () => {
                listener.onSocketClosed(this.webSocketServer.clients.size);
            });
        });

        app.listen(this.port, () =>
            console.log(`Application booted and listening on port ${this.port}`)
        );
    }

    broadcastMessage(messageObject: SocketMessage) {
        this.checkInitialized();

        this.webSocketServer.clients.forEach(client => {
            client.send(JSON.stringify(messageObject), error => {});
        });
    }

    private checkInitialized() {
        if (!this.webSocketServer) {
            throw new Error("Server not initialized yet");
        }
    }

    sendMessageToClient(client: ws, messageObject: SocketMessage) {
        this.checkInitialized();

        if (this.webSocketServer.clients.has(client)) {
            client.send(JSON.stringify(messageObject), error => {});
        }
    }
}
