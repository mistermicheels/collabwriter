// initialize elements
const textAreaElement = document.getElementById("textArea");
const currentTextElement = document.getElementById("currentText");
const activeUsersElement = document.getElementById("activeUsers");
const lastChoiceInfoElement = document.getElementById("lastChoiceInfo");
const progressBarElement = document.getElementById("progressBar");

const choiceButtonElements = [];

for (let i = 1; i <= 12; i++) {
    const buttonElement = document.getElementById("choice" + i);
    buttonElement.style.visibility = "hidden";
    choiceButtonElements.push(buttonElement);
}

// text and choices placeholders
let currentTextWords = [];
let currentTextWithLineBreaks = "";
let voteNumber = -1;
let newWordChoices = [];

// socket setup
const socket = new WebSocket("ws://" + location.host + "/socket");

socket.onmessage = function (event) {
    const message = JSON.parse(event.data);

    if (message.type === "reset") {
        processResetMessage(message);
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
    window.addEventListener("resize", () => initializeCurrentText());

    processNewVoteMessage(message);
}

function processNewVoteMessage(message) {
    if (message.selectedLastRound) {
        addWord(message.selectedLastRound);

        lastChoiceInfoElement.textContent =
            `The last voting round chose '${message.selectedLastRound}' with ${message.selectedLastRoundVotes} votes out of ${message.lastRoundTotalVotes}`;
    } else {
        lastChoiceInfoElement.textContent = "No votes were cast in the previous voting round";
    }

    voteNumber = message.voteNumber;
    newWordChoices = message.newWordChoices;
    updateChoiceButtons();

    processTickMessage(message);
}

function updateChoiceButtons() {
    for (let i = 0; i < newWordChoices.length; i++) {
        const buttonElement = choiceButtonElements[i];

        buttonElement.disabled = false;
        buttonElement.style.visibility = "visible";
        buttonElement.classList.remove("btn-primary");
        buttonElement.classList.add("btn-outline-primary");

        const choice = newWordChoices[i];

        if (choice === ".") {
            buttonElement.textContent = ". (new sentence)";
        } else {
            buttonElement.textContent = choice;
        }
    }
}

function processTickMessage(message) {
    progressBarElement.style.width = message.percentVotingTimePassed + "%";
    activeUsersElement.textContent = message.activeUsers;
}

function initializeCurrentText() {
    const windowHeight = window.innerHeight;
    const headerHeight = document.getElementById("header").clientHeight + 18;
    const lastChoiceInfoElementHeight = lastChoiceInfoElement.clientHeight + 18;
    const progressHeight = document.getElementById("progress").clientHeight + 20;
    const suggestionsHeight = document.getElementById("suggestions").clientHeight;
    const heightAvailableForTextArea = windowHeight - headerHeight - lastChoiceInfoElementHeight - progressHeight - suggestionsHeight;

    currentTextWithLineBreaks = "";
    setCurrentTextOnElement("");
    const minimumInitialWords = 50;

    for (let i = currentTextWords.length - 1; i >= 0; i--) {
        const currentWord = currentTextWords[i];
        const previousHeight = getTextAreaHeight();
        setCurrentTextOnElement(currentWord + " " + currentTextWithLineBreaks);
        const newHeight = getTextAreaHeight();

        if (newHeight === previousHeight) {
            currentTextWithLineBreaks = currentWord + " " + currentTextWithLineBreaks;
        } else if (newHeight <= heightAvailableForTextArea || currentTextWords.length - i <= minimumInitialWords) {
            currentTextWithLineBreaks = currentWord + "\r\n" + currentTextWithLineBreaks;
            setCurrentTextOnElement(currentTextWithLineBreaks);
        } else {
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
        currentTextWithLineBreaks = currentTextWithLineBreaks.substring(positionOfFirstLineBreak + 1) + ".\r\n" ;
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
        currentTextWithLineBreaks = currentTextWithLineBreaks.substring(positionOfFirstLineBreak + 1) + "\r\n" + newWord;
        setCurrentTextOnElement(currentTextWithLineBreaks);
    }
}

function choiceButtonClicked(choiceNumber) {
    const index = choiceNumber - 1;

    const buttonElement = choiceButtonElements[index];
    buttonElement.classList.add("btn-primary");
    buttonElement.classList.remove("btn-outline-primary");

    for (const buttonElement of choiceButtonElements) {
        buttonElement.disabled = true;
    }

    const word = newWordChoices[index];

    const voteMessage = {
        type: "vote",
        voteNumber,
        word
    };

    socket.send(JSON.stringify(voteMessage));
}

function setTextInModal() {
    document.getElementById("fullTextModalBody").textContent = currentTextWords.join(" ");
}