import express from "express";
import expressWs from "express-ws";

import { Server } from "./Server";
import { Controller } from "./Controller";
import { SuggestedWordsGenerator } from "./SuggestedWordsGenerator";
import { TextTracker } from "./TextTracker";
import { VotesTracker } from "./VotesTracker";
import { VotingClock } from "./VotingClock";

const controller = new Controller(new SuggestedWordsGenerator(), new TextTracker(), new VotesTracker(), new VotingClock());

let port = 3000;

if (process.env.PORT) {
    port = parseInt(process.env.PORT);
}

new Server(port, controller);