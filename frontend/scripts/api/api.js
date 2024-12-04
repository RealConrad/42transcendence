import {BASE_JWT_API_URL} from "../utils/constants.js";
import {BASE_OAUTH_JWT_API_URL} from "../utils/constants.js";

import { USER, EVENT_TYPES } from "../utils/constants.js";
import GlobalEventEmitter from "../utils/EventEmitter.js";

let accessToken = null;

const AUTH_METHODS = {
    JWT: 'JWT', //normal
    FORTY_42: '42OAuth',
}

let authMethod = AUTH_METHODS.JWT; // Default authentication method

const setAuthMethod = (method) => {
    if (Object.values(AUTH_METHODS).includes(method)) {
        authMethod = method;
    } else {
        console.error('Invalid authentication method');
    }
};

const getAuthMethod = () => authMethod;

export { AUTH_METHODS, setAuthMethod, getAuthMethod };

export const setAccessToken = (token) => {
    accessToken = token;
}

export const setLocalUsername = (username) => {
    localStorage.setItem('username', username);
}
export const setLocalPicture = (url) => {
    localStorage.setItem('ProfilePicture', url);
}
export const setDefaultPicture = async () => {
    if (!getDefaultPicture()){
        await fetchDogPicture().then((url)=>{
            localStorage.setItem('DefaultPicture', url);
            // console.log('set default picture: ', url);
        });
    }
}

export const getUserName = () => {
    return localStorage.getItem("username");
}
export const getUserPicture = () => {
    return localStorage.getItem("ProfilePicture");
}
export const getDefaultPicture = () => {
    return localStorage.getItem("DefaultPicture");
}

export const getAccessToken = () => accessToken;

export const validateInput = (input) => {
    const sanitized = input.trim();
    const maxLength = 200;
    const minLength = 2;
    if (/[^a-zA-Z0-9 _]/.test(sanitized)) {
        throw new Error("Input contains invalid characters. Only include letters, '_', spaces or numbers.");
    }
    if (sanitized.length === 0) {
        throw new Error("Input name cannot be empty.");
    }
    if (sanitized.length > maxLength) {
        throw new Error(`Input must not exceed ${maxLength} characters.`);
    }
    if (sanitized.length < minLength) {
        throw new Error(`Input must be at least ${minLength} characters.`);
    }
    return sanitized;
}

export const refreshTokens = async () => {
    try {
        const authMethod = localStorage.getItem('authMethod');
        let refreshUrl;

        switch (authMethod) {
            case AUTH_METHODS.JWT:
                refreshUrl = `${BASE_JWT_API_URL}/refresh/`;
                break;

            case AUTH_METHODS.FORTY_42:
                refreshUrl = `${BASE_OAUTH_JWT_API_URL}/refresh/`;
                break;

            default:
                throw new Error("Authentication method not set");
        }

        const response = await fetch(refreshUrl, {
            method: "POST",
            credentials: 'include',
        });
        if (!response.ok) {
            console.log("Error refreshing token from backend:", response.json());
            throw new Error("Token refresh failed");
        }
        const data = await response.json();
        console.info("Refreshed tokens");
        console.log("new_access_token: ", data.access_token);
        setAccessToken(data.access_token);
    } catch (error) {
        console.log("Failed to refresh tokens,", error);
        deleteUser();       //added
        GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
    }
}

window.onload = async () => {
    console.log("Page refreshed, trying to get new tokens....");
    if (!accessToken) {
        try {
            console.log("")
            await refreshTokens();
        } catch (error) {
            console.error("Unable to refresh tokens on page load: ", error);
        }
    } else {
        console.log("Already have access token");
    }
}

/**
 * Handles API calls the server. The caller should convert to json and handle appropriately
 * @param url The URL of the API
 * @param options Any additional headers/payload can be added here
 * @returns {Promise<Response>} The response from the server
 */
export const apiCall = async (url, options = {}) => {
    const authMethod = localStorage.getItem('authMethod');

    if (!accessToken) {
        await refreshTokens();
    }
    
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${getAccessToken()}`,
    };
    
    if (authMethod === AUTH_METHODS.FORTY_42) {
        options.headers['X-42-Token'] = 'true';
    }
    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
        console.warn("Access token expired, refreshing...");
        await refreshTokens();
        options.headers.Authorization = `Bearer ${getAccessToken()}`;
        return fetch(url, options);
    }
    if (!response.ok) {
        const error = await response.json();
        console.error(`API Error: ${response.status}`, error);
        throw new Error(error.error || "API call failed");
    }
    return response;
}

export const fetchDogPicture = async () => {
    const apiURL = "https://dog.ceo/api/breeds/image/random";

    try {
        const response = await fetch(apiURL); // Wait for the fetch request
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        
        const data = await response.json(); // Wait for the JSON parsing
        // console.log('data: ');
        // console.log(data);
        let url = data.message;
        console.log('fetching pic: ', url);
        return url;
        // dogImage.src = data.message; // `message` contains the image URL
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        return null;
    }
}

function deleteUser(){
    accessToken = null;
    USER.username = null;
    USER.profilePicture = null;
    USER.backupProfilePicture = null;
    localStorage.clear();
}