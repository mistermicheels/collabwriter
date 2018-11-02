export class TextTracker {

    private fullText: string =
        "One upon a time, there was a story that was written collaboratively by numerous online people."
        + " Together, they decided on the words to use, one by one."
        + " As time passed, the story became longer and longer."
        + " If you see this text, the story has been reset."
        + " Feel free to contribute to the writing of a new story.";

    private lastWord = ".";
    private lastActualWord = "story";

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
        if (word === ".") {
            this.fullText = this.fullText + word;
            this.lastWord = word;
        } else {
            this.fullText = this.fullText + " " + word;
            this.lastWord = word;
            this.lastActualWord = word;
        }
    }

}