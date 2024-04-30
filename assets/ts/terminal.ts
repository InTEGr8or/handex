
function pipe<T, R>(value: T, fn: (arg: T) => R): R {
    return fn(value);
}

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
} as const;

const LogKeys = {
    CharTime: 'char-time',
    Command: 'command',
} as const;

type TimeCode = string;
type TimeHTML = string;
type CharDuration = {
    character: string;
    durationMilliseconds: number;
}
type CharWPM = {
    character: string;
    wpm: number;
}

function createElement<T extends HTMLElement>(tagName: keyof HTMLElementTagNameMap, className?: string): T {
    const element = document.createElement(tagName) as T;
    if (className) {
        element.classList.add(className);
    }
    return element;
}

interface IWPMCalculator {
    previousTimestamp: number;
    recordKeystroke(character: string): void;
    saveKeystrokes(timeCode: TimeCode): number;
    clearKeystrokes(): void;
    getKeystrokes(): CharDuration[];
}

class WPMCalculator implements IWPMCalculator {
    previousTimestamp: number = 0;
    keystrokes: CharDuration[];
    getKeystrokes(): CharDuration[] {
        return this.keystrokes;
    }
    constructor() {
        this.keystrokes = [];
    }

    clearKeystrokes(): void {
        this.keystrokes = [];
    }

    saveKeystrokes(timeCode: TimeCode): number {
        let charsAndSum = this.getWPMs();
        localStorage.setItem(LogKeys.CharTime + '_' + timeCode, JSON.stringify(charsAndSum.charWpms));
        return charsAndSum.wpmSum;
    }

    recordKeystroke(character: string): CharDuration {
        let charDur: CharDuration = { character, durationMilliseconds: 0 };
        if (this.previousTimestamp > 0) {
            charDur.durationMilliseconds = Date.now() - this.previousTimestamp;
        }
        this.previousTimestamp = Date.now();
        // Record the keystroke with the current timestamp
        this.keystrokes.push(charDur);
        return charDur;
    }
    getWPMs(): { wpmSum: number; charWpms: CharWPM[] } {
        let charWpms = this.keystrokes.map(this.getWPM);
        let wpmSum = charWpms.filter(charWpm => charWpm.wpm > 0).reduce((a, b) => a + b.wpm, 0);
        wpmSum = Math.round(wpmSum * 1000) / 1000
        return { wpmSum, charWpms };
    }
    getWPM(charDur: CharDuration): CharWPM {
        let charWpm: CharWPM = { character: charDur.character, wpm: 0.0 };
        if (charDur.durationMilliseconds > 0) {
            let timeDifferenceMinute = charDur.durationMilliseconds / 60000.0
            if (timeDifferenceMinute > 0) {
                let CPM = 1 / timeDifferenceMinute;
                // The standard is that one word = 5 characters
                charWpm.wpm = CPM / 5;
            }
        }
        charWpm.wpm = Math.round(charWpm.wpm * 1000) / 1000
        return charWpm;
    }
}

interface ITerminalPromptElement {
    head: HTMLDivElement;
    tail: HTMLDivElement;
    input: HTMLTextAreaElement;
    toString(): string;
}

class TerminalPrompt implements ITerminalPromptElement {
    head: HTMLDivElement;
    tail: HTMLDivElement;
    input: HTMLTextAreaElement;
    constructor() {
        this.head = createElement('div', TerminalCssClasses.Head);
        this.tail = createElement('div', TerminalCssClasses.Tail);
        this.input = createElement('textarea', TerminalCssClasses.Input);
        this.head.appendChild(this.input);
        this.tail.appendChild(this.input);
    }
    toString(): string {
        return this.input.value;
    }
}

class TerminalInputElement implements ITerminalInputElement {
    public input: HTMLTextAreaElement;

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

    public focus(): void {
        this.input.focus();
    }

    public bindInputEventListener(eventType: string, listener: EventListener): void {
        this.input.addEventListener(eventType, listener);
    }

    private autoExpand(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto'; // Reset the height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
}

interface ITerminalInputElement {
    input: HTMLTextAreaElement;
    focus(): void;
    bindInputEventListener(eventType: string, listener: EventListener): void;
}

interface ITerminal {
    prompt: ITerminalPromptElement;
    output: HTMLElement;
}

interface IPromptHead {
    head: HTMLElement;
}



class TerminalGame {
    private commandHistory: string[] = [];
    private wpmCalculator: WPMCalculator = new WPMCalculator();
    private outputElement: HTMLElement;
    private inputElement!: ITerminalInputElement;
    private static readonly commandHistoryKey = 'cmd';
    private static readonly wpmLogKey = 'wpmLogKey';
    private static readonly commandHistoryLimit = 100;
    private lastTouchDistance: number | null = null;
    private currentFontSize: number;

