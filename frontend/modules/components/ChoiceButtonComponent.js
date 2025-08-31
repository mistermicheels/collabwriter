export class ChoiceButtonComponent {
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
