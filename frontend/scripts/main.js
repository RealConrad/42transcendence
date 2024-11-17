
const scheduleTokenRefresh = () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        console.log("No token to refresh");
        return;
    }

    const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
    const expTime = tokenPayload.exp * 1000;
    const currentTime = Date.now();
    const delay = expTime - currentTime - 60 * 1000;
    // console.log("Token payload:", tokenPayload);
    // console.log("Expiration time (ms):", expTime);
    // console.log("Refresh scheduled in (ms):", delay);

    if (delay <= 0) {
        console.error("Token expired");
        return;
    }

    setTimeout(async () => {
        console.log("Refreshing token..");
        await refreshAccessToken();
        scheduleTokenRefresh();
    }, delay)
}

document.addEventListener("DOMContentLoaded", scheduleTokenRefresh);

const refreshAccessToken = async() => {
    try {
        const response = await fetch("http://127.0.0.1:8000/token/refresh/", {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            console.error("error")
            throw new Error("Failed to refresh token");
        }

        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        return data.access;
    } catch (error) {
        console.error("Error refreshing access token:", error);
    }
}
