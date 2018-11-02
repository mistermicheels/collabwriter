import ws from "ws";

import { SocketMessage, isIncomingVoteMessage, OutgoingResetMessage, OutgoingTickMessage, OutgoingNewVoteMessage } from "./SocketMessage";
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

    constructor(
        suggestedWordsGenerator: SuggestedWordsGenerator, textTracker: TextTracker, votesTracker: VotesTracker,
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

        await this.startNewVote();
    }

    private async startNewVote() {
        this.newWordChoices = await this.suggestedWordsGenerator.getSuggestedWords(
            this.textTracker.getLastWord(), this.textTracker.getLastActualWord());

        this.votesTracker.startNewVote(this.newWordChoices);
        this.voteNumber = this.votesTracker.getCurrentVoteNumber();

        this.votingClock.resetClock();
        this.percentVotingTimePassed = 0;

        const message: OutgoingNewVoteMessage = {
            type: "newVote",
            selectedLastRound: this.lastVoteResult.selectedWord,
            selectedLastRoundVotes: this.lastVoteResult.selectedWordVotes,
            selectedLastRoundTotalVotes: this.lastVoteResult.totalVotes,
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
            selectedLastRoundTotalVotes: this.lastVoteResult.totalVotes,
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
            message;
        }
    }

    onVotingClockTick(percentageCompleted: number) {
        this.percentVotingTimePassed = percentageCompleted;

        if (percentageCompleted === 100) {
            this.lastVoteResult = this.votesTracker.getVoteResult();

            if (this.lastVoteResult.selectedWord) {
                this.textTracker.addNewWord(this.lastVoteResult.selectedWord);
                this.fullText = this.textTracker.getFullText();
            }

            this.startNewVote();
        } else {
            const tickMessage: OutgoingTickMessage = {
                type: "tick",
                percentVotingTimePassed: percentageCompleted,
                activeUsers: this.activeUsers
            };

            this.server.broadcastMessage(tickMessage);
        }
    }

}