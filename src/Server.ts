import express from "express";
import expressWs from "express-ws";
import ws from "ws";

import { Controller } from "./Controller";
import { SocketMessage } from "./SocketMessage";

export class Server {
    private readonly app: expressWs.Application;
    private readonly webSocketServer: ws.Server;

    constructor(port: number, controller: Controller) {
        const expressWsInstance = expressWs(express());

        this.app = expressWsInstance.app;
        this.webSocketServer = expressWsInstance.getWss();

        this.app.use("/", express.static("frontend"));

        this.app.ws("/socket", ws => {
            controller.onSocketOpened(this.webSocketServer.clients.size, ws);

            ws.on("message", data => {
                try {
                    controller.onSocketMessage(JSON.parse(data.toString()));
                } catch (error) {}
            });

            ws.on("close", () => {
                controller.onSocketClosed(this.webSocketServer.clients.size);
            });
        });

        controller.initialize(this);

        this.app.listen(port, () =>
            console.log(`Application booted and listening on port ${port}`)
        );
    }

    broadcastMessage(messageObject: SocketMessage) {
        this.webSocketServer.clients.forEach(client => {
            client.send(JSON.stringify(messageObject), error => {});
        });
    }

    sendMessageToClient(client: ws, messageObject: SocketMessage) {
        if (this.webSocketServer.clients.has(client)) {
            client.send(JSON.stringify(messageObject), error => {});
        }
    }
}
