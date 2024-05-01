// HandexTerm.ts
import { TimeCode, TerminalCssClasses, LogKeys, TimeHTML } from './TerminalTypes';
import { ITerminalInputElement, TerminalInputElement } from './TerminalInputElement';
import { IWPMCalculator, WPMCalculator } from './WPMCalculator';
import { IPersistence } from './Persistence';
import { createElement } from '../utils/dom';
import { XtermAdapter } from './XtermAdapter';
export interface IHandexTerm {
  // Define the interface for your HandexTerm logic
  processInput(input: string): void;
  // Other product-specific terminal logic
  output (data: string):void;
}


export class HandexTerm implements IHandexTerm {
  // Implement the interface methods
  private _persistence: IPersistence;
  private commandHistory: string[] = [];
  private wpmCalculator: IWPMCalculator = new WPMCalculator();
  private outputElement: HTMLElement;
  private inputElement: ITerminalInputElement = new TerminalInputElement();
  private static readonly commandHistoryLimit = 100;

  constructor(private persistence: IPersistence) {
    this._persistence = persistence;
    this.outputElement = this.createOutputElement();
    this.loadCommandHistory();
    this.bindInput();
  }


 processInput(input: string): void {
    // Handle special key sequences like Enter and Ctrl+C
    if (input === '\r') { // Enter key
      // Execute the command or handle a new line
      this.output('\r\n');
      this.output('Processing command...\r\n');
      this.output('\r\n');
    } else if (input === '\x03') { // Ctrl+C
      // Handle the interrupt signal, maybe clear the current line or command
      this.output('');
    } else {
      // Handle regular character input
      // Append the input to the current command buffer, echo back, etc.
    }

    // Call the output method to update the terminal display
    this.output(input);
  }


  output(data: string): void {
    this.outputElement.innerHTML += data;
  }

  private handleClick(event: MouseEvent): void {
    setTimeout(() => {
      this.inputElement.focus();
    }, 500)
  }

  private saveCommandHistory(commandText: string, commandTime: string): number {
    // Only keep the latest this.commandHistoryLimit number of commands
    let wpmSum = this.wpmCalculator.saveKeystrokes(commandTime);
    this.wpmCalculator.clearKeystrokes();
    commandText = commandText.replace(/{{wpm}}/g, ('_____' + wpmSum.toFixed(0)).slice(-4));
    localStorage.setItem(`${LogKeys.Command}_${commandTime}`, JSON.stringify(commandText));
    return wpmSum;
  }

  private loadCommandHistory(): void {
    let keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      if (!localStorage.key(i)?.startsWith(LogKeys.Command)) continue;

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
        key.includes(LogKeys.Command)
        || key.includes('terminalCommandHistory') // Remove after clearing legacy phone db.
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
    if (this.commandHistory.length > HandexTerm.commandHistoryLimit) {
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
    const head = createElement('div', 'head');
    head.innerHTML = `<span class="user">${user}</span>@<span class="domain"><a href="https://handex.io">handex.io</a></span> via 🐹 v1.19.3 on ☁️ (us-west-1)`;
    return head;
  }

  private createOutputElement(): HTMLElement {
    const output = createElement('div', 'terminal-output');
    // Additional styles and attributes can be set here
    return output;
  }

  private createPromptTail(): HTMLElement {
    const tail = createElement('div', 'tail');
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
  // Additional product-specific methods and properties
}