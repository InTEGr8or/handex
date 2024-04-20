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
// function setWpm() {
//     if(APP.testArea.value.length < 2){
//         APP.wpm.innerText = 0;
//         return;
//     }
//     let words = APP.testArea.value.length / 5;
//     APP.wpm.innerText = (words / (APP.timerCentiSecond / 100 / 60) + 0.000001).toFixed(2);
// }

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

class TerminalGame {
    private commandHistory: string[] = [];
    private wpmCounter: number = 0;
    private startTime: Date | null = null;
    private outputElement: HTMLElement;
    private inputElement: ITerminalInputElement;
    private static readonly commandHistoryKey = 'terminalCommandHistory';
    private static readonly commandHistoryLimit = 100;

    constructor(private terminalElement: HTMLElement) {
        this.terminalElement.classList.add(TerminalCssClasses.Terminal);
        this.outputElement = this.createOutputElement();
        this.terminalElement.appendChild(this.outputElement);
        this.terminalElement.appendChild(this.createPromptElement());
        this.loadCommandHistory();
        this.bindInput();
    }
    private saveCommandHistory(): void {
        // Only keep the latest this.commandHistoryLimit number of commands
        const historyToSave = this.commandHistory.slice(-TerminalGame.commandHistoryLimit);
        localStorage.setItem(TerminalGame.commandHistoryKey, JSON.stringify(historyToSave));
    }

    private loadCommandHistory(): void {
        const historyJSON = localStorage.getItem(TerminalGame.commandHistoryKey);
        if (historyJSON) {
            this.commandHistory = JSON.parse(historyJSON);
            if(!this.commandHistory) return;
            console.log(this.commandHistory);
            this.outputElement.innerHTML += this.commandHistory.map((command) => `${command}`).join('');
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
        const commandText = `<span class="log-prefix">[<span class="log-time">${this.createTimeString()}</span>]</span> ${command}<br>`;
        if(!this.commandHistory) { this.commandHistory = []; }
        this.commandHistory.push(commandText);
        // Truncate the history if it's too long before saving
        if (this.commandHistory.length > TerminalGame.commandHistoryLimit) {
            this.commandHistory.shift(); // Remove the oldest command
        }
        this.saveCommandHistory(); // Save updated history to localStorage
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
    }

    private createTimeString(): string {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour12: false });
    }

    private createPromptHead(user: string = 'guest'): HTMLElement {
        const head = document.createElement('div');
        head.classList.add('head');
        head.innerHTML = `<span class="domain">handex.io</span>@<span class="user">${user}</span>[$] via 🐹 v1.19.3 on ☁️ (us-west-1)`;
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
        tail.innerHTML = `🕐[${this.createTimeString()}]❯ `;
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