import {
    apiCall,
    getAccessToken,
    setLocalPicture,
    get2FAstatus,
    getLocal2FA,
    setLocal2FA,
    disable2FA,
    logout, validateInput, showToast
} from "../../api/api.js";
import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {BASE_AUTH_API_URL, EVENT_TYPES, USER} from "../../utils/constants.js";
import GlobalCacheManager from "../../utils/CacheManager.js";

export class AccountMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.accessToken = null;
        this.imgUrl = null;
        this.displayName = null;
    }
    connectedCallback() {
        this.accessToken = getAccessToken();
        this.username = USER.username;
        this.displayName = USER.displayname;
        this.imgUrl = USER.profilePicture;
        this.render();
        if (this.accessToken){
            this.setupEventListeners();
            this.renderPreviousMatches();
            this.setupProfilePicture();
        }
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
    }

html() {
    return `
        <link rel="stylesheet" href="../../../styles/account.css">
        <link id="style-sheet2" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        ${!this.accessToken ? 
            `
                <div class="guest-view">
                    Login first to view this page!
                </div>
            `
            :
            `
                <div class="container">
                    <div class="heading">
                        <div class="profile-picture" id="profile-picture-id">
                            <img src="${this.imgUrl}" alt=""> 
                            <span class="initial"></span>
                        </div>
                        <div class="username-container">
                            <span id="username-display">${this.displayName}</span>
                            <input id="username-input" type="text" value="${this.displayName}" style="display: none;">
                            <svg id="edit-username-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                            </svg>
                            <div id="username-edit-buttons" style="display: none;">
                                <button id="save-username" class="btn btn-success btn-sm">✔</button>
                                <button id="cancel-username" class="btn btn-danger btn-sm">✖</button>
                            </div>
                        </div>
                    </div>
                    <div class="flex-container">
                        <button class="orange-2FA-button" id="TwoFactorAuthButton">Enable 2FA</button>
                        <button class="orange-2FA-button" id="logout">Logout</button>
                    </div>
                    <div class="total-match-stats">
                        <div class="matches-won">
                            MATCHES 
                            <div>WON</div>
                            <div class="score" id="matches-won">0</div>
                        </div>
                        <div class="matches-lost">
                            MATCHES 
                            <div>LOST</div>
                            <div class="score" id="matches-lost">0</div>
                        </div>
                    </div>
                    <div class="tournament-stats">
                        <div class="tournaments">
                            TOURNAMENTS
                            <div id="tournament-stats">0 won of 0 played</div>
                        </div>
                    </div>
                    <div class="previous-matches-container">
                        <div class="previous-matches-heading">Previous Matches</div>
                        <div class="previous-matches" id="previous-matches">
                            <!-- Matches will be dynamically rendered here -->
                        </div>
                    </div>
                </div>
            `
            }
        `;
}


    toggle2faButton(status){
        const TwoFactorAuthButton = this.shadowRoot.getElementById("TwoFactorAuthButton");
        if (!TwoFactorAuthButton) return;
        if (status == false)
            TwoFactorAuthButton.innerHTML = "Enable 2FA";
        if (status == true)
            TwoFactorAuthButton.innerHTML = "Disable 2FA";

    }

    setupEventListeners(){
        const TwoFactorAuthButton = this.shadowRoot.getElementById("TwoFactorAuthButton");
        const logoutButton = this.shadowRoot.getElementById("logout");
        if (!getLocal2FA()){
            setLocal2FA(false);
        }
        if (getLocal2FA() == 'false')
            this.toggle2faButton(false);
        else if(getLocal2FA() == 'true')
            this.toggle2faButton(true);
        TwoFactorAuthButton.addEventListener("mouseover", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: TwoFactorAuthButton});
        });
        TwoFactorAuthButton.addEventListener("mouseout", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: TwoFactorAuthButton});
        });
        logoutButton.addEventListener("mouseover", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: logoutButton});
        });
        logoutButton.addEventListener("mouseout", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: logoutButton});
        });

        logoutButton.addEventListener('click', () => {
            logout();
        })

        TwoFactorAuthButton.addEventListener("click", () => {
            if (getLocal2FA() == 'false'){
                GlobalEventEmitter.emit(EVENT_TYPES.SET_TWOFACTOR, { element: TwoFactorAuthButton });
            }
            else if (getLocal2FA() == 'true'){
                disable2FA().then((success) => {
                    if (success == true){
                        this.toggle2faButton(false);
                        GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
                    }
                })
            }
        });

        // Edit username elements
        const editIcon = this.shadowRoot.getElementById("edit-username-icon");
        const usernameDisplay = this.shadowRoot.getElementById("username-display");
        const usernameInput = this.shadowRoot.getElementById("username-input");
        const editButtons = this.shadowRoot.getElementById("username-edit-buttons");
        const saveButton = this.shadowRoot.getElementById("save-username");
        const cancelButton = this.shadowRoot.getElementById("cancel-username");

        // Edit username logic
        editIcon.addEventListener("click", () => {
            usernameDisplay.style.display = "none";
            usernameInput.style.display = "block";
            editButtons.style.display = "inline-flex";
            editIcon.style.display = "none";
        });

        saveButton.addEventListener("click", async () => {
            const newDisplayName = usernameInput.value.trim();
            if (newDisplayName && newDisplayName !== this.username) {
                try {
                    validateInput(newDisplayName);
                    const response = await apiCall(`${BASE_AUTH_API_URL}/update_displayname/`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ displayname: newDisplayName }),
                    });

                    if (response.ok) {
                        localStorage.setItem('displayName', newDisplayName);
                        // this.username = newDisplayName;
                        // USER.username = newDisplayName;
                        usernameDisplay.textContent = newDisplayName;
                        GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
                    } else {
                        showToast('Failed to update display name, try again later', 'danger');
                        console.error("Failed to update username");
                    }
                } catch (error) {
                    showToast(error, 'danger');
                    console.error("Error updating username:", error);
                }
            }
            // Revert to display mode
            usernameDisplay.style.display = "block";
            usernameInput.style.display = "none";
            editButtons.style.display = "none";
            editIcon.style.display = "inline";
        });

        cancelButton.addEventListener("click", () => {
            // Revert to original username
            usernameInput.value = this.username;
            usernameDisplay.style.display = "block";
            usernameInput.style.display = "none";
            editButtons.style.display = "none";
            editIcon.style.display = "inline";
        });

    }

    async renderPreviousMatches() {
        const data = GlobalCacheManager.get("matches");
        if (!data)
            return;

        const totalMatchWins = data.total_matches.wins;
        const totalMatchLosses = data.total_matches.losses;

        const totalWinsElement = this.shadowRoot.getElementById("matches-won");
        totalWinsElement.textContent = `${totalMatchWins}`;

        const totalLossesElement = this.shadowRoot.getElementById("matches-lost");
        totalLossesElement.textContent = `${totalMatchLosses}`;

        const tournamentsPlayed = data.tournaments.tournaments_played;
        const tournamentsWon = data.tournaments.tournaments_won;
        const tournamentStatsElement = this.shadowRoot.getElementById("tournament-stats");
        tournamentStatsElement.textContent = `${tournamentsWon} won of ${tournamentsPlayed} played`;

        // Extract and process matches data
        const matches = data.games.reverse().map(game => ({
            player1: game.player1_username,
            score1: game.player1_score,
            player2: game.player2_username,
            score2: game.player2_score
        }));

        const matchesContainer = this.shadowRoot.getElementById('previous-matches');
        if (!matchesContainer) {
            return;
        }
        matchesContainer.innerHTML = matches.map(match => {
            const winnerClass = match.score1 > match.score2 ? 'winner' : 'loser';
            const loserClass = match.score1 > match.score2 ? 'loser' : 'winner';

            return `
                <div class="match">
                    <div class="${winnerClass}">
                        <span class="player-name" title="${match.player1}">${match.player1}</span>
                        <span class="player-score">${match.score1}</span>
                    </div>
                    <div class="vs">vs</div>
                    <div class="${loserClass}">
                        <span class="player-score">${match.score2}</span>
                        <span class="player-name" title="${match.player2}">${match.player2}</span>
                    </div>
                </div>
            `;
        }).join('');
    }


    setupProfilePicture() {
        const profilePicture = this.shadowRoot.querySelector("#profile-picture-id");
        if (!profilePicture) {
            return;
        }
        const imgElement = profilePicture.querySelector("img");
        const initialElement = profilePicture.querySelector(".initial");

        initialElement.textContent = "?"
        if (!this.imgUrl) {
            imgElement.src = "";
            imgElement.style.display = "none";
            initialElement.style.display = "flex";
        } else {
            imgElement.src = this.imgUrl;
            imgElement.style.display = "block";
            initialElement.style.display = "none";
        }

        profilePicture.addEventListener('mouseover', (e) => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, {element: profilePicture})
        });
        profilePicture.addEventListener('mouseout', (e) => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, {element: profilePicture})
        });
        const fileInput = document.createElement('input');
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = 'none'
        profilePicture.addEventListener('click', () => {
            fileInput.click();
        });
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                console.log("FILE: ", file);
                const formData = new FormData();
                formData.append("file", file);

                apiCall(`${BASE_AUTH_API_URL}/save_profile_pic/`, {
                    method: "POST",
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        setLocalPicture(data.profile_picture);
                        GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
                    })
                    .catch(error => {
                        console.error("Error uploading profile picture:", error);
                    })
            }
        });
    }
}

customElements.define('account-menu', AccountMenu);