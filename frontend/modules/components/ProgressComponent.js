export class ProgressComponent {
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
