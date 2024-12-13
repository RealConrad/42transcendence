export const PADDLE_SPEED = 10;
export const PADDLE_HEIGHT = 100;
export const PADDLE_WIDTH = 10;

export const MAX_SCORE = 1000;

export const FORM_ERROR_MESSAGES = {
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",
    invalidUsername: "Invalid characters in username",
    invalidPassword: "Invalid characters in password",
    passwordsDoNotMatch: "Passwords do not match",
}

export const EVENT_TYPES = {
    CURSOR_MOVE: "cursor_move",
    CURSOR_HOVER: "cursor_hover",
    CURSOR_UNHOVER: "cursor_unhover",
    START_MATCH: "start_match",
    MATCH_VS_AI: "match_vs_ai",
    MATCH_LOCAL: "match_local",
    QUIT_MATCH: "quit_match",
    UPDATE_SCORE: "update_score",
    MATCH_TOURNAMENT: "match_tournament",
    START_TOURNAMENT: "start_tournament",
    SHOW_GAME_MENU: "show_game_menu",
    TOGGLE_GAME_MENU: "toggle_game_menu",
    TOURNAMENT_UPDATE: "tournament_update",
    RESUME_GAME: "resume_game",
    PAUSE_GAME: "pause_game",
    QUIT_GAME: "quit_game",
    GAME_OVER: "game_over",
    RELOAD_DASHBOARD: "reload_dashboard",
    SET_TWOFACTOR: "enable_twofactor",
    UNSET_TWOFACTOR: "disable_twofactor",
}

export const USER = {
    username: null,
    profilePicture: null,
    backupProfilePicture: null,
}

export const BASE_AUTH_API_URL = "http://127.0.0.1:8000/api/auth"
export const BASE_GAME_API_URL = "http://127.0.0.1:8003/api/game"
export const BASE_MFA_API_URL = "http://127.0.0.1:8001/api/2fa"
export const BASE_JWT_API_URL = "http://127.0.0.1:8002/api/token"
export const BASE_OAUTH_JWT_API_URL = "http://127.0.0.1:8002/api/oauth_token"
export const BASE_FRIENDS_API_URL = "http://127.0.0.1:8004/api/friends"