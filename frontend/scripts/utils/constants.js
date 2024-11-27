export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const PADDLE_SPEED = 20;
export const PADDLE_HEIGHT = 100;
export const PADDLE_WIDTH = 5;

export const MAX_SCORE = 1;

export const FORM_ERROR_MESSAGES = {
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",
    invalidUsername: "Invalid characters in username",
    invalidPassword: "Invalid characters in password",
    passwordsDoNotMatch: "Passwords do not match",
}

export const BASE_AUTH_API_URL = "http://127.0.0.1:8000/api/auth"
export const BASE_GAME_API_URL = "http://127.0.0.1:8003/api/game"
export const BASE_MFA_API_URL = "http://127.0.0.1:8001/api/2fa"