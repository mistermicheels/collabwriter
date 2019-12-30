// initialize elements
const textAreaElement = document.getElementById("textArea");
const currentTextElement = document.getElementById("currentText");
const activeUsersElement = document.getElementById("activeUsers");
const lastChoiceInfoElement = document.getElementById("lastChoiceInfo");
const progressBarElement = document.getElementById("progressBar");

const isTouch = !!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;

const choiceButtonElements = [];

for (let i = 1; i <= 12; i++) {
    const buttonElement = document.getElementById("choice" + i);
    buttonElement.style.visibility = "hidden";

    if (isTouch) {
        buttonElement.classList.add("no-hover");
    }

    choiceButtonElements.push(buttonElement);
}

// text and choices placeholders
let currentTextWords = [];
let currentTextWithLineBreaks = "";
let voteNumber = -1;
let wordChoices = [];

let ownChoiceLastRound = undefined;

// socket setup
const socket = new WebSocket("ws://" + location.host + "/socket");

socket.onmessage = function(event) {
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

// actual functionality

function processResetMessage(message) {
    currentTextWords = message.fullText.split(" ");
    initializeCurrentText();
    setTextInModalFromCurrentTextWords();
    window.addEventListener("resize", initializeCurrentText);

    updateLastChoiceInfo(message);
    initializeNewVotingRound(message);
    updateProgressBarAndActiveUsers(message);
}

function processLastVoteMessage(message) {
    addLastSelectedWordIfDefined(message);
    updateLastChoiceInfo(message);
    updateProgressBarAndActiveUsers(message);
}

function processNewVoteMessage(message) {
    initializeNewVotingRound(message);
    updateProgressBarAndActiveUsers(message);
}

function processTickMessage(message) {
    updateProgressBarAndActiveUsers(message);
}

function setTextInModalFromCurrentTextWords() {
    document.getElementById("fullTextInModal").textContent = currentTextWords.join(" ");
}

function initializeCurrentText() {
    const windowHeight = window.innerHeight;
    const headerHeight = document.getElementById("header").clientHeight;
    const lastChoiceInfoElementHeight = lastChoiceInfoElement.clientHeight + 18;
    const progressHeight = document.getElementById("progress").clientHeight + 20;
    const suggestionsHeight = document.getElementById("suggestions").clientHeight;

    const heightAvailableForTextArea =
        windowHeight -
        headerHeight -
        lastChoiceInfoElementHeight -
        progressHeight -
        suggestionsHeight;

    currentTextWithLineBreaks = "";
    setCurrentTextOnElement("");
    const minimumInitialWords = 50;

    for (let i = currentTextWords.length - 1; i >= 0; i--) {
        const currentWord = currentTextWords[i];
        const previousHeight = getTextAreaHeight();
        setCurrentTextOnElement(currentWord + " " + currentTextWithLineBreaks);
        const newHeight = getTextAreaHeight();
        const shownWords = currentTextWords.length - i;

        if (newHeight === previousHeight) {
            currentTextWithLineBreaks = currentWord + " " + currentTextWithLineBreaks;
        } else if (newHeight <= heightAvailableForTextArea || shownWords <= minimumInitialWords) {
            currentTextWithLineBreaks = currentWord + "\r\n" + currentTextWithLineBreaks;
            setCurrentTextOnElement(currentTextWithLineBreaks);
        } else {
            // don't add this word or any other ones
            setCurrentTextOnElement(currentTextWithLineBreaks);
            break;
        }
    }
}

function setCurrentTextOnElement(text) {
    currentTextElement.textContent = text;
}

function getTextAreaHeight() {
    return textAreaElement.clientHeight;
}

function updateLastChoiceInfo(message) {
    if (message.selectedLastRound) {
        lastChoiceInfoElement.textContent =
            "The last voting round chose '" +
            message.selectedLastRound +
            "' with " +
            message.selectedLastRoundVotes +
            " votes out of " +
            message.lastRoundTotalVotes;

        if (ownChoiceLastRound !== undefined) {
            visualizeOwnChoiceVsSelected(ownChoiceLastRound, message.selectedLastRound);
        }
    } else {
        lastChoiceInfoElement.textContent = "No votes were cast in the previous voting round";
    }
}

function visualizeOwnChoiceVsSelected(ownChoiceLastRound, selectedLastRound) {
    choiceButtonElements.forEach(function(buttonElement, index) {
        if (wordChoices[index] === selectedLastRound) {
            buttonElement.classList.remove("btn-primary");
            buttonElement.classList.remove("btn-outline-primary");
            buttonElement.classList.add("btn-success");
        } else if (wordChoices[index] === ownChoiceLastRound) {
            buttonElement.classList.remove("btn-primary");
            buttonElement.classList.remove("btn-outline-primary");
            buttonElement.classList.add("btn-danger");
        }
    });
}

function initializeNewVotingRound(message) {
    voteNumber = message.voteNumber;
    wordChoices = message.newWordChoices;
    ownChoiceLastRound = undefined;
    updateChoiceButtons();
}

function updateChoiceButtons() {
    for (let i = 0; i < wordChoices.length; i++) {
        const buttonElement = choiceButtonElements[i];

        buttonElement.style.visibility = "visible";
        buttonElement.classList.remove("btn-success");
        buttonElement.classList.remove("btn-danger");
        buttonElement.classList.remove("btn-primary");
        buttonElement.classList.add("btn-outline-primary");

        const choice = wordChoices[i];

        if (choice === ".") {
            buttonElement.textContent = ". (end sentence)";
        } else {
            buttonElement.textContent = choice;
        }
    }

    setChoiceButtonsEnabled(true);
}

function setChoiceButtonsEnabled(enabled) {
    choiceButtonElements.forEach(function(element) {
        element.disabled = !enabled;
    });
}

function updateProgressBarAndActiveUsers(message) {
    progressBarElement.style.width = message.percentVotingTimePassed + "%";
    activeUsersElement.textContent = message.activeUsers;

    if (message.percentVotingTimePassed === 100) {
        setChoiceButtonsEnabled(false);
    }
}

function addLastSelectedWordIfDefined(message) {
    if (message.selectedLastRound) {
        addWord(message.selectedLastRound);
        setTextInModalFromCurrentTextWords();
    }
}

function addWord(newWord) {
    if (newWord === ".") {
        addPeriod();
    } else {
        addActualNewWord(newWord);
    }
}

function addPeriod() {
    const lastWordIndex = currentTextWords.length - 1;
    currentTextWords[lastWordIndex] = currentTextWords[lastWordIndex] + ".";

    const previousHeight = getTextAreaHeight();
    setCurrentTextOnElement(currentTextWithLineBreaks + ".");
    const newHeight = getTextAreaHeight();

    if (newHeight === previousHeight) {
        currentTextWithLineBreaks = currentTextWithLineBreaks + ".";
    } else {
        const positionOfFirstLineBreak = currentTextWithLineBreaks.indexOf("\n");

        // the current line had space for the "next word placeholder", so the period itself will still fit

        currentTextWithLineBreaks =
            currentTextWithLineBreaks.substring(positionOfFirstLineBreak + 1) + ".\r\n";

        setCurrentTextOnElement(currentTextWithLineBreaks);
    }
}

function addActualNewWord(newWord) {
    currentTextWords.push(newWord);

    const previousHeight = getTextAreaHeight();
    setCurrentTextOnElement(currentTextWithLineBreaks + " " + newWord);
    const newHeight = getTextAreaHeight();

    if (newHeight === previousHeight) {
        currentTextWithLineBreaks = currentTextWithLineBreaks + " " + newWord;
    } else {
        const positionOfFirstLineBreak = currentTextWithLineBreaks.indexOf("\n");

        currentTextWithLineBreaks =
            currentTextWithLineBreaks.substring(positionOfFirstLineBreak + 1) + "\r\n" + newWord;

        setCurrentTextOnElement(currentTextWithLineBreaks);
    }
}

function choiceButtonClicked(choiceNumber) {
    const index = choiceNumber - 1;
    const word = wordChoices[index];
    ownChoiceLastRound = word;

    const buttonElement = choiceButtonElements[index];
    buttonElement.classList.add("btn-primary");
    buttonElement.classList.remove("btn-outline-primary");

    setChoiceButtonsEnabled(false);

    const voteMessage = {
        type: "vote",
        voteNumber: voteNumber,
        word: word
    };

    socket.send(JSON.stringify(voteMessage));
}
