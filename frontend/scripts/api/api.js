import { USER, EVENT_TYPES } from "../utils/constants.js";
import GlobalEventEmitter from "../utils/EventEmitter.js";

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
}

export const setLocalUsername = (username) => {
    localStorage.setItem('Username', username);
}
export const setLocalPicture = (url) => {
    localStorage.setItem('ProfilePicture', url);
    console.log('set pic to:', url);
}
export const setDefaultPicture = async () => {
    if (getDefaultPicture()){
        console.log('default already loaded');
    }
	await fetchDogPicture().then((url)=>{
        localStorage.setItem('DefaultPicture', url);
        console.log('set default picture: ', url);
    });
}

export const getUserName = () => {
    return localStorage.getItem("Username");
}
export const getUserPicture = () => {
    return localStorage.getItem("ProfilePicture");
}
export const getDefaultPicture = () => {
    return localStorage.getItem("DefaultPicture");
}

export const getAccessToken = () => accessToken;

export const refreshTokens = async () => {
    let response;
    try {
        response = await fetch('http://127.0.0.1:8002/api/token/refresh/', {
            method: "POST",
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error("Token refresh failed");
        }
        const data = await response.json();
        console.info("Refreshed tokens");
        setAccessToken(data.access_token);
    } catch (error) {
        console.log("Failed to refresh tokens,", error);
        deleteUser();       //added
    }
}

window.onload = async () => {
    console.log("Page refreshed, trying to get new tokens....");
    if (!accessToken) {
        try {
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
    if (!accessToken) {
        await refreshTokens();
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${getAccessToken()}`,
    };
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