import ws from "ws";

import {
    SocketMessage,
    isIncomingVoteMessage,
    OutgoingResetMessage,
    OutgoingTickMessage,
    OutgoingNewVoteMessage,
    OutgoingLastVoteMessage,
} from "./SocketMessage";
import { Server } from "./Server";
import { VoteResult, VotesTracker } from "./VotesTracker";
import { TextTracker } from "./TextTracker";
import { SuggestedWordsGenerator } from "./SuggestedWordsGenerator";
import { VotingClock } from "./VotingClock";
import { ServerListener } from "./ServerListener";
import { VotingClockListener } from "./VotingClockListener";
import { TextStorage } from "./TextStorage";

export class Controller implements ServerListener, VotingClockListener {
    private activeUsers: number;

    private lastVoteResult: VoteResult;

    private newWordChoices: string[];
    private voteNumber: number;
    private percentVotingTimePassed: number;

    private newSuggestedWordsPromise: Promise<string[]>;

    constructor(
        private readonly suggestedWordsGenerator: SuggestedWordsGenerator,
        private readonly textStorage: TextStorage,
        private readonly textTracker: TextTracker,
        private readonly votesTracker: VotesTracker,
        private readonly votingClock: VotingClock,
        private readonly server: Server
    ) {}

    async initialize() {
        if (this.textStorage) {
            await this.textStorage.initialize();
        }

        await this.textTracker.initialize(this.textStorage);

        this.server.initialize(this);
        this.activeUsers = 0;

        this.lastVoteResult = this.votesTracker.getVoteResult();

        this.startNewSuggestedWordsGeneration();
        await this.startNewVote();

        this.votingClock.initialize(this);
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

        this.percentVotingTimePassed = 0;

        const message: OutgoingNewVoteMessage = {
            type: "newVote",
            newWordChoices: this.newWordChoices,
            voteNumber: this.voteNumber,
            percentVotingTimePassed: this.percentVotingTimePassed,
            activeUsers: this.activeUsers,
        };

        this.server.broadcastMessage(message);
    }

    onSocketOpened(currentNumberSockets: number, client: ws) {
        this.activeUsers = currentNumberSockets;

        const resetMessage: OutgoingResetMessage = {
            type: "reset",
            fullText: this.textTracker.getFullText(),
            selectedLastRound: this.lastVoteResult.selectedWord,
            selectedLastRoundVotes: this.lastVoteResult.selectedWordVotes,
            lastRoundTotalVotes: this.lastVoteResult.totalVotes,
            newWordChoices: this.newWordChoices,
            voteNumber: this.voteNumber,
            percentVotingTimePassed: this.percentVotingTimePassed,
            activeUsers: this.activeUsers,
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

    onPercentVotingTimePassedUpdated(percentVotingTimePassed: number): void {
        this.percentVotingTimePassed = percentVotingTimePassed;

        const tickMessage: OutgoingTickMessage = {
            type: "tick",
            percentVotingTimePassed: this.percentVotingTimePassed,
            activeUsers: this.activeUsers,
        };

        this.server.broadcastMessage(tickMessage);
    }

    onCurrentVoteFinished(): void {
        this.percentVotingTimePassed = 100;
        this.lastVoteResult = this.votesTracker.getVoteResult();

        if (this.lastVoteResult.selectedWord) {
            this.textTracker.addNewWord(this.lastVoteResult.selectedWord);
        }

        // allow plenty of time to generate suggested words for next round
        this.startNewSuggestedWordsGeneration();

        const lastVoteMessage: OutgoingLastVoteMessage = {
            type: "lastVote",
            selectedLastRound: this.lastVoteResult.selectedWord,
            selectedLastRoundVotes: this.lastVoteResult.selectedWordVotes,
            lastRoundTotalVotes: this.lastVoteResult.totalVotes,
            percentVotingTimePassed: this.percentVotingTimePassed,
            activeUsers: this.activeUsers,
        };

        this.server.broadcastMessage(lastVoteMessage);
    }

    onNewVoteStarting(): void {
        this.startNewVote();
    }
}
