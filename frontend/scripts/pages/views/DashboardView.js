import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";
import Game from "../../game/Game.js";
import Tournament from "../../game/Tournament.js";
import {getUserName, getUserPicture,getDefaultPicture, setDefaultPicture} from "../../api/api.js";
import { USER } from "../../utils/constants.js";


export class DashboardView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.isGameRunning = false;
        this.canvas = null;
        this.ctx = null;
        this.leftPaddle = null;
        this.rightPaddle = null;
        this.resizeObserver = null;
        this.isTournamentMatch = false;
        this.matchDataForMenuDialog = null;
        this.isGameMenuOpen = false;
        setDefaultPicture();
    }

    connectedCallback() {
        this.getUserInfo();
        this.loadMenuComponents();
        this.render();
        const styleSheet = this.shadowRoot.getElementById('style-sheet');
        if (styleSheet.sheet) {
            this.initMenu();
            this.showAllDashboardUI();
        } else {
            styleSheet.addEventListener('load', () => {
                this.initMenu();
                this.showAllDashboardUI();
            });
        }
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.onResumeGame = this.onResumeGame.bind(this);
        window.addEventListener("keydown", this.handleKeyDown);
    }

    disconnectedCallback() {
        window.removeEventListener('keydown', this.handleKeyDown);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
    
    render() {
        this.shadowRoot.innerHTML = this.html();
        this.setupEventListeners();
    }

    getUserInfo(){
        USER.username = getUserName();
        USER.profilePicture = getUserPicture();
        USER.backupProfilePicture = getDefaultPicture();
    }
    
    html() {
        return `
            <link id="style-sheet" rel="stylesheet" href="../../../styles/style.css">
            ${USER.username ? `
            <!--HERE DEACTIVATING BUTTON CLICK AFTER LOGIN-->
            <style>
                #login-button{ pointer-events: none }
            </style>
            ` : ``}
            <header>
                <div class="header-top">
                    <span id="player1-display" class="player1_score">Player 1 - 0</span>
                        <div class="title">PONG</div>
                    <span id="player2-display" class="player2_score">Player 2 - 0</span>
                </div>
            
            ${!USER.username ?
            `<button id="login-button" class="orange-button">
                LOGIN
            </button>` :
            `<button id="login-button" class="user-display">
                <img src="${USER.profilePicture ? `${USER.profilePicture}`: `${USER.backupProfilePicture}`}">
                <div>${USER.username}</div>
            </button>`
            }
            </header>
            <main-menu>
                <canvas id="gameCanvas"></canvas>
                <auth-dialog id="auth-dialog"></auth-dialog>
                <game-setup-dialog id="game-setup-dialog"></game-setup-dialog>
                <tournament-setup-dialog id="tournament-setup-dialog"></tournament-setup-dialog>
                <game-menu-dialog id="game-menu-dialog"></game-menu-dialog>
                <left-menu>
                    <div class="menu-option">
                        <button>HowTo</button>
                        <span class="button-description">What is this?</span>
                    </div>
                    <div class="menu-option">
                        <button>Play</button>
                        <span class="button-description">How would you like your PONG today?</span>
                    </div>
                    <div class="menu-option">
                        <button>Account</button>
                        <span class="button-description">Who are you anyway?</span>
                    </div>
                    <div class="menu-option" style="grid-row-start: 4;">
                        <button>About</button>
                        <span class="button-description">ft_transcendence at 42 Heilbronn</span>
                    </div>
                </left-menu>
                <right-menu>
                    <div id="right-menu-container"></div>
                </right-menu>
            </main-menu>
            <footer>
            <div class="footer-container">
            <div class="footer-label">Created By</div>
            <div class="team">
            <a href="https://github.com/RealConrad/" target="_blank" class="teammate teammate1">cwenz</a>
            <a href="https://www.github.com/kglebows/" target="_blank" class="teammate teammate2">kglebows</a>
            <a href="https://www.github.com/harshkumbhani/" target="_blank" class="teammate teammate3">hkumbhan</a>
            <a href="https://github.com/vivilenard/" target="_blank" class="teammate teammate4">vivi</a>
            <a href="https://github.com/PetruCazac/" target="_blank" class="teammate teammate5">pcazac</a>
            </div>
            </div>
            </footer>
        `;
    }

    loadMenuComponents() {
        import("../components/GameMenuDialog.js");
        import("../components/GameSetupDialog.js");
        import("../components/TournamentSetupDialog.js");
        import("../components/AuthDialog.js");
        import("../components/HowToMenu.js");
        import("../components/PlayMenu.js");
        import("../components/AccountMenu.js");
        import("../components/AboutMenu.js");
    }

    setupEventListeners() {
        const loginButton = this.shadowRoot.getElementById("login-button");
        const authDialogPopup = this.shadowRoot.getElementById("auth-dialog");
        const contributor = this.shadowRoot.querySelector(".team");
        const tournamentSetupDialog = this.shadowRoot.getElementById("tournament-setup-dialog");
        loginButton.addEventListener("click", () => {
            authDialogPopup.open();
        });
        loginButton.addEventListener("mouseover", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: loginButton});
        });
        loginButton.addEventListener("mouseout", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: loginButton});
        });

        // Emit
        contributor.addEventListener("mouseover", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: contributor});
        });
        contributor.addEventListener("mouseout", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: contributor});
        });

        // Listen for

        GlobalEventEmitter.replaceOn(EVENT_TYPES.SET_TWOFACTOR, () => {
            authDialogPopup.openEnable2fa();
        });
        GlobalEventEmitter.on(EVENT_TYPES.MATCH_VS_AI, () => {
            this.openGameSetupDialog("vs AI");
        });
        GlobalEventEmitter.on(EVENT_TYPES.MATCH_LOCAL, () => {
            this.openGameSetupDialog("local");
        });
        GlobalEventEmitter.on(EVENT_TYPES.MATCH_TOURNAMENT, () => {
            tournamentSetupDialog.open();
        });
        GlobalEventEmitter.on(EVENT_TYPES.START_MATCH, ({ player1Name, player2Name, matchType, AIDifficulty, powerUpCount }) => {
            this.startGame(player1Name, player2Name, matchType !== "local", AIDifficulty, powerUpCount);
        });
        GlobalEventEmitter.on(EVENT_TYPES.START_TOURNAMENT, ({ players: players, powerCounts}) => {
            tournamentSetupDialog.close();
            this.startTournament(players, powerCounts);
        });
        GlobalEventEmitter.on(EVENT_TYPES.QUIT_MATCH, () => {
            this.endGame();
        });
        GlobalEventEmitter.on(EVENT_TYPES.GAME_OVER, () => {
            this.isGameRunning = false;
        });
        GlobalEventEmitter.on(EVENT_TYPES.UPDATE_SCORE, ({ player1Name, player2Name, player1Score, player2Score }) => {
            this.updateScores(player1Name, player2Name, player1Score, player2Score);
        });
        GlobalEventEmitter.on(EVENT_TYPES.TOURNAMENT_UPDATE, (data) => {
            this.matchDataForMenuDialog = data;
            const gameMenuDialog = this.shadowRoot.getElementById("game-menu-dialog");
            if (gameMenuDialog) {
                gameMenuDialog.updateTournamentData(this.matchDataForMenuDialog);
            }
        });
        GlobalEventEmitter.on(EVENT_TYPES.RESUME_GAME, () => this.onResumeGame());
        GlobalEventEmitter.on(EVENT_TYPES.QUIT_GAME, () => this.quitGame());
        GlobalEventEmitter.replaceOn(EVENT_TYPES.RELOAD_DASHBOARD, () => {
            this.connectedCallback()
        });
    }

    handleKeyDown(event) {
        if (event.key === "Escape" && this.isGameRunning) {
            this.toggleGameMenu();
        }
    }


    toggleGameMenu() {
        const gameMenuDialog = this.shadowRoot.getElementById("game-menu-dialog");
        if (this.isGameMenuOpen) {
            gameMenuDialog.close();
            // 'RESUME_GAME' event will be emitted from GameMenuDialog
            // 'onResumeGame' will handle the rest
        } else {
            gameMenuDialog.matchType = this.isTournamentMatch;
            gameMenuDialog.open();
            this.isGameMenuOpen = true;
            GlobalEventEmitter.emit(EVENT_TYPES.PAUSE_GAME);
        }
    }

    quitGame() {
        this.isGameRunning = false;
        this.showAllDashboardUI();
    }

    onResumeGame() {
        this.isGameMenuOpen = false;
    }

    openGameSetupDialog(matchType) {
        const gameSetupDialog = this.shadowRoot.getElementById("game-setup-dialog");
        gameSetupDialog.setMatchType(matchType);
        gameSetupDialog.open();
    }

    initMenu() {
        this.canvas = this.shadowRoot.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        const updateCanvasSize = () => {
            this.canvas.width = this.shadowRoot.host.offsetWidth;
            this.canvas.height = this.shadowRoot.host.offsetHeight;
            this.drawMiddleLine();
        };

        requestAnimationFrame(updateCanvasSize);
        window.addEventListener("resize", updateCanvasSize);

        this.leftPaddle = this.createPaddle("left");
        this.rightPaddle = this.createPaddle("right");

        this.initializePaddleMovement();
        this.initializeMenuInteractions();

        const resizeObserver = new ResizeObserver(() => {
            updateCanvasSize();
        });
        resizeObserver.observe(this.shadowRoot.host);
        this.resizeObserver = resizeObserver;
    }

    drawMiddleLine() {
        const paddleWidth = this.canvas.width / 128;
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = paddleWidth;
        this.ctx.setLineDash([paddleWidth, paddleWidth]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset line dash
    }

    createPaddle(side) {
        const paddle = document.createElement("div");
        paddle.classList.add("paddle");
        paddle.style.height = `100px`;
        paddle.style.top = `${(this.canvas.height - paddle.offsetHeight) / 2}px`; // Center vertically
        if (side === "left") {
            this.shadowRoot.querySelector("left-menu").appendChild(paddle);
            paddle.style.left = '0px';

        } else if (side === "right") {
            this.shadowRoot.querySelector("right-menu").appendChild(paddle);
            paddle.style.right = '0px';
        }
        return paddle;
    }

    initializePaddleMovement() {
        document.addEventListener("mousemove", (e) => {
            const canvasRect = this.canvas.getBoundingClientRect();
            const footerHeight = this.shadowRoot.querySelector("footer").offsetHeight;
            const paddleHeight = this.leftPaddle.offsetHeight;
            const mouseY = e.clientY - canvasRect.top;

            // Calculate the max Y position to prevent paddle from overlapping the footer
            const maxY = this.canvas.height - paddleHeight - footerHeight - 80;

            // Move the left paddle if the cursor is on the left menu side
            if (e.clientX <= canvasRect.left + canvasRect.width / 2) {
                this.leftPaddle.style.top = `${Math.max(
                    0,
                    Math.min(mouseY - paddleHeight / 2, maxY)
                )}px`;
            }

            // Move the right paddle if the cursor is on the right menu side
            if (e.clientX >= canvasRect.left + canvasRect.width / 2) {
                this.rightPaddle.style.top = `${Math.max(
                    0,
                    Math.min(mouseY - paddleHeight / 2, maxY)
                )}px`;
            }
        });
    }

    initializeMenuInteractions() {
        const leftMenu = this.shadowRoot.querySelector("left-menu");
        const rightMenuContainer = this.shadowRoot.getElementById("right-menu-container");

        // Map button text to custom elements
        const contentMapping = {
            "HowTo": "how-to-menu",
            "Play": "play-menu",
            "Account": "account-menu",
            "About": "about-menu",
        };

        leftMenu.addEventListener("mouseover", (event) => {
            const option = event.target.closest(".menu-option");
            if (option) {
                const buttonText = option.querySelector("button").textContent.trim();
                this.updateRightMenuContent(rightMenuContainer, contentMapping[buttonText]);
            }
        });
    }

    updateRightMenuContent(container, menuTag) {
        if (menuTag) {
            container.innerHTML = "";
            const menuComponent = document.createElement(menuTag);
            container.appendChild(menuComponent);
        }
    }

    startGame(player1Name, player2Name, vsAI, aiDifficulty = 5, powerUpCount) {
        this.hideAllDashboardUI();
        this.isGameRunning = true;
        this.isTournamentMatch = false;

        const player1 = {
            username: player1Name,
            isAI: false,
            aiDifficulty: null,
            id: 0,
        };
        const player2 = {
            username: player2Name,
            isAI: vsAI,
            aiDifficulty: aiDifficulty,
            id: 1,
        };
        this.updateScores(player1Name, player2Name, 0, 0);
        const game = new Game(this.canvas, player1, player2, false, powerUpCount);
        game.start();
    }

    startTournament(players, powerUpCount) {
        this.hideAllDashboardUI();
        this.isGameRunning = true;
        this.isTournamentMatch = true;
        const tournament = new Tournament(players, this.canvas, powerUpCount);
        tournament.start();
    }

    updateScores(player1Name, player2Name, player1Score, player2Score) {
        const player1Display = this.shadowRoot.getElementById("player1-display");
        const player2Display = this.shadowRoot.getElementById("player2-display");

        player1Display.textContent = `${player1Name} - ${player1Score}`;
        player2Display.textContent = `${player2Name} - ${player2Score}`;
    }

    endGame() {
        this.isGameRunning = false;
        this.showAllDashboardUI();
    }

    hideAllDashboardUI() {
        this.leftPaddle.style.display = "none";
        this.rightPaddle.style.display = "none";
        this.shadowRoot.querySelector("#login-button").style.display = "none";
        this.shadowRoot.querySelector("left-menu").style.display = "none";
        this.shadowRoot.querySelector("right-menu").style.display = "none";
        this.shadowRoot.querySelector(".player1_score").style.display = "block";
        this.shadowRoot.querySelector(".player2_score").style.display = "block";
    }

    showAllDashboardUI() {

        this.leftPaddle.style.display = "block";
        this.rightPaddle.style.display = "block";
        this.shadowRoot.querySelector("#login-button").style.display = "flex"; //changed here from block to flex
        this.shadowRoot.querySelector("left-menu").style.display = "grid";
        this.shadowRoot.querySelector("right-menu").style.display = "block";
        this.shadowRoot.querySelector(".player1_score").style.display = "none";
        this.shadowRoot.querySelector(".player2_score").style.display = "none";
        this.canvas.width = this.shadowRoot.host.offsetWidth;
        this.canvas.height = this.shadowRoot.host.offsetHeight;

        // Use requestAnimationFrame to ensure the browser has painted and the canvas is ready
        requestAnimationFrame(() => {
            this.drawMiddleLine();
        });
    }
}

customElements.define("dashboard-view", DashboardView);