export class ActiveUsersComponent {
    constructor() {
        this._element = document.getElementById("activeUsers");
    }

    setNumberActiveUsers(numberActiveUsers) {
        this._element.textContent = numberActiveUsers;
    }
}
