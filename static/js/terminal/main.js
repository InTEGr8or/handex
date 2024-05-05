// main.ts
// Import your custom modules and types
import { HandexTerm } from './HandexTerm';
import { XtermAdapter } from './XtermAdapter';
import { LocalStoragePersistence } from './Persistence';
// const terminalGame = new TerminalGame(handexTerm, persistence);
document.addEventListener('DOMContentLoaded', () => {
    var _a;
    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer) {
        const persistence = new LocalStoragePersistence();
        const handexTerm = new HandexTerm(persistence);
        const xtermAdapter = new XtermAdapter(handexTerm, terminalContainer);
        // Now, xtermAdapter is bridging the third-party xterm.js terminal with HandexTerm
        // Optionally, if you have output from HandexTerm to display, use xtermAdapter.renderOutput
        xtermAdapter.prompt();
        (_a = document.getElementById('terminal-nav')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            terminalContainer.focus();
        });
    }
});
//# sourceMappingURL=main.js.map