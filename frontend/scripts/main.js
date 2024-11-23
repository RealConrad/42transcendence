const refreshTokens = async () => {
    await fetch('http://127.0.0.1:8002/api/token/refresh/', {
            method: "POST",
            credentials: 'include',
        }).then((response) => {
            if (response.ok) {
               return response.json();
            } else {
                // TODO: logout user
                console.error("Unable to refresh tokens. loggingo ut")
            }
    }).then((data) => {
        window.accessToken = data.access_token;
        console.log("Tokens refreshed");
    }).catch((error) => {
        console.error("Unable to refresh tokens: ", error);
    })
}

window.onload = async () => {
    console.log("Page refreshed, trying to get new tokens....");
    if (!window.accessToken) {
        try {
            await refreshTokens();
        } catch (error) {
            console.error("Unable to refresh tokens on page load: ", error);
        }
    } else {
        console.log("Already have access token");
    }
}