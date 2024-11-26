import {EVENT_TYPES} from "./constants.js";
import GlobalEventEmitter from "./EventEmitter.js";

export const setupGlobalCustomCursorEffects = () => {
    // Create cursor trail elements
    const cursorTrail = document.createElement("div");
    const cursorAfterTrail = document.createElement("div");

    cursorTrail.className = "cursor-after-image";
    cursorAfterTrail.className = "cursor-after-image";

    // Append to the global DOM
    document.body.appendChild(cursorTrail);
    document.body.appendChild(cursorAfterTrail);

    let lastX, lastY;

    // Update cursor position globally
    GlobalEventEmitter.on(EVENT_TYPES.CURSOR_MOVE, ({x, y}) => {
        cursorTrail.style.left = `${x}px`;
        cursorTrail.style.top = `${y}px`;
        if (lastX !== undefined && lastY !== undefined) {
            const dx = x - lastX;
            const dy = y - lastY;

            const newX = x - dx * 0.5;
            const newY = y - dy * 0.5;

            cursorAfterTrail.style.left = `${newX}px`;
            cursorAfterTrail.style.top = `${newY}px`;
        }
        lastX = x;
        lastY = y;
    });

    // Hover events for shadowDOM
    GlobalEventEmitter.on(EVENT_TYPES.CURSOR_HOVER, ({ element}) => {
        cursorTrail.classList.add("after-image-shake", "enlarged", "blue");
        cursorAfterTrail.classList.add("after-image-after-shake", "enlarged", "green");
    });

    GlobalEventEmitter.on(EVENT_TYPES.CURSOR_UNHOVER, () => {
        cursorTrail.classList.remove("after-image-shake", "enlarged", "blue");
        cursorAfterTrail.classList.remove("after-image-after-shake", "enlarged", "green");
    });
};
