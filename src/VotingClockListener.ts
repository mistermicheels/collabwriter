export interface VotingClockListener {
    onPercentVotingTimePassedUpdated(percentVotingTimePassed: number): void;
    onCurrentVoteFinished(): void;
    onNewVoteStarting(): void;
}
