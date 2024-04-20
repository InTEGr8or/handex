
class TerminalGame {
  private commandHistory: string[] = [];
  private wpmCounter: number = 0;
  private startTime: Date | null = null;
  private outputElement: HTMLElement;
  private inputElement: HTMLInputElement;

  constructor(private terminalElement: HTMLElement) {
    this.terminalElement.classList.add('terminal');
    this.outputElement = this.createOutputElement();
    this.terminalElement.appendChild(this.outputElement);

    const firstLineElement = document.createElement('div');
    firstLineElement.classList.add('terminal-line');
    const promptHead = this.createPromptHead();
    firstLineElement.appendChild(promptHead);
    this.terminalElement.appendChild(firstLineElement);
    
    const secondLineElement = document.createElement('div');
    secondLineElement.classList.add('terminal-line');
    this.inputElement = this.createInputElement();
    const promptTail = this.createPromptTail(this.createTimeString());
    secondLineElement.appendChild(promptTail);
    secondLineElement.appendChild(this.inputElement);
    this.terminalElement.appendChild(secondLineElement);
    this.bindInput();
  }

  private createOutputElement(): HTMLElement {
    const output = document.createElement('div');
    output.classList.add('terminal-output');
    // Additional styles and attributes can be set here
    return output;
  }

  private createInputElement(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('terminal-input');
    // Additional styles and attributes can be set here
    return input;
  }

  private bindInput(): void {
    if (this.inputElement) {
      this.inputElement.addEventListener('keydown', (event: KeyboardEvent) => this.handleKeyPress(event));
    }
  }

  private handleCommand(command: string): void {
    this.commandHistory.push(command);
    this.outputElement.innerHTML += `[<span class="log-time">${this.createTimeString()}</span>] ${command}<br>`;
    // Additional logic for handling the command
  }
  private handleKeyPress(event: KeyboardEvent): void {
    // Logic to handle keypresses, calculate WPM, and update the progress bar
    // ...
    if (event.key === 'Enter') {
        const command = this.inputElement.value;
        this.inputElement.value = '';
        this.handleCommand(command);
    }
  }

    private createTimeString(): string {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour12: false });
    }

    private createPromptHead(user:string = 'guest'): HTMLElement {
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

    private createPromptElement(user:string = 'guest'): HTMLElement {
        const prompt = document.createElement('div');
        prompt.classList.add('prompt');
        const timeString = this.createTimeString();
        prompt.innerHTML = `<span class="domain">handex.io</span>@<span class="user">${user}</span>[$] via 🐹 v1.19.3 on ☁️ (us-west-1) <br>🕐[${timeString}]❯ `;
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