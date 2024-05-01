// main.ts
// Import your custom modules and types
import { IHandexTerm, HandexTerm } from './HandexTerm';
import { XtermAdapter } from './XtermAdapter';
import { IPersistence, LocalStoragePersistence } from './Persistence';
import { TerminalGame } from './TerminalGame';

// Import xterm.js and its addons
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

// const terminalGame = new TerminalGame(handexTerm, persistence);

// Instantiate xterm.js terminal and fit addon
var xTerm = new Terminal();
const fitAddon = new FitAddon();


function writePrompt(user: string = 'guest', host: string = 'handex.io') {
    xTerm.write(`\x1b[1;34m${user}@${host}:\x1b[0m\x1b[1;32m~$\x1b[0m `);
}

xTerm.onData(data => {
    xTerm.write(data);
    // If the Enter key is pressed, process the input and then write the prompt
    if (data.charCodeAt(0) === 13) {
        // Process the command here (not shown)

        // Write the prompt on a new line
        writePrompt();
    }
})

xTerm.onRender(() => {
    // writePrompt();
})

// Usage
document.addEventListener('DOMContentLoaded', () => {
    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer) {
        const persistence = new LocalStoragePersistence();
        const handexTerm = new HandexTerm(persistence);
        const xtermAdapter = new XtermAdapter(handexTerm, terminalContainer);
        // Now, xtermAdapter is bridging the third-party xterm.js terminal with HandexTerm

        // Optionally, if you have output from HandexTerm to display, use xtermAdapter.renderOutput
        handexTerm.output = (data: string) => {
            xtermAdapter.renderOutput(data);
        };
    }
});