    constructor(private terminal: HTMLElement) {
        this.terminal.classList.add(TerminalCssClasses.Terminal);
        this.outputElement = this.createOutputElement();
        this.terminal.appendChild(this.outputElement);
        this.terminal.appendChild(this.createPromptElement());
        this.loadCommandHistory();
        this.bindInput();
        this.addTouchListeners();
        this.currentFontSize = 14;
    }

    private handleClick(event: MouseEvent): void {
        setTimeout(() => {
            this.inputElement.focus();
        }, 500)
    }

    private addTouchListeners(): void {
        this.terminal.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.terminal.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.terminal.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    private handleTouchStart(event: TouchEvent): void {
        setTimeout(() => {
            this.inputElement.focus();
        }, 500)
        if (event.touches.length === 2) {
            event.preventDefault();
            this.lastTouchDistance = this.getDistanceBetweenTouches(event.touches);
        }
    }

    private handleTouchMove(event: TouchEvent): void {
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

    private handleTouchEnd(event: TouchEvent): void {
        this.lastTouchDistance = null;
    }

    private getDistanceBetweenTouches(touches: TouchList): number {
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2),
        );
    }
    private saveCommandHistory(commandText: string, commandTime: string): number {
        // Only keep the latest this.commandHistoryLimit number of commands
        let wpmSum = this.wpmCalculator.saveKeystrokes(commandTime);
        this.wpmCalculator.clearKeystrokes();
        commandText = commandText.replace(/{{wpm}}/g, ('_____' + wpmSum.toFixed(0)).slice(-4));
        localStorage.setItem(`${TerminalGame.commandHistoryKey}_${commandTime}`, JSON.stringify(commandText));
        return wpmSum;
    }

    private loadCommandHistory(): void {
        let keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            if (!localStorage.key(i)?.startsWith(TerminalGame.commandHistoryKey)) continue;

            const key = localStorage.key(i);
            if (!key) continue;
            keys.push(key);
        }
        keys.sort();
        for (let key of keys) {
            const historyJSON = localStorage.getItem(key);
            if (historyJSON) {
                this.commandHistory = [JSON.parse(historyJSON)];
                if (!this.commandHistory) return;
                this.outputElement.innerHTML += this.commandHistory;
            }
        }
    }
    private clearCommandHistory(): void {
        let keys: string[] = [];
        for (let i = localStorage.length; i >= 0; i--) {
            let key = localStorage.key(i);
            if (!key) continue;
            if (
                key.includes(TerminalGame.commandHistoryKey)
                || key.includes('terminalCommandHistory') // Remove after clearing legacy phone db.
                || key.includes(TerminalGame.wpmLogKey)
                || key.includes(LogKeys.Command)
                || key.includes(LogKeys.CharTime)
            ) {
                keys.push(key);
            }
        }
        for (let key of keys) {
            localStorage.removeItem(key); // Clear localStorage.length
        }
        this.commandHistory = [];
        this.outputElement.innerHTML = '';
    }
    private bindInput(): void {
        if (this.inputElement) {
            this
                .inputElement
                .input
                .addEventListener(
                    'keydown',
                    (event: KeyboardEvent) => this.handleKeyPress(event)
                );
        }
    }

    private handleCommand(command: string): void {
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
        if (!this.commandHistory) { this.commandHistory = []; }
        this.commandHistory.push(commandText);
        this.outputElement.innerHTML += commandText;
        // Additional logic for handling the command
    }
    private handleKeyPress(event: KeyboardEvent): void {
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

    private createTimeCode(now = new Date()): string[] {
        return now.toLocaleTimeString('en-US', { hour12: false }).split(':');
    }

    private createTimeHTML(time = new Date()): TimeHTML {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        const seconds = time.getSeconds().toString().padStart(2, '0');
        return `<span class="log-hour">${hours}</span><span class="log-minute">${minutes}</span><span class="log-second">${seconds}</span>`;
    }

    private createPromptHead(user: string = 'guest'): HTMLElement {
        const head = document.createElement('div');
        head.classList.add('head');
        head.innerHTML = `<span class="user">${user}</span>@<span class="domain"><a href="https://handex.io">handex.io</a></span> via 🐹 v1.19.3 on ☁️ (us-west-1)`;
        return head;
    }

    private createOutputElement(): HTMLElement {
        const output = document.createElement('div');
        output.classList.add('terminal-output');
        // Additional styles and attributes can be set here
        return output;
    }
    /**
     * Creates a new textarea element for user input.
     * @returns The new textarea element with the appropriate class, title, and attributes.
     */

    private createPromptTail(): HTMLElement {
        const tail = document.createElement('div');
        tail.classList.add('tail');
        tail.innerHTML = `❯ `;
        return tail;
    }

    private createPromptElement(user: string = 'guest'): HTMLElement {
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

    // Additional methods for calculating WPM, updating the progress bar, etc.
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    const terminalContainer = document.getElementById('terminal');
    if (terminalContainer) {
        const terminalGame = new TerminalGame(terminalContainer);
    }
});