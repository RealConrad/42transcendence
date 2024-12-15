import {
    BASE_FRIENDS_API_URL,
    BASE_GAME_API_URL,
    BASE_JWT_API_URL,
    BASE_MFA_API_URL,
    BASE_OAUTH_JWT_API_URL,
    EVENT_TYPES,
    USER
} from "../utils/constants.js";
import GlobalEventEmitter from "../utils/EventEmitter.js";
import GlobalCacheManager from "../utils/CacheManager.js";

let accessToken = null;
let oauthData2FA = null;


const AUTH_METHODS = {
    JWT: 'JWT', //normal
    FORTY_42: '42OAuth',
}

export const validateInput = (input) => {
    const sanitized = input.trim();
    const maxLength = 200;
    const minLength = 1;
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
            throw new Error("User not logged in. Guest mode");
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
    setAccessToken(data.access_token);
}

window.onload = async () => {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
        <div class="spinner"></div>
        <p>Loading, please wait...</p>
    `;
    document.body.appendChild(overlay);

    const style = document.createElement('style');
    style.innerHTML = `
        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    console.log("Page refreshed, trying to get new tokens....");
    try {
        if (!accessToken) {
            await refreshTokens();
            await GlobalCacheManager.initialize("matches", fetchMatchHistory);
            await GlobalCacheManager.initialize("friends", fetchFriends);
            await setOnlineStatus(true);
        } else {
            GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
        }
    } catch (error) {
        console.log(error);
    } finally {
        document.body.removeChild(overlay);
        document.head.removeChild(style);
    }
};

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

    if (authMethod === '42OAuth') {
        options.headers['X-42-Token'] = 'true';
    }
    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
        console.warn("Access token expired, refreshing...");
        await refreshTokens();
        options.headers.Authorization = `Bearer ${getAccessToken()}`;

        if (authMethod === '42OAuth') {
            options.headers['X-42-Token'] = 'true';
        }
        return fetch(url, options);
    }
    if (!response.ok) {
        const error = await response.json();
        console.error(`API Error: ${response.status}`, error);
        throw new Error(error.error || error.detail || "API call failed");
    }
    return response;
}

export const fetchMatchHistory = async () => {
    const response = await apiCall(`${BASE_GAME_API_URL}/match-history/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        showToast('Error when fetching match history', 'danger');
        throw new Error(`Error fetching match history`);
    }
    console.log("GOT MATCHES");
    return response.json();
}

export const fetchFriends = async () => {
    try {
        const response = await apiCall(`${BASE_FRIENDS_API_URL}/list/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        console.log("GOT FRIENDS!");
        return response.json();
    } catch (error) {
        showToast('Error when fetching friends', 'danger');
        console.error(error);
    }
}

export const setOnlineStatus = async (status) => {
    try {
        const response = await apiCall(`${BASE_FRIENDS_API_URL}/update_status/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            keepalive: true,
            body: JSON.stringify({
                status: status
            })
        })
        return response.json();
    } catch (err) {
        showToast("Error when trying to set online status", 'danger');
        console.error(err);
    }
}

// SETTERS
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
        });
    }
}
export const setLocal2FA = async (value) => {
    localStorage.setItem('2FA', value);
}
export const setOAuthDataWith2FA = (data) => {
    oauthData2FA = data;
}


// GETTERS
export const getOAuthData = () => oauthData2FA;
export const getUserName = () => localStorage.getItem("username");
export const getDisplayname = () => localStorage.getItem("displayName");
export const getUserPicture = () => localStorage.getItem("ProfilePicture");
export const getDefaultPicture = () => localStorage.getItem("DefaultPicture");
export const getLocal2FA = () => localStorage.getItem("2FA");
export const getAccessToken = () => accessToken;

export const fetchDogPicture = async () => {
    const apiURL = "https://dog.ceo/api/breeds/image/random";

    try {
        const response = await fetch(apiURL); // Wait for the fetch request
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json(); // Wait for the JSON parsing
        return data.message;
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        return null;
    }
}

export const get2FAstatus = async () => {
    let response = await apiCall(`${BASE_MFA_API_URL}/enable/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    })
    return response.status;
}

export const disable2FA = async () => {
    return apiCall(`${BASE_MFA_API_URL}/disable/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then((response) => response.json())
        .then(() => {
            setLocal2FA(false);
            showToast("Disabled 2FA", "warn");
            return true;
        }) .catch((error) => {
            return false;
    })
}

export const logout = async () => {
    const authMethod = localStorage.getItem('authMethod');
    const logoutUrl = authMethod === "42OAuth"
        ? `${BASE_OAUTH_JWT_API_URL}/logout/`
        : `${BASE_JWT_API_URL}/logout/`;

    try {
        const response = await fetch(logoutUrl, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            GlobalCacheManager.clear();
            await setOnlineStatus(false);
            deleteUser();
            location.reload();
            showToast('Logged out', 'success');
        } else {
            const error = await response.json();
            console.error("Failed to logout", error);
        }
    } catch (error) {
        console.error("Error during logout", error);
    }
};


export const deleteUser = () => {
    accessToken = null;
    USER.username = null;
    USER.profilePicture = null;
    USER.backupProfilePicture = null;
    localStorage.clear();
}

export const showToast = (message, type = 'info') => {
    document.querySelector('.toast-body').textContent = message;

    const toastElement = document.querySelector('.toast');
    toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
    toastElement.classList.add(`bg-${type}`);

    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 4000,
    });
    toast.show();
}