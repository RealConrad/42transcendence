import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {BASE_FRIENDS_API_URL, EVENT_TYPES} from "../../utils/constants.js";
import {apiCall, fetchMatchHistory, getAccessToken, validateInput} from "../../api/api.js";
import GlobalCacheManager from "../../utils/CacheManager.js";

export class FriendsMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.users = [
            { username: "Alice", online: true, status: "pending", profilePicture: "https://via.placeholder.com/40?text=A" },
            { username: "Bob", online: false, status: "accepted", profilePicture: "https://via.placeholder.com/40?text=B" },
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
    }

    async addFriend() {
        const input = this.shadowRoot.querySelector('input');
        try {
            validateInput(input.value);
            await apiCall(`${BASE_FRIENDS_API_URL}/add/`, {
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'username': input.value
                }),
            });
            const updatedFriendList = await fetchMatchHistory();
            GlobalCacheManager.set("matches", updatedFriendList);
            this.render();
        } catch (error) {
            // TODO: toast
            console.error(error);
        }
    }

    displayFriendList() {
        return this.users.map(user => `
            <div class="user-item">
                <div class="profile-container">
                    <img class="profile-picture" src="${user.profilePicture}" alt="">
                    <span class="status-dot ${user.online && user.status !== "pending" ? 'green' : 'grey'}"></span>
                </div>
                <div class="username">${user.username}</div>
                ${user.status === "pending" ? `
                    <span class="pending">(pending)</span>
                `:""}
            </div>
        `).join('');
    }
}

customElements.define('friends-menu', FriendsMenu);