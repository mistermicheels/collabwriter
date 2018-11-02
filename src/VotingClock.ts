import { Controller } from "./Controller";

export class VotingClock {

    private controller: Controller;

    private currentPercentageComplete = 0;

    setController(controller: Controller) {
        this.controller = controller;
    }

    resetClock() {
        this.currentPercentageComplete = 0;
        this.tick();
    }

    private tick() {
        setTimeout(() => {
            this.currentPercentageComplete = this.currentPercentageComplete + 10;
            this.controller.onVotingClockTick(this.currentPercentageComplete);

            if (this.currentPercentageComplete < 100) {
                this.tick();
            }
        }, 1000);
    }

}