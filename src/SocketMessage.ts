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

interface OutgoingLastVoteData {
    selectedLastRound: string;
    selectedLastRoundVotes: number;
    lastRoundTotalVotes: number;
}

interface OutgoingNewVoteData {
    newWordChoices: string[];
    voteNumber: number;
}

interface OutgoingTickData {
    percentVotingTimePassed: number;
    activeUsers: number;
}

export interface OutgoingResetMessage
    extends SocketMessage,
        OutgoingLastVoteData,
        OutgoingNewVoteData,
        OutgoingTickData {
    type: "reset";
    fullText: string;
}

export interface OutgoingLastVoteMessage
    extends SocketMessage,
        OutgoingLastVoteData,
        OutgoingTickData {
    type: "lastVote";
}

export interface OutgoingNewVoteMessage
    extends SocketMessage,
        OutgoingNewVoteData,
        OutgoingTickData {
    type: "newVote";
}

export interface OutgoingTickMessage extends SocketMessage, OutgoingTickData {
    type: "tick";
}
