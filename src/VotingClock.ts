import { VotingClockListener } from "./VotingClockListener";

export class VotingClock {
    private static readonly CLOCK_INTERVAL = 1000;
    private static readonly ROUND_DURATION = 7;

    private listener: VotingClockListener;

    private tickCount = 0;

    initialize(listener: VotingClockListener) {
        this.listener = listener;

        setInterval(() => this.tick(), VotingClock.CLOCK_INTERVAL);
    }

    private tick() {
        this.tickCount = this.tickCount + 1;

        if (this.tickCount < VotingClock.ROUND_DURATION) {
            const percentPassed = Math.round(100 * (this.tickCount / VotingClock.ROUND_DURATION));
            this.listener.onPercentVotingTimePassedUpdated(percentPassed);
        } else if (this.tickCount === VotingClock.ROUND_DURATION) {
            this.listener.onCurrentVoteFinished();
        } else {
            this.listener.onNewVoteStarting();
            this.tickCount = 0;
        }
    }
}
