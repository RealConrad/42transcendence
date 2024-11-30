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
    CURSOR_MOVE: "cursor.move",
    CURSOR_HOVER: "cursor.hover",
    CURSOR_UNHOVER: "cursor.unhover",
    START_MATCH: "start.match",
    MATCH_VS_AI: "match.vs.ai",
    MATCH_LOCAL: "match.local",
    QUIT_MATCH: "quit.match",
    UPDATE_SCORE: "update.score",
}

export const USER = {
    username: null,
    profilePicture: null,
    backupProfilePicture: null,
}

export const BASE_AUTH_API_URL = "http://127.0.0.1:8000/api/auth"
export const BASE_GAME_API_URL = "http://127.0.0.1:8003/api/game"
export const BASE_MFA_API_URL = "http://127.0.0.1:8001/api/2fa"