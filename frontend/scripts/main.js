let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
}

export const getAccessToken = () => accessToken;

const refreshTokens = async () => {
    await fetch('http://127.0.0.1:8002/api/token/refresh/', {
            method: "POST",
            credentials: 'include',
        }).then((response) => {
            if (response.ok) {
               return response.json();
            } else {
                // TODO: logout user
                console.error("Unable to refresh tokens. logging out")
            }
    }).then((data) => {
        setAccessToken(data.access_token);
        console.log("Tokens refreshed");
    }).catch((error) => {
        console.error("Unable to refresh tokens: ", error);
    });
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

    if (response.status === 401) {
        console.warn("Access token expired, refreshing...");
        await refreshTokens()
        options.headers.Authorization = `Bearer ${getAccessToken()}`;
        return fetch(url, options);
    }
    if (!response.ok) {
        const error = await response.json();
        console.error(`API Error: ${response.status}`, error);
        throw new Error(error.error || "API call failed");
    }
    return response
}
