"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandexTerm = void 0;
// HandexTerm.ts
const TerminalTypes_1 = require("./TerminalTypes");
const TerminalInputElement_1 = require("./TerminalInputElement");
const WPMCalculator_1 = require("./WPMCalculator");
const dom_1 = require("../utils/dom");
class HandexTerm {
    constructor(persistence) {
        this.persistence = persistence;
        this._commandHistory = [];
        this.wpmCalculator = new WPMCalculator_1.WPMCalculator();
        this.inputElement = new TerminalInputElement_1.TerminalInputElement();
        this._persistence = persistence;
        this.bindInput();
    }
    getCommandHistory() {
        var _a;
        let keys = [];
        let commandHistory = [];
        for (let i = 0; i < localStorage.length; i++) {
            if (!((_a = localStorage.key(i)) === null || _a === void 0 ? void 0 : _a.startsWith(TerminalTypes_1.LogKeys.Command)))
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
        localStorage.setItem(`${TerminalTypes_1.LogKeys.Command}_${commandTime}`, JSON.stringify(commandResponseElement.innerHTML));
        return wpmSum;
    }
    clearCommandHistory() {
        let keys = [];
        for (let i = localStorage.length; i >= 0; i--) {
            let key = localStorage.key(i);
            if (!key)
                continue;
            if (key.includes(TerminalTypes_1.LogKeys.Command)
                || key.includes('terminalCommandHistory') // Remove after clearing legacy phone db.
                || key.includes(TerminalTypes_1.LogKeys.CharTime)) {
                keys.push(key);
            }
        }
        for (let key of keys) {
            localStorage.removeItem(key); // Clear localStorage.length
        }
        this._commandHistory = [];
    }
    bindInput() {
        if (this.inputElement) {
            this
                .inputElement
                .input
                .addEventListener('keydown', (event) => this.handleKeyPress(event));
        }
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
    handleCommand(command) {
        let status = 404;
        let response = "Command not found.";
        if (command === 'clear') {
            this.clearCommandHistory();
            return new HTMLElement();
        }
        if (command === 'play') {
            status = 200;
            response = "Would you like to play a game?";
        }
        if (command.startsWith('video --')) {
            status = 200;
            console.log("Video Command: " + command);
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
    handleKeyPress(event) {
        // Logic to handle keypresses, calculate WPM, and update the progress bar
        // ...
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                this.inputElement.input.value += '\n';
                return;
            }
            const command = this.inputElement.input.value.trim();
            this.inputElement.input.value = '';
            this.handleCommand(command);
        }
        if (event.ctrlKey && event.key === 'c') {
            this.inputElement.input.value = '';
        }
        const wpm = this.wpmCalculator.recordKeystroke(event.key);
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
    createPromptHead(user = 'guest') {
        const head = (0, dom_1.createElement)('div', 'head');
        head.innerHTML = `<span class="user">${user}</span>@<span class="domain"><a href="https://handex.io">handex.io</a></span> via 🐹 v1.19.3 on ☁️ (us-west-1)`;
        return head;
    }
    createPromptTail() {
        const tail = (0, dom_1.createElement)('div', 'tail');
        tail.innerHTML = `❯ `;
        return tail;
    }
    createPromptElement(user = 'guest') {
        const prompt = document.createElement('div');
        prompt.classList.add('prompt');
        // Create the first line which contains only the prompt head
        const line1 = document.createElement('div');
        line1.classList.add('terminal-line', 'first-line'); // Add 'first-line' for specific styling
        const promptHead = this.createPromptHead(user);
        line1.appendChild(promptHead);
        prompt.appendChild(line1);
        // Create the second line which will be a flex container for the prompt tail and input
        const line2 = document.createElement('div');
        line2.classList.add('terminal-line');
        this.inputElement = new TerminalInputElement_1.TerminalInputElement();
        // Create a container for the prompt tail to align it properly
        const promptTailContainer = document.createElement('div');
        promptTailContainer.classList.add('prompt-tail-container');
        const promptTail = this.createPromptTail();
        promptTailContainer.appendChild(promptTail);
        // Append the prompt tail container and the input element to the second line
        line2.appendChild(promptTailContainer);
        line2.appendChild(this.inputElement.input);
        prompt.appendChild(line2);
        // Additional styles and attributes can be set here
        return prompt;
    }
}
exports.HandexTerm = HandexTerm;
HandexTerm.commandHistoryLimit = 100;
//# sourceMappingURL=HandexTerm.js.map