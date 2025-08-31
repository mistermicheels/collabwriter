export class LastVoteInfoComponent {
    constructor() {
        this._element = document.getElementById("lastVoteInfo");
    }

    setInfo(voteResult) {
        if (voteResult) {
            this._element.textContent =
                "The last voting round chose '" +
                voteResult.selected +
                "' with " +
                voteResult.selectedVotes +
                " votes out of " +
                voteResult.totalVotes;
        } else {
            this._element.textContent = "No votes were cast in the previous voting round";
        }
    }

    getTotalHeight() {
        return this._element.clientHeight + 22;
    }
}
