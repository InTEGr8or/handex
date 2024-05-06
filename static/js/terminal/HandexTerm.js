// HandexTerm.ts
import { LogKeys } from './TerminalTypes';
import { WPMCalculator } from './WPMCalculator';
import { createElement } from '../utils/dom';
export class HandexTerm {
    constructor(persistence) {
        this.persistence = persistence;
        this._commandHistory = [];
        this.wpmCalculator = new WPMCalculator();
        this.wholePhraseChords = null;
        this.chordImageHolder = null;
        this.svgCharacter = null;
        this.testMode = null;
        this.setWpmCallback = () => { };
        this._persistence = persistence;
        this.wholePhraseChords = createElement('div', 'whole-phrase-chords');
    }
    handleCommand(command) {
        let status = 404;
        let response = "Command not found.";
        if (command === 'clear') {
            status = 200;
            this.clearCommandHistory();
            return new HTMLElement();
        }
        if (command === 'play') {
            status = 200;
            response = "Would you like to play a game?";
        }
        if (command === 'phrase') {
            status = 200;
            response = "Would you like to play a game?";
        }
        if (command.startsWith('video --')) {
            status = 200;
            if (command === 'video --true') {
                response = "Starting video camera...";
            }
            else {
                response = "Stopping video camera...";
            }
        }
        // Truncate the history if it's too long before saving
        if (this._commandHistory.length > HandexTerm.commandHistoryLimit) {
            this._commandHistory.shift(); // Remove the oldest command
        }
        const commandTime = new Date();
        const timeCode = this.createTimeCode(commandTime);
        let commandText = this.createCommandRecord(command, commandTime);
        const commandElement = this.createHTMLElementFromHTML(commandText);
        let commandResponseElement = document.createElement('div');
        commandResponseElement.dataset.status = status.toString();
        commandResponseElement.appendChild(commandElement);
        commandResponseElement.appendChild(this.createHTMLElementFromHTML(`<div class="response">${response}</div>`));
        let wpm = this.saveCommandResponseHistory(commandResponseElement, timeCode.join('')); // Save updated history to localStorage
        commandText = commandText.replace(/{{wpm}}/g, ('_____' + wpm.toFixed(0)).slice(-4));
        if (!this._commandHistory) {
            this._commandHistory = [];
        }
        this._commandHistory.push(commandResponseElement);
        return commandResponseElement;
    }
    parseCommand(input) {
        const args = input.split(/\s+/); // Split the input by whitespace
        const command = args[0]; // The first element is the command
        const options = args.slice(1); // The rest are the associated options/arguments
        // Now you can handle the command and options
        // Based on the command, you can switch and call different functions
        switch (command) {
            case 'someCommand':
                // Handle 'someCommand'
                break;
            // Add cases for other commands as needed
            default:
                // Handle unknown command
                break;
        }
    }
    getCommandHistory() {
        var _a;
        let keys = [];
        let commandHistory = [];
        for (let i = 0; i < localStorage.length; i++) {
            if (!((_a = localStorage.key(i)) === null || _a === void 0 ? void 0 : _a.startsWith(LogKeys.Command)))
                continue;
            const key = localStorage.key(i);
            if (!key)
                continue;
            keys.push(key);
        }
        keys.sort();
        for (let key of keys) {
            const historyJSON = localStorage.getItem(key);
            if (historyJSON) {
                commandHistory.push(JSON.parse(historyJSON));
            }
        }
        return commandHistory;
    }
    saveCommandResponseHistory(commandResponseElement, commandTime) {
        // Only keep the latest this.commandHistoryLimit number of commands
        let wpmSum = this.wpmCalculator.saveKeystrokes(commandTime);
        this.wpmCalculator.clearKeystrokes();
        commandResponseElement.innerHTML = commandResponseElement.innerHTML.replace(/{{wpm}}/g, ('_____' + wpmSum.toFixed(0)).slice(-4));
        this._persistence.setItem(`${LogKeys.Command}_${commandTime}`, JSON.stringify(commandResponseElement.innerHTML));
        return wpmSum;
    }
    clearCommandHistory() {
        let keys = [];
        for (let i = localStorage.length; i >= 0; i--) {
            let key = localStorage.key(i);
            if (!key)
                continue;
            if (key.includes(LogKeys.Command)
                || key.includes('terminalCommandHistory') // Remove after clearing legacy phone db.
                || key.includes(LogKeys.CharTime)) {
                keys.push(key);
            }
        }
        for (let key of keys) {
            localStorage.removeItem(key); // Clear localStorage.length
        }
        this._commandHistory = [];
    }
    createHTMLElementFromHTML(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        return doc.body.firstChild;
    }
    handleCharacter(character) {
        return this.wpmCalculator.recordKeystroke(character).durationMilliseconds;
    }
    createCommandRecord(command, commandTime) {
        let commandText = `<div class="log-line"><span class="log-time">[${this.createTimeHTML(commandTime)}]</span><span class="wpm">{{wpm}}</span>${command}</div>`;
        return commandText;
    }
    createTimeCode(now = new Date()) {
        return now.toLocaleTimeString('en-US', { hour12: false }).split(':');
    }
    createTimeHTML(time = new Date()) {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        const seconds = time.getSeconds().toString().padStart(2, '0');
        return `<span class="log-hour">${hours}</span><span class="log-minute">${minutes}</span><span class="log-second">${seconds}</span>`;
    }
}
HandexTerm.commandHistoryLimit = 100;
//# sourceMappingURL=HandexTerm.js.map