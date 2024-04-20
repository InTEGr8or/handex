function pipe<T, R>(value: T, fn: (arg: T) => R): R {
    return fn(value);
}

class TerminalGame {
    private commandHistory: string[] = [];
    private wpmCounter: number = 0;
    private startTime: Date | null = null;
    private outputElement: HTMLElement;
    private inputElement: HTMLTextAreaElement;

    constructor(private terminalElement: HTMLElement) {
        this.terminalElement.classList.add('terminal');
        this.outputElement = this.createOutputElement();
        this.terminalElement.appendChild(this.outputElement);
        this.terminalElement.appendChild(this.createPromptElement());
        this.bindInput();
    }

    private createOutputElement(): HTMLElement {
        const output = document.createElement('div');
        output.classList.add('terminal-output');
        // Additional styles and attributes can be set here
        return output;
    }
    private autoExpand(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto'; // Reset the height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }

    private createInputElement(): HTMLTextAreaElement {
        const input = document.createElement('textarea');
        input.classList.add('terminal-input');
        input.title = 'Terminal Input';
        input.wrap = 'off'; // Disables soft-wrapping
        input.spellcheck = true;
        input.autofocus = true;
        input.setAttribute('rows', '1');
        input.addEventListener('input', this.autoExpand.bind(this));
        // Set additional styles and attributes as needed
        return input;
    }

    private bindInput(): void {
        if (this.inputElement) {
            this
                .inputElement
                .addEventListener(
                    'keydown',
                    (event: KeyboardEvent) => this.handleKeyPress(event)
                );
        }
    }

    private handleCommand(command: string): void {
        this.commandHistory.push(command);
        this.outputElement.innerHTML += `<span class="log-prefix">[<span class="log-time">${this.createTimeString()}</span>]</span> ${command}<br>`;
        // Additional logic for handling the command
    }
    private handleKeyPress(event: KeyboardEvent): void {
        // Logic to handle keypresses, calculate WPM, and update the progress bar
        // ...
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                this.inputElement.value += '\n';
                return;
            }
            const command = this.inputElement.value.trim();
            this.inputElement.value = '';
            this.handleCommand(command);
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

    private createPromptTail(timeString: string): HTMLElement {
        const tail = document.createElement('div');
        tail.classList.add('tail');
        tail.innerHTML = `🕐[${timeString}]❯ `;
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
        this.inputElement = this.createInputElement();

        // Create a container for the prompt tail to align it properly
        const promptTailContainer = document.createElement('div');
        promptTailContainer.classList.add('prompt-tail-container');
        const promptTail = this.createPromptTail(this.createTimeString());
        promptTailContainer.appendChild(promptTail);

        // Append the prompt tail container and the input element to the second line
        line2.appendChild(promptTailContainer);
        line2.appendChild(this.inputElement);
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