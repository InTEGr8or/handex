"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalGame = void 0;
class TerminalGame {
    constructor(terminal) {
        this.terminal = terminal;
        this.commandHistory = [];
        this.wpmCalculator = new WPMCalculator();
        this.lastTouchDistance = null;
        this.terminal.classList.add(TerminalCssClasses.Terminal);
        this.outputElement = this.createOutputElement();
        this.terminal.appendChild(this.outputElement);
        this.terminal.appendChild(this.createPromptElement());
        this.loadCommandHistory();
        this.bindInput();
        this.addTouchListeners();
        this.currentFontSize = 14;
    }
    handleClick(event) {
        setTimeout(() => {
            this.inputElement.focus();
        }, 500);
    }
    addTouchListeners() {
        this.terminal.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.terminal.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.terminal.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    handleTouchStart(event) {
        setTimeout(() => {
            this.inputElement.focus();
        }, 500);
        if (event.touches.length === 2) {
            event.preventDefault();
            this.lastTouchDistance = this.getDistanceBetweenTouches(event.touches);
        }
    }
    handleTouchMove(event) {
        if (event.touches.length === 2) {
            event.preventDefault();
            const currentDistance = this.getDistanceBetweenTouches(event.touches);
            if (this.lastTouchDistance) {
                const scaleFactor = currentDistance / this.lastTouchDistance;
                this.currentFontSize *= scaleFactor;
                this.terminal.style.fontSize = `${this.currentFontSize}px`;
                this.lastTouchDistance = currentDistance;
            }
        }
    }
    handleTouchEnd(event) {
        this.lastTouchDistance = null;
    }
    getDistanceBetweenTouches(touches) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2));
    }
    saveCommandHistory(commandText, commandTime) {
        // Only keep the latest this.commandHistoryLimit number of commands
        let wpmSum = this.wpmCalculator.saveKeystrokes(commandTime);
        this.wpmCalculator.clearKeystrokes();
        commandText = commandText.replace(/{{wpm}}/g, ('_____' + wpmSum.toFixed(0)).slice(-4));
        localStorage.setItem(`${TerminalGame.commandHistoryKey}_${commandTime}`, JSON.stringify(commandText));
        return wpmSum;
    }
    loadCommandHistory() {
        var _a;
        let keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            if (!((_a = localStorage.key(i)) === null || _a === void 0 ? void 0 : _a.startsWith(TerminalGame.commandHistoryKey)))
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
                this.commandHistory = [JSON.parse(historyJSON)];
                if (!this.commandHistory)
                    return;
                this.outputElement.innerHTML += this.commandHistory;
            }
        }
    }
    clearCommandHistory() {
        let keys = [];
        for (let i = localStorage.length; i >= 0; i--) {
            let key = localStorage.key(i);
            if (!key)
                continue;
            if (key.includes(TerminalGame.commandHistoryKey)
                || key.includes('terminalCommandHistory') // Remove after clearing legacy phone db.
                || key.includes(TerminalGame.wpmLogKey)
                || key.includes(LogKeys.Command)
                || key.includes(LogKeys.CharTime)) {
                keys.push(key);
            }
        }
        for (let key of keys) {
            localStorage.removeItem(key); // Clear localStorage.length
        }
        this.commandHistory = [];
        this.outputElement.innerHTML = '';
    }
    bindInput() {
        if (this.inputElement) {
            this
                .inputElement
                .input
                .addEventListener('keydown', (event) => this.handleKeyPress(event));
        }
    }
    handleCommand(command) {
        if (command === 'clear') {
            this.clearCommandHistory();
            return;
        }
        const commandTime = new Date();
        const timeCode = this.createTimeCode(commandTime);
        let commandText = `<span class="log-time">${this.createTimeHTML(commandTime)}</span><span class="wpm">{{wpm}}</span>${command}<br>`;
        // Truncate the history if it's too long before saving
        if (this.commandHistory.length > TerminalGame.commandHistoryLimit) {
            this.commandHistory.shift(); // Remove the oldest command
        }
        let wpm = this.saveCommandHistory(commandText, timeCode.join('')); // Save updated history to localStorage
        commandText = commandText.replace(/{{wpm}}/g, ('_____' + wpm.toFixed(0)).slice(-4));
        if (!this.commandHistory) {
            this.commandHistory = [];
        }
        this.commandHistory.push(commandText);
        this.outputElement.innerHTML += commandText;
        // Additional logic for handling the command
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
        const head = document.createElement('div');
        head.classList.add('head');
        head.innerHTML = `<span class="user">${user}</span>@<span class="domain"><a href="https://handex.io">handex.io</a></span> via 🐹 v1.19.3 on ☁️ (us-west-1)`;
        return head;
    }
    createOutputElement() {
        const output = document.createElement('div');
        output.classList.add('terminal-output');
        // Additional styles and attributes can be set here
        return output;
    }
    /**
     * Creates a new textarea element for user input.
     * @returns The new textarea element with the appropriate class, title, and attributes.
     */
    createPromptTail() {
        const tail = document.createElement('div');
        tail.classList.add('tail');
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
        this.inputElement = new TerminalInputElement();
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
exports.TerminalGame = TerminalGame;
TerminalGame.commandHistoryKey = 'cmd';
TerminalGame.wpmLogKey = 'wpmLogKey';
TerminalGame.commandHistoryLimit = 100;
//# sourceMappingURL=TerminalGame.js.map