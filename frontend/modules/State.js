export class State {
    constructor() {
        this._currentTextWords = [];
        this._voteNumber = -1;
        this._wordChoices = [];
        this._ownChoiceLastRound;
    }

    setCurrentTextWords(currentTextWords) {
        this._currentTextWords = [...currentTextWords];
    }

    addPeriod() {
        const lastWordIndex = this._currentTextWords.length - 1;
        this._currentTextWords[lastWordIndex] = this._currentTextWords[lastWordIndex] + ".";
    }

    addActualNewWord(newWord) {
        this._currentTextWords.push(newWord);
    }

    getCurrentTextWords() {
        return [...this._currentTextWords];
    }

    setVoteNumber(voteNumber) {
        this._voteNumber = voteNumber;
    }

    getVoteNumber() {
        return this._voteNumber;
    }

    setWordChoices(wordChoices) {
        this._wordChoices = [...wordChoices];
    }

    getWordChoices() {
        return [...this._wordChoices];
    }

    getWordChoice(index) {
        return this._wordChoices[index];
    }

    setOwnChoiceLastRound(word) {
        this._ownChoiceLastRound = word;
    }

    getOwnChoiceLastRound() {
        return this._ownChoiceLastRound;
    }
}
