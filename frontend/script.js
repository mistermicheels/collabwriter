// classes representing page, components on page and state

class Page {
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

class HeaderComponent {
    constructor() {
        this._element = document.getElementById("header");
        this._activeUsers = new ActiveUsersComponent();
    }

    setNumberActiveUsers(numberActiveUsers) {
        this._activeUsers.setNumberActiveUsers(numberActiveUsers);
    }

    getTotalHeight() {
        return this._element.clientHeight;
    }
}

class ActiveUsersComponent {
    constructor() {
        this._element = document.getElementById("activeUsers");
    }

    setNumberActiveUsers(numberActiveUsers) {
        this._element.textContent = numberActiveUsers;
    }
}

class MainTextComponent {
    constructor() {
        this._areaElement = document.getElementById("textArea");
        this._textElement = document.getElementById("currentText");
        this._textWithLineBreaks = "";
    }

    initializeFromWords(words, availableHeight) {
        this._textElement.textContent = "";
        this._textWithLineBreaks = "";
        const minimumInitialWords = 50;

        // add words in reverse order so we always show the last part of the text
        for (let i = words.length - 1; i >= 0; i--) {
            const previousHeight = this._areaElement.clientHeight;

            const currentWord = words[i];
            this._textElement.textContent = currentWord + " " + this._textWithLineBreaks;
            const newHeight = this._areaElement.clientHeight;

            const shownWords = words.length - i;

            if (newHeight === previousHeight) {
                // adding the word didn't force a new line break
                this._textWithLineBreaks = this._textElement.textContent;
            } else if (newHeight <= availableHeight || shownWords <= minimumInitialWords) {
                // adding the word forced a new line break and we want to keep the additional line
                // we make the line break explicit by including it in the string
                this._textElement.textContent = currentWord + "\n" + this._textWithLineBreaks;
                this._textWithLineBreaks = this._textElement.textContent;
            } else {
                // we don't have the space to add this word or any other ones, stick with last _textWithLineBreaks value
                this._textElement.textContent = this._textWithLineBreaks;
                break;
            }
        }
    }

    addPeriod() {
        const previousHeight = this._areaElement.clientHeight;
        this._textElement.textContent = this._textWithLineBreaks + ".";
        const newHeight = this._areaElement.clientHeight;

        if (newHeight > previousHeight) {
            // we need to move the text up by getting rid of the first line
            const indexFirstLineBreak = this._textWithLineBreaks.indexOf("\n");
            const textAfterFirstLine = this._textWithLineBreaks.substring(indexFirstLineBreak + 1);

            // the current line had space for the "next word placeholder", so the period itself will still fit
            this._textElement.textContent = textAfterFirstLine + ".\n";
        }

        this._textWithLineBreaks = this._textElement.textContent;
    }

    addActualNewWord(newWord) {
        const previousHeight = this._areaElement.clientHeight;
        this._textElement.textContent = this._textWithLineBreaks + " " + newWord;
        const newHeight = this._areaElement.clientHeight;

        if (newHeight > previousHeight) {
            // we need to move the text up by getting rid of the first line
            const indexFirstLineBreak = this._textWithLineBreaks.indexOf("\n");
            const textAfterFirstLine = this._textWithLineBreaks.substring(indexFirstLineBreak + 1);
            this._textElement.textContent = textAfterFirstLine + "\n" + newWord;
        }

        this._textWithLineBreaks = this._textElement.textContent;
    }
}

class LastVoteInfoComponent {
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

class ProgressComponent {
    constructor() {
        this._element = document.getElementById("progress");
        this._barElement = document.getElementById("progressBar");
    }

    setProgressPercentage(percentage) {
        this._barElement.style.width = percentage + "%";
    }

    getTotalHeight() {
        return this._element.clientHeight + 20;
    }
}

class ChoicesComponent {
    constructor(clickCallback) {
        this._element = document.getElementById("choices");
        this._buttons = [];

        const isTouch = !!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;

        for (let i = 0; i < 12; i++) {
            const buttonDiv = document.createElement("div");
            buttonDiv.classList.add("col-6", "col-md-4", "col-lg-3");

            const buttonElement = document.createElement("button");
            buttonElement.type = "button";
            buttonElement.classList.add("btn", "btn-block");
            buttonElement.style.overflow = "hidden";
            buttonElement.onclick = () => clickCallback(i);

            if (isTouch) {
                buttonElement.classList.add("no-hover");
            }

            buttonDiv.appendChild(buttonElement);
            this._element.appendChild(buttonDiv);

            this._buttons.push(new ChoiceButtonComponent(buttonElement));
        }
    }

    markChoiceButtonSelected(index) {
        this._buttons[index].markSelected();
    }

    markChoiceButtonWon(index) {
        this._buttons[index].markWon();
    }

    markChoiceButtonLost(index) {
        this._buttons[index].markLost();
    }

    disableChoiceButtons() {
        for (const button of this._buttons) {
            button.disable();
        }
    }

    initializeChoiceButtons(wordChoices) {
        for (let i = 0; i < 12; i++) {
            this._buttons[i].initializeWithWord(wordChoices[i]);
        }
    }

