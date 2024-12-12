import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {BASE_FRIENDS_API_URL, EVENT_TYPES} from "../../utils/constants.js";
import {apiCall, fetchMatchHistory, getAccessToken, showToast, validateInput} from "../../api/api.js";
import GlobalCacheManager from "../../utils/CacheManager.js";

export class FriendsMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.users = [
            { username: "Alice", online: true, status: "pending", profilePicture: "https://via.placeholder.com/40?text=A" },
            { username: "Bob", online: false, status: "incoming", profilePicture: "https://via.placeholder.com/40?text=B" },
            { username: "Charlie", online: true, status: "accepted", profilePicture: "https://via.placeholder.com/40?text=C" }
        ];
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
        this.setupEventListeners();
    }

    html() {
        return `
            <link rel="stylesheet" href="../../../styles/friends.css">
            <link id="style-sheet2" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            ${getAccessToken() ? `
                <div class="container">
                    <div class="flex-container">
                        <input class="input-field" type="text" placeholder="Username">
                        <button id="add-btn" class="orange-button-no-absolute">ADD</button>
                    </div>
                    <div class="friends-list">
                        ${this.displayFriendList()}
                    </div>
                </div>
            ` : `<div class="guest-view">
                    Login first to view this page!
                 </div>`}
            `
    }

    setupEventListeners() {
        const addButton = this.shadowRoot.querySelector("#add-btn");
        if (addButton) {
            addButton.addEventListener("mouseover", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: addButton});
            });
            addButton.addEventListener("mouseout", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: addButton});
            });
            addButton.addEventListener("click", () => {
                this.addFriend();
            });
        }
        const removeButtons = this.shadowRoot.querySelectorAll(".remove-btn");
        removeButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const username = e.target.getAttribute("data-username");
                this.removeFriend(username);
            });
        });

        const acceptButtons = this.shadowRoot.querySelectorAll(".accept-btn");
        acceptButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const username = e.target.getAttribute("data-username");
                this.acceptFriend(username);
            });
        });
    }

    async removeFriend(username) {
        try {
            const response = await apiCall(`${BASE_FRIENDS_API_URL}/remove/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }),
            });

            if (response.ok) {
                this.users = this.users.filter(user => user.username !== username);
                this.render();
                showToast("Friend successfully removed", "success");
            } else {
                showToast("Failed to remove friend", "danger");
            }
        } catch (error) {
            console.error("Error removing friend:", error);
            showToast("An error occurred while removing friend", "danger");
        }
    }

    async acceptFriend(username) {
        try {
            const response = await apiCall(`${BASE_FRIENDS_API_URL}/accept/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }),
            });

            if (response.ok) {
                const user = this.users.find(user => user.username === username);
                if (user) user.status = "accepted";
                this.render();
                showToast(`${username} is now your friend!`, "success");
            } else {
                showToast("Failed to accept friend request", "danger");
            }
        } catch (error) {
            console.error("Error accepting friend:", error);
            showToast("An error occurred while accepting friend request", "danger");
        }
    }

    async addFriend() {
        const input = this.shadowRoot.querySelector('input');
        try {
            validateInput(input.value);
            const response = await apiCall(`${BASE_FRIENDS_API_URL}/add/`, {
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'username': input.value
                }),
            });
            if (!response.ok) {
                throw new Error(response.json());
            }
            showToast('Sent friend invite', 'success');
            const updatedFriendList = await fetchMatchHistory();
            GlobalCacheManager.set("matches", updatedFriendList);
            this.render();
        } catch (error) {
            showToast('Error when sending friend invite', 'danger');
            console.error(error);
        }
    }

    displayFriendList() {
        return this.users.map(user => `
            <div class="user-item">
                <div class="profile-container">
                    <img class="profile-picture" src="${user.profilePicture}" alt="">
                    <span class="status-dot ${user.online && (user.status !== "pending" || user.status !== "incoming") ? 'green' : 'grey'}"></span>
                </div>
                <div class="username">${user.username}</div>
                ${user.status === "pending" ? `
                    <span class="pending">(pending)</span>
                `:""}
                <div class="action-buttons">
                    ${user.status === "accepted" ? `
                        <button class="btn btn-danger btn-sm remove-btn" data-username="${user.username}">✖</button>
                    ` : user.status === "incoming" ? `
                        <button class="btn btn-success btn-sm accept-btn" data-username="${user.username}">✔</button>
                        <button class="btn btn-danger btn-sm remove-btn" data-username="${user.username}">✖</button>
                    ` : user.status === "pending" ? `
                        <button class="btn btn-danger btn-sm remove-btn" data-username="${user.username}">✖</button>
                    ` : ""}
                </div>
            </div>
        `).join('');
    }
}

customElements.define('friends-menu', FriendsMenu);