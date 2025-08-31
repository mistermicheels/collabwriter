export class ModalTextComponent {
    constructor() {
        this._element = document.getElementById("fullTextInModal");
    }

    setFromWords(words) {
        this._element.textContent = words.join(" ");
    }
}
