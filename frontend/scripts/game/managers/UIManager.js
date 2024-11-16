import eventEmitter from "../EventEmitter.js";

export default class UIManager {
    constructor() {
        this.menu = document.getElementById("menu")

        this.toggleMenu = this.toggleMenuFunc.bind(this);

        eventEmitter.on('toggleMenu', this.toggleMenu);
    }

    toggleMenuFunc(isPressed) {
        if (isPressed) {
            this.menu.classList.toggle('hidden');
            if (!this.menu.classList.contains('hidden')) {
                eventEmitter.emit('displayMenu');
            } else {
                eventEmitter.emit('hideMenu');
            }
        }
    }
}