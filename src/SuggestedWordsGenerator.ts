import got from "got";

const randomWords = require("random-words");

interface WordWithScore {
    word: string;
    score: number;
}

export class SuggestedWordsGenerator {

    async getSuggestedWords(lastWord: string, lastActualWord: string) {
        if (lastWord = ".") {
            return await this.getSuggestedFirstWordsForNewSentence(lastActualWord);
        } else {
            return await this.getSuggestedFollowingWordsInSentence(lastWord);
        }
    }

    async getSuggestedFirstWordsForNewSentence(lastActualWord: string) {
        const dataMuseSuggestions = await this.getDataMuseWordsRelatedTo(lastActualWord);

        const suggestions: Array<string> = [];
        suggestions.push(...this.selectDistinctRandomWords(dataMuseSuggestions, 4));
        this.completeUsingRandomSuggestions(suggestions, 12);
        this.shuffleSuggestions(suggestions);

        return suggestions;
    }

    async getDataMuseWordsRelatedTo(word: string) {
        try {
            const result = await got("https://api.datamuse.com/words?rel_trg=" + word, {
                json: true,
                timeout: 1000
            });

            const wordsWithScores = result.body as Array<WordWithScore>;
            return wordsWithScores.map(wordWithScore => wordWithScore.word);
        } catch (error) {
            return [];
        }
    }

    selectDistinctRandomWords(words: Array<string>, maxToSelect: number) {
        maxToSelect = Math.min(maxToSelect, words.length);
        const selected: Array<string> = [];

        while (selected.length < maxToSelect) {
            const randomWord = words[Math.floor(Math.random() * words.length)];

            if (selected.indexOf(randomWord) < 0) {
                selected.push(randomWord);
            }
        }

        return selected;
    }

    completeUsingRandomSuggestions(alreadySelected: Array<string>, targetNumberSuggestions: number) {
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

        const suggestions: Array<string> = [];
        suggestions.push(...this.selectDistinctRandomWords(topTen, 3));
        suggestions.push(...this.selectDistinctRandomWords(others, 3));
        this.completeUsingRandomSuggestions(suggestions, 11);
        this.shuffleSuggestions(suggestions);

        // always start suggestions with a period to end the sentence
        suggestions.unshift(".");

        return suggestions;
    }

    async getDataMuseWordsFollowing(word: string) {
        try {
            const result = await got("https://api.datamuse.com/words?lc=" + word, {
                json: true,
                timeout: 1000
            });

            const wordsWithScores = result.body as Array<WordWithScore>;
            return wordsWithScores.map(wordWithScore => wordWithScore.word);
        } catch (error) {
            return [];
        }
    }

}