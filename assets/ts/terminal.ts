
function pipe<T, R>(value: T, fn: (arg: T) => R): R {
    return fn(value);
}

enum TerminalCssClasses {
    Terminal = 'terminal',
    Line = 'terminal-line',
    Output = 'terminal-output',
    Input = 'terminal-input',
    Prompt = 'prompt',
    Head = 'head',
    Tail = 'tail',
    LogPrefix = 'log-prefix',
    LogTime = 'log-time',
}

type TimeCode = string;
type TimeHTML = string;

interface WPMCalculatorInterface {
    recordKeystroke(character: string): void;
    clearKeystrokes(): void;
    getKeystrokes(): Array<{ character: string; timestamp: number; wpm: number }>;
}

class WPMCalculator implements WPMCalculatorInterface {
    keystrokes: Array<{ character: string; timestamp: number; wpm: number }>;
    getKeystrokes(): { character: string; timestamp: number; wpm: number; }[] {
        return this.keystrokes;
    }
    constructor() {
        this.keystrokes = [];
    }

    clearKeystrokes(): void {
        this.keystrokes = [];
    }

    recordKeystroke(character: string): number {
        let wpm: number = 0.0;
        if (this.keystrokes.length > 0) {
            // Calculate WPM for this keystroke
            const lastTimestamp = this.keystrokes[this.keystrokes.length - 1].timestamp;
            const timeDifferenceMinute = (Date.now() - lastTimestamp) / 60000.0; // Time difference in minutes
            if (timeDifferenceMinute > 0) {
                let CPM = 1 / timeDifferenceMinute;
                // The standard is that one word = 5 characters
                wpm = CPM / 5;
            }
        }
        // Record the keystroke with the current timestamp
        this.keystrokes.push({ character, timestamp: Date.now(), wpm });
        return wpm;
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
        this.head = document.createElement('div');
        this.tail = document.createElement('div');
        this.input = document.createElement('textarea');
        this.head.classList.add(TerminalCssClasses.Head);
        this.tail.classList.add(TerminalCssClasses.Tail);
        this.input.classList.add(TerminalCssClasses.Input);
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
        this.input = document.createElement('textarea');
        this.input.classList.add(TerminalCssClasses.Input);
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
    private startTime: Date | null = null;
    private outputElement: HTMLElement;
    private inputElement: ITerminalInputElement;
    private static readonly commandHistoryKey = 'terminalCommandHistory';
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
    private saveCommandHistory(commandText: string, commandTime: string): void {
        // Only keep the latest this.commandHistoryLimit number of commands
        const historyToSave = this.commandHistory.slice(-TerminalGame.commandHistoryLimit);
        localStorage.setItem(`${TerminalGame.commandHistoryKey}_${commandTime}`, JSON.stringify(historyToSave));
        localStorage.setItem(TerminalGame.wpmLogKey, JSON.stringify(this.wpmCalculator.getKeystrokes()));
        this.wpmCalculator.clearKeystrokes();
    }

    private loadCommandHistory(): void {
        for (let i = 0; i < localStorage.length; i++) {
            if (!localStorage.key(i)?.startsWith(TerminalGame.commandHistoryKey)) continue;
            const historyJSON = localStorage.getItem(TerminalGame.commandHistoryKey);
            if (historyJSON) {
                this.commandHistory = JSON.parse(historyJSON);
                if (!this.commandHistory) return;
                console.log(this.commandHistory);
                this.outputElement.innerHTML += this.commandHistory.map((command) => `${command}`).join('');
            }
        }
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
        const commandTime = new Date();
        const timeCode = this.createTimeCode(commandTime);
        const commandText = `<span class="log-time">${this.createTimeHTML(commandTime)}</span> ${command}<br>`;
        if (!this.commandHistory) { this.commandHistory = []; }
        this.commandHistory.push(commandText);
        // Truncate the history if it's too long before saving
        if (this.commandHistory.length > TerminalGame.commandHistoryLimit) {
            this.commandHistory.shift(); // Remove the oldest command
        }
        this.saveCommandHistory(commandText, timeCode.join('')); // Save updated history to localStorage
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
        head.innerHTML = `<span class="domain"><a href="https://handex.io">handex.io</a></span>@<span class="user">${user}</span>[$] via 🐹 v1.19.3 on ☁️ (us-west-1)`;
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