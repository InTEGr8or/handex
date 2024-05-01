"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtermAdapter = void 0;
// XtermAdapter.ts
const xterm_1 = require("@xterm/xterm");
class XtermAdapter {
    constructor(handexTerm) {
        this.handexTerm = handexTerm;
        this.term = new xterm_1.Terminal();
        // Set up xterm.js with event listeners and configurations
        this.term.onData(data => {
            this.handexTerm.handleInput(data);
        });
        // Additional setup
    }
}
exports.XtermAdapter = XtermAdapter;
//# sourceMappingURL=XtermAdapter.js.map