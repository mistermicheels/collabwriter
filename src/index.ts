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

    const suggestedWordsGenerator = new SuggestedWordsGenerator();

    const textTracker = new TextTracker(new TextStorage(redisUrl));
    await textTracker.initializeFromStorage();

    const votesTracker = new VotesTracker();
    const votingClock = new VotingClock();

    const controller = new Controller(
        suggestedWordsGenerator,
        textTracker,
        votesTracker,
        votingClock
    );

    const server = new Server(port);

    controller.initialize(server);
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
