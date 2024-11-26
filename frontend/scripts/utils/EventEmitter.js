class EventEmitter {
    constructor() {
        this.events = {};
    }

    // Register a listener for an event
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    // Remove a specific listener or all listeners for an event
    off(event, listener = null) {
        if (!this.events[event]) return;

        if (listener) {
            this.events[event] = this.events[event].filter((l) => l !== listener);
        } else {
            delete this.events[event];
        }
    }

    // Emit an event with data
    emit(event, data = {}) {
        if (!this.events[event]) return;

        this.events[event].forEach((listener) => listener(data));
    }
}

const GlobalEventEmitter = new EventEmitter();
export default GlobalEventEmitter;
