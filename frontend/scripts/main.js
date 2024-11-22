const scheduleTokenRefresh = (expiresAt) => {
    const expiryTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const delay = expiryTime - currentTime - 60 * 1000; // Refresh 1 minute before expiry

    if (delay <= 0) {
        console.warn("Token already expired. Refreshing immediately...");
        refreshAccessToken(); // Refresh immediately if the token is already expired
        return;
    }

    console.log(`Scheduling token refresh in ${delay / 1000} seconds`);
    setTimeout(() => {
        refreshAccessToken();
    }, delay);
};

const handleLoginResponse = (data) => {
    // Save the expiration time in localStorage
    localStorage.setItem("token_exp", data.token_exp);

    // Schedule the token refresh
    scheduleTokenRefresh(data.token_exp);
};

const refreshAccessToken = async () => {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/token/refresh/", {
            method: "POST",
            credentials: "include", // Include cookies
        });

        if (!response.ok) {
            throw new Error("Failed to refresh token");
        }

        const data = await response.json();
        console.log("Token refreshed successfully:", data);

        // Update the expiration time in localStorage
        localStorage.setItem("token_exp", data.expires_at);

        // Schedule the next refresh
        scheduleTokenRefresh(data.expires_at);
        return true;
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return false;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const tokenExp = localStorage.getItem("token_exp");
    if (tokenExp) {
        console.log("Found token expiration in localStorage:", tokenExp);
        scheduleTokenRefresh(tokenExp);
    } else {
        console.warn("No token expiration found. User may need to log in.");
    }
});