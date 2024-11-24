import Router from "./Router.js"

window.app = {};
app.router = Router;

window.addEventListener('DOMContentLoaded', () => {
    app.router.init();
})