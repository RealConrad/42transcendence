export const PADDLE_SPEED = 10;
export const PADDLE_HEIGHT = 100;
export const PADDLE_WIDTH = 10;

export const MAX_SCORE = 100;

export const FORM_ERROR_MESSAGES = {
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",
    invalidUsername: "Invalid characters in username",
    invalidPassword: "Invalid characters in password",
    passwordsDoNotMatch: "Passwords do not match",
}

export const EVENT_TYPES = {
    CURSOR_MOVE: "cursor.move",
    CURSOR_HOVER: "cursor.hover",
    CURSOR_UNHOVER: "cursor.unhover",
    START_MATCH: "start.match",
    MATCH_VS_AI: "match.vs.ai",
    MATCH_LOCAL: "match.local",
    QUIT_MATCH: "quit.match",
    UPDATE_SCORE: "update.score",
    MATCH_TOURNAMENT: "match.tournament",
    START_TOURNAMENT: "start.tournament",
    SHOW_GAME_MENU: "show.game.menu",
    TOGGLE_GAME_MENU: "toggle.game.menu",
    TOURNAMENT_UPDATE: "tournament.update",
    RESUME_GAME: "resume.game",
    PAUSE_GAME: "pause.game",
}

export const BASE_AUTH_API_URL = "http://127.0.0.1:8000/api/auth"
export const BASE_GAME_API_URL = "http://127.0.0.1:8003/api/game"
export const BASE_MFA_API_URL = "http://127.0.0.1:8001/api/2fa"