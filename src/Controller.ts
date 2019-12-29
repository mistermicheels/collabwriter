import ws from "ws";

import {
    SocketMessage,
    isIncomingVoteMessage,
    OutgoingResetMessage,
    OutgoingTickMessage,
    OutgoingNewVoteMessage,
    OutgoingLastVoteMessage
} from "./SocketMessage";
import { Server } from "./Server";
import { VoteResult, VotesTracker } from "./VotesTracker";
import { TextTracker } from "./TextTracker";
import { SuggestedWordsGenerator } from "./SuggestedWordsGenerator";
import { VotingClock } from "./VotingClock";

export class Controller {
    private readonly suggestedWordsGenerator: SuggestedWordsGenerator;
    private readonly textTracker: TextTracker;
    private readonly votesTracker: VotesTracker;
    private readonly votingClock: VotingClock;

    private server: Server;
    private activeUsers: number;

    private fullText: string;
    private lastVoteResult: VoteResult;

    private newWordChoices: string[];
    private voteNumber: number;
    private percentVotingTimePassed: number;

    private newSuggestedWordsPromise: Promise<string[]>;

    constructor(
        suggestedWordsGenerator: SuggestedWordsGenerator,
        textTracker: TextTracker,
        votesTracker: VotesTracker,
        votingClock: VotingClock
    ) {
        this.suggestedWordsGenerator = suggestedWordsGenerator;
        this.textTracker = textTracker;
        this.votesTracker = votesTracker;
        this.votingClock = votingClock;

        this.votingClock.setController(this);
    }

    async initialize(server: Server) {
        this.server = server;
        this.activeUsers = 0;

        this.fullText = this.textTracker.getFullText();
        this.lastVoteResult = this.votesTracker.getVoteResult();

        this.startNewSuggestedWordsGeneration();
        await this.startNewVote();
    }

    private startNewSuggestedWordsGeneration() {
        this.newSuggestedWordsPromise = this.suggestedWordsGenerator.getSuggestedWords(
            this.textTracker.getLastWord(),
            this.textTracker.getLastActualWord()
        );
    }

    private async startNewVote() {
        this.newWordChoices = await this.newSuggestedWordsPromise;

        this.votesTracker.startNewVote(this.newWordChoices);
        this.voteNumber = this.votesTracker.getCurrentVoteNumber();

        this.votingClock.resetTickCount();
        this.votingClock.tick();
        this.percentVotingTimePassed = 0;

        const message: OutgoingNewVoteMessage = {
            type: "newVote",
            newWordChoices: this.newWordChoices,
            voteNumber: this.voteNumber,
            percentVotingTimePassed: this.percentVotingTimePassed,
            activeUsers: this.activeUsers
        };

        this.server.broadcastMessage(message);
    }

    onSocketOpened(currentNumberSockets: number, client: ws) {
        this.activeUsers = currentNumberSockets;

        const resetMessage: OutgoingResetMessage = {
            type: "reset",
            fullText: this.fullText,
            selectedLastRound: this.lastVoteResult.selectedWord,
            selectedLastRoundVotes: this.lastVoteResult.selectedWordVotes,
            lastRoundTotalVotes: this.lastVoteResult.totalVotes,
            newWordChoices: this.newWordChoices,
            voteNumber: this.voteNumber,
            percentVotingTimePassed: this.percentVotingTimePassed,
            activeUsers: this.activeUsers
        };

        this.server.sendMessageToClient(client, resetMessage);
    }

    onSocketClosed(currentNumberSockets: number) {
        this.activeUsers = currentNumberSockets;
    }

    onSocketMessage(message: SocketMessage) {
        if (isIncomingVoteMessage(message)) {
            this.votesTracker.registerVote(message.voteNumber, message.word);
        }
    }

    onVotingClockTickCompleted(tickCount: number) {
        this.percentVotingTimePassed = Math.min(100, (100 * tickCount) / 7);

        if (tickCount === 8) {
            this.startNewVote();
        } else if (tickCount === 7) {
            this.percentVotingTimePassed = 100;
            this.lastVoteResult = this.votesTracker.getVoteResult();

            if (this.lastVoteResult.selectedWord) {
                this.textTracker.addNewWord(this.lastVoteResult.selectedWord);
                this.fullText = this.textTracker.getFullText();
            }

            this.sendLastVote();
            this.startNewSuggestedWordsGeneration();
            this.votingClock.tick();
        } else {
            this.percentVotingTimePassed = Math.floor((100 * tickCount) / 7);
            this.sendTick();
            this.votingClock.tick();
        }
    }

    private sendLastVote() {
        const lastVoteMessage: OutgoingLastVoteMessage = {
            type: "lastVote",
            selectedLastRound: this.lastVoteResult.selectedWord,
            selectedLastRoundVotes: this.lastVoteResult.selectedWordVotes,
            lastRoundTotalVotes: this.lastVoteResult.totalVotes,
            percentVotingTimePassed: this.percentVotingTimePassed,
            activeUsers: this.activeUsers
        };

        this.server.broadcastMessage(lastVoteMessage);
    }

    private sendTick() {
        const tickMessage: OutgoingTickMessage = {
            type: "tick",
            percentVotingTimePassed: this.percentVotingTimePassed,
            activeUsers: this.activeUsers
        };

        this.server.broadcastMessage(tickMessage);
    }
}
