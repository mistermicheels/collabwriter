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
    const redisUrl = determineRedisUrl();
    const postgresUrl = determinePostgresUrl();
    const enablePostgresSsl = determinePostgresSsl();

    const suggestedWordsGenerator = new SuggestedWordsGenerator();
    const textStorage = new TextStorage(redisUrl, postgresUrl, enablePostgresSsl);
    const textTracker = new TextTracker();
    const votesTracker = new VotesTracker();
    const votingClock = new VotingClock();
    const server = new Server(port);

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

function determineRedisUrl() {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    } else {
        return "redis://localhost:6379";
    }
}

function determinePostgresUrl() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    } else {
        return "postgresql://postgres:admin@localhost:5432/collabwriter";
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
