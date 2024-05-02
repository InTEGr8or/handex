"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
const TerminalGame_1 = require("./TerminalGame");
const HandexTerm_1 = require("./HandexTerm");
const XtermAdapter_1 = require("./XtermAdapter");
const Persistence_1 = require("./Persistence");
const handexTerm = new HandexTerm_1.HandexTerm();
const persistence = new Persistence_1.LocalStoragePersistence();
const xtermAdapter = new XtermAdapter_1.XtermAdapter(handexTerm);
const terminalGame = new TerminalGame_1.TerminalGame(handexTerm, persistence);
// Now you can use terminalGame to start the game
const xterm_1 = require("@xterm/xterm");
const addon_fit_1 = require("@xterm/addon-fit");
function pipe(value, fn) {
    return fn(value);
}
var xTerm = new xterm_1.Terminal();
const TerminalCssClasses = {
    Terminal: 'terminal',
    Line: 'terminal-line',
    Output: 'terminal-output',
    Input: 'terminal-input',
    Prompt: 'prompt',
    Head: 'head',
    Tail: 'tail',
    LogPrefix: 'log-prefix',
    LogTime: 'log-time',
};
const LogKeys = {
    CharTime: 'char-time',
    Command: 'command',
};
function createElement(tagName, className) {
    const element = document.createElement(tagName);
    if (className) {
        element.classList.add(className);
    }
    return element;
}
class WPMCalculator {
    getKeystrokes() {
        return this.keystrokes;
    }
    constructor() {
        this.previousTimestamp = 0;
        this.keystrokes = [];
    }
    clearKeystrokes() {
        this.keystrokes = [];
    }
    saveKeystrokes(timeCode) {
        let charsAndSum = this.getWPMs();
        localStorage.setItem(LogKeys.CharTime + '_' + timeCode, JSON.stringify(charsAndSum.charWpms));
        return charsAndSum.wpmSum;
    }
    recordKeystroke(character) {
        let charDur = { character, durationMilliseconds: 0 };
        if (this.previousTimestamp > 0) {
            charDur.durationMilliseconds = Date.now() - this.previousTimestamp;
        }
        this.previousTimestamp = Date.now();
        // Record the keystroke with the current timestamp
        this.keystrokes.push(charDur);
        return charDur;
    }
    getWPMs() {
        let charWpms = this.keystrokes.map(this.getWPM);
        let wpmSum = charWpms.filter(charWpm => charWpm.wpm > 0).reduce((a, b) => a + b.wpm, 0);
        wpmSum = Math.round(wpmSum * 1000) / 1000;
        return { wpmSum, charWpms };
    }
    getWPM(charDur) {
        let charWpm = { character: charDur.character, wpm: 0.0 };
        if (charDur.durationMilliseconds > 0) {
            let timeDifferenceMinute = charDur.durationMilliseconds / 60000.0;
            if (timeDifferenceMinute > 0) {
                let CPM = 1 / timeDifferenceMinute;
                // The standard is that one word = 5 characters
                charWpm.wpm = CPM / 5;
            }
        }
        charWpm.wpm = Math.round(charWpm.wpm * 1000) / 1000;
        return charWpm;
    }
}
class TerminalPrompt {
    constructor() {
        this.head = createElement('div', TerminalCssClasses.Head);
        this.tail = createElement('div', TerminalCssClasses.Tail);
        this.input = createElement('textarea', TerminalCssClasses.Input);
        this.head.appendChild(this.input);
        this.tail.appendChild(this.input);
    }
    toString() {
        return this.input.value;
    }
}
class TerminalInputElement {
    constructor() {
        this.input = createElement('textarea', TerminalCssClasses.Input);
        this.input.title = 'Terminal Input';
        this.input.id = 'terminal-input';
        this.input.wrap = 'off'; // Disables soft-wrapping
        this.input.spellcheck = true;
        this.input.autofocus = true;
        this.input.setAttribute('rows', '1');
        // Set additional properties and attributes
        // Optionally, bind the 'input' event listener here if it's standard for all input elements
        this.bindInputEventListener('input', this.autoExpand);
    }
    focus() {
        this.input.focus();
    }
    bindInputEventListener(eventType, listener) {
        this.input.addEventListener(eventType, listener);
    }
    autoExpand(event) {
        const textarea = event.target;
        textarea.style.height = 'auto'; // Reset the height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
}
function writePrompt(user = 'guest', host = 'handex.io') {
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
});
xTerm.onRender(() => {
    // writePrompt();
});
// Usage
document.addEventListener('DOMContentLoaded', () => {
    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer) {
        // const terminalGame = new TerminalGame(terminalContainer);
        const fitAddon = new addon_fit_1.FitAddon();
        xTerm.loadAddon(fitAddon);
        xTerm.open(terminalContainer);
        fitAddon.fit();
        writePrompt();
    }
});
//# sourceMappingURL=main.js.map