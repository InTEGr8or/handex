"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStoragePersistence = void 0;
class LocalStoragePersistence {
    saveCommandHistory(command) {
        // Use localStorage to save the command history
    }
    setItem(key, value) {
        // Use localStorage to save the item
        localStorage.setItem(key, value);
    }
    loadCommandHistory() {
        // Use localStorage to load the command history
        return [];
    }
}
exports.LocalStoragePersistence = LocalStoragePersistence;
//# sourceMappingURL=Persistence.js.map