import https from "https";
import got from "got";

const randomWords = require("random-words");

interface WordWithScore {
    word: string;
    score: number;
}

export class SuggestedWordsGenerator {
    private static readonly DATAMUSE_TIMEOUT = 1000;

    // this is required to keep SSL connections alive, greatly improving request performance
    private readonly keepAliveAgent = new https.Agent({ keepAlive: true });

    async getSuggestedWords(lastWord: string, lastActualWord: string) {
        if (lastWord === ".") {
            return await this.getSuggestedFirstWordsForNewSentence(lastActualWord);
        } else {
            return await this.getSuggestedFollowingWordsInSentence(lastWord);
        }
    }

    async getSuggestedFirstWordsForNewSentence(lastActualWord: string) {
        const dataMuseSuggestions = await this.getDataMuseWordsRelatedTo(lastActualWord);

        let suggestions: Array<string> = [];
        suggestions.push(...this.selectDistinctRandomWords(dataMuseSuggestions, 6));
        this.completeUsingRandomSuggestions(suggestions, 12);
        this.shuffleSuggestions(suggestions);

        suggestions = suggestions.map(
            suggestion => suggestion[0].toUpperCase() + suggestion.substring(1)
        );

        return suggestions;
    }

    async getDataMuseWordsRelatedTo(word: string) {
        try {
            const result = await got("https://api.datamuse.com/words?rel_trg=" + word, {
                method: "GET",
                json: true,
                timeout: SuggestedWordsGenerator.DATAMUSE_TIMEOUT,
                retry: 0,
                agent: this.keepAliveAgent
            });

            const wordsWithScores = result.body as Array<WordWithScore>;
            return wordsWithScores.map(wordWithScore => wordWithScore.word);
        } catch (error) {
            console.log("Error contacting DataMuse API", error);
            return [];
        }
    }

    selectDistinctRandomWords(words: Array<string>, maxToSelect: number) {
        maxToSelect = Math.min(maxToSelect, words.length);
        const selected: Array<string> = [];

        while (selected.length < maxToSelect) {
            const randomWordsIndex = Math.floor(Math.random() * words.length);
            const selectedWord = words[randomWordsIndex];
            words.splice(randomWordsIndex, 1);
            selected.push(selectedWord);
        }

        return selected;
    }

    completeUsingRandomSuggestions(
        alreadySelected: Array<string>,
        targetNumberSuggestions: number
    ) {
        while (alreadySelected.length < targetNumberSuggestions) {
            const randomWord = randomWords();

            if (alreadySelected.indexOf(randomWord) < 0) {
                alreadySelected.push(randomWord);
            }
        }
    }

    shuffleSuggestions(suggestions: Array<string>) {
        // Fisher–Yates shuffle algorithm
        for (let i = suggestions.length - 1; i >= 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const itemAtIndex = suggestions[randomIndex];
            suggestions[randomIndex] = suggestions[i];
            suggestions[i] = itemAtIndex;
        }

        return suggestions;
    }

    async getSuggestedFollowingWordsInSentence(lastWord: string) {
        const dataMuseSuggestions = await this.getDataMuseWordsFollowing(lastWord);
        const topTen = dataMuseSuggestions.slice(0, 10);
        const others = dataMuseSuggestions.slice(10);

        let suggestions: Array<string> = [];
        suggestions.push(...this.selectDistinctRandomWords(topTen, 4));
        suggestions.push(...this.selectDistinctRandomWords(others, 4));
        this.completeUsingRandomSuggestions(suggestions, 11);
        this.shuffleSuggestions(suggestions);
        suggestions = suggestions.map(suggestion => (suggestion === "i" ? "I" : suggestion));

        // always start suggestions with a period to end the sentence
        suggestions.unshift(".");

        return suggestions;
    }

    async getDataMuseWordsFollowing(word: string) {
        try {
            const result = await got("https://api.datamuse.com/words?rel_bga=" + word, {
                method: "GET",
                json: true,
                timeout: SuggestedWordsGenerator.DATAMUSE_TIMEOUT,
                retry: 0,
                agent: this.keepAliveAgent
            });

            let wordsWithScores = result.body as Array<WordWithScore>;
            wordsWithScores = wordsWithScores.filter(wordWithScore => wordWithScore.word !== ".");
            return wordsWithScores.map(wordWithScore => wordWithScore.word);
        } catch (error) {
            console.log("Error contacting DataMuse API", error);
            return [];
        }
    }
}
