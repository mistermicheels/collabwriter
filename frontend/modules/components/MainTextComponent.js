export class MainTextComponent {
    constructor() {
        this._areaElement = document.getElementById("textArea");
        this._textElement = document.getElementById("currentText");
        this._textWithLineBreaks = "";
    }

    initializeFromWords(words, availableHeight, { scrollbarWorkaround = false } = {}) {
        if (scrollbarWorkaround) {
            document.body.classList.add("force-scrollbar");
        }

        this._textElement.textContent = "";
        this._textWithLineBreaks = "";
        const minimumInitialWords = 50;

        // add words in reverse order so we always show the last part of the text
        for (let i = words.length - 1; i >= 0; i--) {
            const previousHeight = this._areaElement.clientHeight;
            const previousWidth = this._areaElement.clientWidth;

            const currentWord = words[i];
            this._textElement.textContent = currentWord + " " + this._textWithLineBreaks;
            const newHeight = this._areaElement.clientHeight;
            const newWidth = this._areaElement.clientWidth;

            const shownWords = words.length - i;

            if (newWidth < previousWidth) {
                // a scrollbar has appeared, potentially messing up our earlier line breaks
                // start over and force scrollbar from the start
                this.initializeFromWords(words, availableHeight, { scrollbarWorkaround: true });
                return;
            } else if (newHeight === previousHeight) {
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

        if (scrollbarWorkaround) {
            document.body.classList.remove("force-scrollbar");
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
