import { HeaderComponent } from "./components/HeaderComponent.js";
import { MainTextComponent } from "./components/MainTextComponent.js";
import { LastVoteInfoComponent } from "./components/LastVoteInfoComponent.js";
import { ProgressComponent } from "./components/ProgressComponent.js";
import { ModalTextComponent } from "./components/ModalTextComponent.js";
import { ChoicesComponent } from "./components/ChoicesComponent.js";

export class Page {
    constructor(choiceClickCallback) {
        this._header = new HeaderComponent();
        this._mainText = new MainTextComponent();
        this._lastVoteInfo = new LastVoteInfoComponent();
        this._progress = new ProgressComponent();
        this._modalText = new ModalTextComponent();
        this._choices = new ChoicesComponent(choiceClickCallback);
    }

    initializeMainTextFromWords(words) {
        const windowHeight = window.innerHeight;

        const otherElementsHeight =
            this._header.getTotalHeight() +
            this._lastVoteInfo.getTotalHeight() +
            this._progress.getTotalHeight() +
            this._choices.getTotalHeight();

        const availableHeightForTextArea = windowHeight - otherElementsHeight;
        this._mainText.initializeFromWords(words, availableHeightForTextArea);
    }

    addPeriodToMainText() {
        this._mainText.addPeriod();
    }

    addActualNewWordToMainText(newWord) {
        this._mainText.addActualNewWord(newWord);
    }

    setNumberActiveUsers(numberActiveUsers) {
        this._header.setNumberActiveUsers(numberActiveUsers);
    }

    setLastVoteInfo(voteResult) {
        this._lastVoteInfo.setInfo(voteResult);
    }

    setProgressPercentage(percentage) {
        this._progress.setProgressPercentage(percentage);
    }

    markChoiceButtonSelected(index) {
        this._choices.markChoiceButtonSelected(index);
    }

    markChoiceButtonWon(index) {
        this._choices.markChoiceButtonWon(index);
    }

    markChoiceButtonLost(index) {
        this._choices.markChoiceButtonLost(index);
    }

    disableChoiceButtons() {
        this._choices.disableChoiceButtons();
    }

    initializeChoiceButtons(wordChoices) {
        this._choices.initializeChoiceButtons(wordChoices);
    }

    setModalTextFromWords(words) {
        this._modalText.setFromWords(words);
    }
}
