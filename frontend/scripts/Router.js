import {getAccessToken} from "./api/api.js";
import "./pages/views/DashboardView.js";
import {setupGlobalCustomCursorEffects} from "./utils/CursorEffects.js";

export const Router = {
    routes: {
        "/": {
            view: () => {
                return document.createElement('dashboard-view');
            },
            protected: false
        },
        "/404": {
            view: () => {
                const errorPage = document.createElement('error-404');
                errorPage.innerHTML = `<h1>404 - error</h1>`;
                return errorPage;
            },
            protected: false
        }
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
            const container = document.getElementById("content");
            container.innerHTML = ""; // Clear existing content

            const viewComponent = route.view();
            container.appendChild(viewComponent);
        } catch (error) {
            console.error(`Error loading ${path}:`, error);
            Router.navigateTo("/404", false);
        }
    },

    isAuthenticated: () => {
        return !!getAccessToken();
    }
}

export default Router;