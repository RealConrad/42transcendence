class CacheManager {
    constructor() {
        this.cache = {};
        this.currentKeys = {};
    }

    /**
     * Initializes a given `key` with data returned from the callback.
     * @IMPORTANT The `callback` should return json data/object!
     * @param key Identifier to locate the stored data
     * @param callback A function to get data from
     * @returns {Promise<void>}
     */
    async initialize(key, callback) {
        if (!this.currentKeys[key] && typeof callback === 'function') {
            try {
                const data = await callback();
                if (data && typeof data === 'object') {
                    this.cache[key] = data || {};
                    this.currentKeys[key] = true;
                } else {
                    console.warn(`No data from callback function for key: ${key}`);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    get(key) {
        return this.cache[key];
    }

    set (key, value) {
        this.cache[key] = value;
    }

    update(key, value) {
        // TODO: Update key with given value
    }

    remove(key) {
        delete this.cache[key];
        delete this.currentKeys[key];
    }

    clear() {
        this.cache = {};
        this.currentKeys = {};
    }
}

const GlobalCacheManager = new CacheManager();
export default GlobalCacheManager;