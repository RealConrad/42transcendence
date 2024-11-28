import Router from "./Router.js"
import {setupGlobalCustomCursorEffects} from "./utils/CursorEffects.js";
import GlobalEventEmitter from "./utils/EventEmitter.js";
import {EVENT_TYPES} from "./utils/constants.js";

window.app = {};
app.router = Router;

document.body.style.cursor = `url(
    'data:image/svg+xml;utf8,
    <svg xmlns="http://www.w3.org/2000/svg" width="${15}" height="${15}" fill="%23ffffff">
        <rect width="${15}" height="${15}" />
    </svg>'),
    auto
`;
window.addEventListener('DOMContentLoaded', () => {
	app.router.init();
    setupGlobalCustomCursorEffects();

    document.addEventListener("mousemove", (event) => {
        GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_MOVE, { x: event.clientX, y: event.clientY });
    });
})
