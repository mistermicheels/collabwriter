export interface VoteResult {
    selectedWord: string;
    selectedWordVotes: number;
    totalVotes: number;
}

export class VotesTracker {

    private choiceVotes = new Map<string, number>();
    private currentVoteNumber = 1;

    startNewVote(choices: string[]) {
        this.choiceVotes.clear();
        this.currentVoteNumber++;

        for (const choice of choices) {
            this.choiceVotes.set(choice, 0);
        }
    }

    getCurrentVoteNumber() {
        return this.currentVoteNumber;
    }

    registerVote(voteNumber: number, choice: string) {
        if (voteNumber !== this.currentVoteNumber) {
            return;
        }

        const currentVotes = this.choiceVotes.get(choice);

        if (currentVotes !== undefined) {
            this.choiceVotes.set(choice, currentVotes + 1);
        }
    }

    getVoteResult(): VoteResult {
        let selectedWord: string = undefined;
        let selectedWordVotes = 0;
        let totalVotes = 0;

        for (const choice of this.choiceVotes.keys()) {
            const votes = this.choiceVotes.get(choice);
            totalVotes = totalVotes + votes;

            if (votes > selectedWordVotes) {
                selectedWord = choice;
                selectedWordVotes = votes;
            }
        }

        return {
            selectedWord,
            selectedWordVotes,
            totalVotes
        };
    }

}