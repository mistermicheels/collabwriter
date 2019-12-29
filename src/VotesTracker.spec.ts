import { VotesTracker } from "./VotesTracker";

describe("VotesTracker", () => {
    test("it should register valid votes", () => {
        const votesTracker = new VotesTracker();
        votesTracker.startNewVote(["first", "second"]);
        const voteNumber = votesTracker.getCurrentVoteNumber();
        votesTracker.registerVote(voteNumber, "first");
        votesTracker.registerVote(voteNumber, "first");
        votesTracker.registerVote(voteNumber, "second");

        const result = votesTracker.getVoteResult();
        expect(result).toEqual({ selectedWord: "first", selectedWordVotes: 2, totalVotes: 3 });
    });

    test("it should pick the first word in case of equal number of votes", () => {
        const votesTracker = new VotesTracker();
        votesTracker.startNewVote(["first", "second"]);
        const voteNumber = votesTracker.getCurrentVoteNumber();
        votesTracker.registerVote(voteNumber, "first");
        votesTracker.registerVote(voteNumber, "second");

        const result = votesTracker.getVoteResult();
        expect(result).toEqual({ selectedWord: "first", selectedWordVotes: 1, totalVotes: 2 });
    });

    test("it should allow for voting rounds without valid votes", () => {
        const votesTracker = new VotesTracker();
        votesTracker.startNewVote(["first", "second"]);

        const result = votesTracker.getVoteResult();
        expect(result).toEqual({ selectedWord: undefined, selectedWordVotes: 0, totalVotes: 0 });
    });

    test("it should ignore votes belonging to an old voting round", () => {
        const votesTracker = new VotesTracker();
        votesTracker.startNewVote(["first", "second"]);
        const firstVoteNumber = votesTracker.getCurrentVoteNumber();

        votesTracker.startNewVote(["third", "fourth"]);
        votesTracker.registerVote(firstVoteNumber, "first");
        votesTracker.registerVote(firstVoteNumber, "first");
        votesTracker.registerVote(firstVoteNumber, "second");
        const secondVoteNumber = votesTracker.getCurrentVoteNumber();
        votesTracker.registerVote(secondVoteNumber, "third");

        const result = votesTracker.getVoteResult();
        expect(result).toEqual({ selectedWord: "third", selectedWordVotes: 1, totalVotes: 1 });
    });

    test("it should ignore votes for words not in the current voting round", () => {
        const votesTracker = new VotesTracker();
        votesTracker.startNewVote(["first", "second"]);
        const voteNumber = votesTracker.getCurrentVoteNumber();

        votesTracker.registerVote(voteNumber, "first");
        votesTracker.registerVote(voteNumber, "third");
        votesTracker.registerVote(voteNumber, "fourth");

        const result = votesTracker.getVoteResult();
        expect(result).toEqual({ selectedWord: "first", selectedWordVotes: 1, totalVotes: 1 });
    });
});
