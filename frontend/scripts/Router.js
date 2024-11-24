import {getAccessToken} from "./api/api.js";

export const Router = {
    routes: {
        "/": {view: "<h1>home page</h1>", protected: false},
        "/about": {view: "<h1>about page</h1>", protected: false},
        "/profile": {view: "<h1>profile page</h1>", protected: true},
        "/404": {view: "<h1>404 page</h1>", protected: false},
    },
    init: () => {
        document.querySelectorAll('a').forEach(element => {
            element.addEventListener('click', event => {
                event.preventDefault();
                const url = event.target.getAttribute('href');
                Router.navigateTo(url);
            })
        })
        // 'popstate' listens for back/forward browser buttons
        window.addEventListener('popstate', (event) => {
            Router.navigateTo(window.location.pathname, false);
        });
        Router.navigateTo(window.location.pathname, false);
    },

    async navigateTo(path, addToHistory = true) {
        const route = this.routes[path] || this.routes["/404"];

        if (route.protected && !this.isAuthenticated()) {
            console.warn(`Access to ${path} denied. Login first!`);
            return this.navigateTo("/404");
        }
        if (addToHistory) {
            history.pushState(path, null, path);
        }
        try {
            document.getElementById("content").innerHTML = route.view;
        } catch (error) {
            console.error(`Error loading ${path}:`, error);
            Router.navigateTo("/404", false);
        }
    },

    isAuthenticated: () => {
        return !!getAccessToken()
    }
}

export default Router;