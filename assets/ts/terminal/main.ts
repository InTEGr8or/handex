// main.ts
// Import your custom modules and types
import { IHandexTerm, HandexTerm } from './HandexTerm';
import { XtermAdapter } from './XtermAdapter';
import { IPersistence, LocalStoragePersistence } from './Persistence';
import { TerminalGame } from './TerminalGame';


// const terminalGame = new TerminalGame(handexTerm, persistence);

document.addEventListener('DOMContentLoaded', () => {

    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer) {
        const persistence = new LocalStoragePersistence();
        const handexTerm = new HandexTerm(persistence);
        const xtermAdapter = new XtermAdapter(handexTerm, terminalContainer);
        // Now, xtermAdapter is bridging the third-party xterm.js terminal with HandexTerm

        // Optionally, if you have output from HandexTerm to display, use xtermAdapter.renderOutput
        xtermAdapter.prompt();
        document.getElementById('terminal-nav')?.addEventListener('click', () => {
            terminalContainer.focus();
        })
    }
});