export interface SocketMessage {
    type: string;
}

export interface IncomingVoteMessage extends SocketMessage {
    type: "vote";
    voteNumber: number;
    word: string;
}

export function isIncomingVoteMessage(arg: any): arg is IncomingVoteMessage {
    return arg.type === "vote";
}

export interface OutgoingResetMessage extends SocketMessage {
    type: "reset";
    fullText: string;
    selectedLastRound: string;
    selectedLastRoundVotes: number;
    lastRoundTotalVotes: number;
    newWordChoices: string[];
    voteNumber: number;
    percentVotingTimePassed: number;
    activeUsers: number;
}

export interface OutgoingTickMessage extends SocketMessage {
    type: "tick";
    percentVotingTimePassed: number;
    activeUsers: number;
}

export interface OutgoingNewVoteMessage extends SocketMessage {
    type: "newVote";
    selectedLastRound: string;
    selectedLastRoundVotes: number;
    lastRoundTotalVotes: number;
    newWordChoices: string[];
    voteNumber: number;
    percentVotingTimePassed: number;
    activeUsers: number;
}