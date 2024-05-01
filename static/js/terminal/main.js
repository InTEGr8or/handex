"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
// Import your custom modules and types
const HandexTerm_1 = require("./HandexTerm");
const XtermAdapter_1 = require("./XtermAdapter");
const Persistence_1 = require("./Persistence");
// Import xterm.js and its addons
const xterm_1 = require("@xterm/xterm");
const addon_fit_1 = require("@xterm/addon-fit");
// const terminalGame = new TerminalGame(handexTerm, persistence);
// Instantiate xterm.js terminal and fit addon
var xTerm = new xterm_1.Terminal();
const fitAddon = new addon_fit_1.FitAddon();
xTerm.onData(data => {
    xTerm.write(data);
    // If the Enter key is pressed, process the input and then write the prompt
    if (data.charCodeAt(0) === 13) {
        // Process the command here (not shown)
        // Write the prompt on a new line
        writePrompt();
    }
});
xTerm.onRender(() => {
    // writePrompt();
});
// Usage
document.addEventListener('DOMContentLoaded', () => {
    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer) {
        const persistence = new Persistence_1.LocalStoragePersistence();
        const handexTerm = new HandexTerm_1.HandexTerm(persistence);
        const xtermAdapter = new XtermAdapter_1.XtermAdapter(handexTerm, terminalContainer);
        // Now, xtermAdapter is bridging the third-party xterm.js terminal with HandexTerm
        // Optionally, if you have output from HandexTerm to display, use xtermAdapter.renderOutput
        handexTerm.output = (data) => {
            xtermAdapter.renderOutput(data);
        };
    }
});
//# sourceMappingURL=main.js.map