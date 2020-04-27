import { TextStorage } from "./TextStorage";

export class TextTracker {
    public static readonly MAX_WORDS = 2500;

    private textStorage: TextStorage;

    private fullText: string;
    private lastWord: string;
    private lastActualWord: string;

    constructor() {}

    async initialize(textStorage: TextStorage) {
        this.textStorage = textStorage;

        const retrievedText = await this.textStorage.retrieveText();

        this.fullText = retrievedText || "This is the start of the story.";

        const sentenceParts = this.fullText.split(" ");
        const lastSentencePart = sentenceParts[sentenceParts.length - 1];

        if (lastSentencePart.endsWith(".")) {
            this.lastWord = ".";
            this.lastActualWord = lastSentencePart.substring(0, lastSentencePart.length - 1);
        } else {
            this.lastWord = lastSentencePart;
            this.lastActualWord = lastSentencePart;
        }
    }

    getFullText() {
        return this.fullText;
    }

    getLastWord() {
        return this.lastWord;
    }

    getLastActualWord() {
        return this.lastActualWord;
    }

    addNewWord(word: string) {
        console.log(`New word: ${word}`);

        if (word === ".") {
            this.fullText = this.fullText + word;
            this.lastWord = word;
        } else {
            this.fullText = this.fullText + " " + word;
            this.lastWord = word;
            this.lastActualWord = word;
        }

        this.truncateTextIfTooLong();

        // don't await, we don't need to be sure it succeeds
        void this.textStorage.storeTextAndSwallowErrors(this.fullText);
    }

    private truncateTextIfTooLong() {
        const sentenceParts = this.fullText.split(" ");

        if (sentenceParts.length > TextTracker.MAX_WORDS) {
            this.fullText = sentenceParts
                .slice(sentenceParts.length - TextTracker.MAX_WORDS)
                .join(" ");
        }
    }
}
