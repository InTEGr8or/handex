"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
// Import your custom modules and types
const HandexTerm_1 = require("./HandexTerm");
const XtermAdapter_1 = require("./XtermAdapter");
const Persistence_1 = require("./Persistence");
// const terminalGame = new TerminalGame(handexTerm, persistence);
document.addEventListener('DOMContentLoaded', () => {
    var _a;
    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer) {
        const persistence = new Persistence_1.LocalStoragePersistence();
        const handexTerm = new HandexTerm_1.HandexTerm(persistence);
        const xtermAdapter = new XtermAdapter_1.XtermAdapter(handexTerm, terminalContainer);
        // Now, xtermAdapter is bridging the third-party xterm.js terminal with HandexTerm
        // Optionally, if you have output from HandexTerm to display, use xtermAdapter.renderOutput
        xtermAdapter.prompt();
        (_a = document.getElementById('terminal-nav')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            terminalContainer.focus();
        });
    }
});
//# sourceMappingURL=main.js.map