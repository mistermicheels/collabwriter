import { ActiveUsersComponent } from "./ActiveUsersComponent.js";

export class HeaderComponent {
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
