import { Page } from "./modules/Page.js";
import { State } from "./modules/State.js";

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
