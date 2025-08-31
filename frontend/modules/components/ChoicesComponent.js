import { ChoiceButtonComponent } from "./ChoiceButtonComponent.js";

export class ChoicesComponent {
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
