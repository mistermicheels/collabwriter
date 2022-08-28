import { Server } from "./Server";
import { Controller } from "./Controller";
import { SuggestedWordsGenerator } from "./SuggestedWordsGenerator";
import { TextTracker } from "./TextTracker";
import { VotesTracker } from "./VotesTracker";
import { VotingClock } from "./VotingClock";
import { TextStorage } from "./TextStorage";

init();

async function init() {
    const port = determinePort();
    const postgresUrl = determinePostgresUrl();
    const enablePostgresSsl = determinePostgresSsl();

    const suggestedWordsGenerator = new SuggestedWordsGenerator();
    const textTracker = new TextTracker();
    const votesTracker = new VotesTracker();
    const votingClock = new VotingClock();
    const server = new Server(port);

    let textStorage: TextStorage = undefined;

    if (postgresUrl) {
        textStorage = new TextStorage(postgresUrl, enablePostgresSsl);
    } else {
        console.log(`Running without persistent storage`);
    }

    const controller = new Controller(
        suggestedWordsGenerator,
        textStorage,
        textTracker,
        votesTracker,
        votingClock,
        server
    );

    controller.initialize();
}

function determinePort() {
    if (process.env.PORT) {
        return parseInt(process.env.PORT);
    } else {
        return 3000;
    }
}

function determinePostgresUrl() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    } else {
        return undefined;
    }
}

function determinePostgresSsl() {
    if (!process.env.DATABASE_SSL) {
        return true;
    } else if (process.env.DATABASE_SSL === "true") {
        return true;
    } else if (process.env.DATABASE_SSL === "false") {
        return false;
    } else {
        throw new Error("Unexpected value for environment variable DATABASE_SSL");
    }
}
