let currentTextWithoutBreaks = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. This line rendered as bold text. The"
let currentTextWords = currentTextWithoutBreaks.split(" ");
let currentTextWithLineBreaks = "";

const textAreaElement = document.getElementById("textArea");
const currentTextElement = document.getElementById("currentText");

const choiceButtonElements = [];

for (let i = 1; i <= 12; i++) {
    document.getElementById("choice" + i);
}

window.addEventListener("resize", () => initializeCurrentText());
window.addEventListener("click", () => addWord());

const socket = new WebSocket("ws://" + location.host + "/socket");

socket.onmessage = function (event) {
    console.log(event);
};

initializeCurrentText();

function initializeCurrentText() {
    const windowHeight = window.innerHeight;
    const headerHeight = document.getElementById("header").clientHeight + 18;
    const progressHeight = document.getElementById("progress").clientHeight + 20;
    const suggestionsHeight = document.getElementById("suggestions").clientHeight;
    const heightAvailableForTextArea = windowHeight - headerHeight - progressHeight - suggestionsHeight;

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

function addWord() {
    const newWord = "newWord";
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

function setTextInModal() {
    document.getElementById("fullTextModalBody").textContent = currentTextWords.join(" ");
}