    getTotalHeight() {
        return this._element.clientHeight;
    }
}

class ChoiceButtonComponent {
    constructor(element) {
        this._dynamicClasses = {
            selected: "btn-primary",
            won: "btn-success",
            lost: "btn-danger",
            normal: "btn-outline-primary",
        };

        this._element = element;
        this._element.textContent = "placeholder"; // we need this placeholder text for proper height calculation on init
        this.markNormal();
        this.disable();
        this._element.style.visibility = "hidden";
    }

    markNormal() {
        this._setDynamicClass(this._dynamicClasses.normal);
    }

    markSelected() {
        this._setDynamicClass(this._dynamicClasses.selected);
    }

    markWon() {
        this._setDynamicClass(this._dynamicClasses.won);
    }

    markLost() {
        this._setDynamicClass(this._dynamicClasses.lost);
    }

    disable() {
        this._element.disabled = true;
    }

    initializeWithWord(word) {
        if (word === ".") {
            this._element.textContent = ". (end sentence)";
        } else {
            this._element.textContent = word;
        }

        this.markNormal();
        this._element.disabled = false;
        this._element.style.visibility = "visible";
    }

    _setDynamicClass(dynamicClass) {
        const allDynamicClasses = Object.values(this._dynamicClasses);
        const classesToRemove = allDynamicClasses.filter((entry) => entry !== dynamicClass);
        this._element.classList.remove(...classesToRemove);
        this._element.classList.add(dynamicClass);
    }
}

class ModalTextComponent {
    constructor() {
        this._element = document.getElementById("fullTextInModal");
    }

    setFromWords(words) {
        this._element.textContent = words.join(" ");
    }
}

class State {
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

// initialize globals, including WebSocket

const state = new State();
const page = new Page(choiceButtonClickCallback);

const socketProtocol = location.origin.startsWith("https") ? "wss" : "ws";
const socketUrl = socketProtocol + "://" + location.host + "/socket";
const socket = new WebSocket(socketUrl);

socket.onmessage = function (event) {
    const message = JSON.parse(event.data);

    if (message.type === "reset") {
        // will be fired on connect
        processResetMessage(message);
    } else if (message.type === "lastVote") {
        processLastVoteMessage(message);
    } else if (message.type === "newVote") {
        processNewVoteMessage(message);
    } else if (message.type === "tick") {
        processTickMessage(message);
    }
};

// main logic

function processResetMessage(message) {
    const words = message.fullText.split(" ");
    state.setCurrentTextWords(words);
    page.initializeMainTextFromWords(words);
    page.setModalTextFromWords(words);

    window.addEventListener("resize", () =>
        page.initializeMainTextFromWords(state.getCurrentTextWords())
    );

    updateLastVoteInfo(message);
    initializeNewVotingRound(message);
    processCommonMessageData(message);
}

function processLastVoteMessage(message) {
    if (message.selectedLastRound) {
        addWord(message.selectedLastRound);
        visualizeOwnChoiceVsSelected(message.selectedLastRound);
    }

    updateLastVoteInfo(message);
    processCommonMessageData(message);
}

function processNewVoteMessage(message) {
    initializeNewVotingRound(message);
    processCommonMessageData(message);
}

function processTickMessage(message) {
    processCommonMessageData(message);
}

function updateLastVoteInfo(message) {
    if (message.selectedLastRound) {
        page.setLastVoteInfo({
            selected: message.selectedLastRound,
            selectedVotes: message.selectedLastRoundVotes,
            totalVotes: message.lastRoundTotalVotes,
        });
    } else {
        page.setLastVoteInfo(undefined);
    }
}

function visualizeOwnChoiceVsSelected(selectedLastRound) {
    const ownChoiceLastRound = state.getOwnChoiceLastRound();

    if (!ownChoiceLastRound) {
        return;
    }

    state.getWordChoices().forEach((choice, index) => {
        if (choice === selectedLastRound) {
            page.markChoiceButtonWon(index);
        } else if (choice === ownChoiceLastRound) {
            page.markChoiceButtonLost(index);
        }
    });
}

function initializeNewVotingRound(message) {
    state.setVoteNumber(message.voteNumber);
    state.setWordChoices(message.newWordChoices);
    state.setOwnChoiceLastRound(undefined);
    page.initializeChoiceButtons(message.newWordChoices);
}

function processCommonMessageData(message) {
    page.setNumberActiveUsers(message.activeUsers);
    page.setProgressPercentage(message.percentVotingTimePassed);

    if (message.percentVotingTimePassed === 100) {
        page.disableChoiceButtons();
    }
}

function addWord(newWord) {
    if (newWord === ".") {
        state.addPeriod();
        page.addPeriodToMainText();
    } else {
        state.addActualNewWord(newWord);
        page.addActualNewWordToMainText(newWord);
    }

    page.setModalTextFromWords(state.getCurrentTextWords());
}

function choiceButtonClickCallback(index) {
    const word = state.getWordChoice(index);
    state.setOwnChoiceLastRound(word);

    page.markChoiceButtonSelected(index);
    page.disableChoiceButtons();

    const voteMessage = {
        type: "vote",
        voteNumber: state.getVoteNumber(),
        word,
    };

    socket.send(JSON.stringify(voteMessage));
}
