import { VotingClockListener } from "./VotingClockListener";

export class VotingClock {
    private static CLOCK_INTERVAL = 1000;

    private listener: VotingClockListener;

    private tickCount = 0;

    initialize(listener: VotingClockListener) {
        this.listener = listener;

        setInterval(() => this.tick(), VotingClock.CLOCK_INTERVAL);
    }

    private tick() {
        this.tickCount = this.tickCount + 1;

        if (this.tickCount < 7) {
            const percentVotingTimePassed = Math.round((100 * this.tickCount) / 7);
            this.listener.onPercentVotingTimePassedUpdated(percentVotingTimePassed);
        } else if (this.tickCount === 7) {
            this.listener.onCurrentVoteFinished();
        } else {
            this.listener.onNewVoteStarting();
            this.tickCount = 0;
        }
    }
}
