import eventEmitter from "../EventEmitter.js";

export default class InputManager {
    constructor() {
        this.keys = {}
        this.discreteKeys = new Set(['Escape']);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) {
        const key = e.key;
        if (this.discreteKeys.has(key) && !this.keys[key]) {
            this.keys[key] = true;
            this.emitDiscreteAction(key, true);
            return;
        }
        this.keys[key] = true;
    }

    handleKeyUp(e) {
        const key = e.key;
        if (this.discreteKeys.has(key) && this.keys[key]) {
            this.keys[e.key] = false;
            // this.emitDiscreteAction(key, false);
            return;
        }
        this.keys[key] = false;
    }

    emitDiscreteAction(key, isPressed) {
        switch (key) {
            case 'Escape':
                eventEmitter.emit('toggleMenu', isPressed);
                break;
            default:
                break;
        }
    }

    isKeyPressed(key) {
        return !!this.keys[key];
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}
