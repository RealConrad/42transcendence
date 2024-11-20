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
        localStorage.removeItem("access_token");
        return;
    }
    console.log("attempting to refresh");
    setTimeout(async () => {
        console.log("Refreshing token..");
        await refreshAccessToken();
        scheduleTokenRefresh();
    }, 5000)
}

const refreshAccessToken = async() => {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/token/refresh/", {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            return response.json().then((err) => {
                throw new Error(JSON.stringify(err));
            })
        }

        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        return data.access;
    } catch (error) {
        console.error("Error refreshing access token:", error);
    }
}

document.addEventListener("DOMContentLoaded", scheduleTokenRefresh);
