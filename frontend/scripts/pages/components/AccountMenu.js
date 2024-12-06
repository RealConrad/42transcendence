import {apiCall, getAccessToken, setLocalPicture, get2FAstatus, getLocal2FA, setLocal2FA, disable2FA} from "../../api/api.js";
import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {BASE_AUTH_API_URL, EVENT_TYPES, USER} from "../../utils/constants.js";

export class AccountMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.accessToken = null;
        this.imgUrl = null;
        this.username = null;
    }
    connectedCallback() {
        this.accessToken = getAccessToken();
        this.username = USER.username;
        this.imgUrl = USER.profilePicture;
        this.render();
        if (USER.username)
            this.setupEventListeners();
        this.setupProfilePicture();
        // GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
        //TODO:  Dummy data, hookup to API
        this.renderPreviousMatches([
            { player1: 'Conradasdasdasdasdasdasd', score1: 9, player2: 'Guest', score2: 10 },
            { player1: 'Conrad', score1: 15, player2: 'Konrad', score2: 7 },
            { player1: 'Conrad', score1: 12, player2: 'this is a very vert vert long name', score2: 12 },
            { player1: 'Conrad', score1: 12, player2: 'Konrad', score2: 12 },
            { player1: 'Conrad', score1: 12, player2: 'Konrad', score2: 12 },
            { player1: 'Conrad', score1: 19, player2: 'Konrad', score2: 12 },
            { player1: 'Conrad', score1: 1, player2: 'Konrad', score2: 12 },
            { player1: 'Conrad', score1: 46, player2: 'Konrad', score2: 23 },
            { player1: 'Conrad', score1: 12, player2: 'Konrad', score2: 12 },
            { player1: 'Conrad', score1: 2, player2: 'Konrad', score2: 33 },
            { player1: 'Conrad', score1: 12, player2: 'Konrad', score2: 3 },
            { player1: 'Conrad', score1: 12, player2: 'Konrad', score2: 12 },
            { player1: 'Conrad', score1: 6, player2: 'Konrad', score2: 56 },
            { player1: 'Conrad', score1: 88, player2: 'Konrad', score2: 66 },
        ]);
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
    }

html() {
    return `
        <link rel="stylesheet" href="../../../styles/account.css">
        <!--<link id="style-sheet" rel="stylesheet" href="../../../styles/style.css">-->

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
                        <div>
                            ${this.username}
                        </div>
                    </div>
                    <div>
                        <button class="orange-2FA-button" id="TwoFactorAuthButton">Enable 2FA</button>
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
        }
        
        renderPreviousMatches(matches) {
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
                // TODO: CREATE API TO UPLOAD PROFILE PICTURE
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