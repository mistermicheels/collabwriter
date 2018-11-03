import { Controller } from "./Controller";

export class VotingClock {

    private controller: Controller;

    private tickCount = 0;

    setController(controller: Controller) {
        this.controller = controller;
    }

    resetTickCount() {
        this.tickCount = 0;
    }

    tick() {
        setTimeout(() => {
            this.tickCount = this.tickCount + 1;
            this.controller.onVotingClockTickCompleted(this.tickCount);
        }, 1000);
    }

}