// XtermAdapter.ts
import { Terminal } from '@xterm/xterm';
import { IHandexTerm } from './HandexTerm';
import { TerminalCssClasses } from './TerminalTypes';

export class XtermAdapter {
  private terminal: Terminal;
  private commandHistory: HTMLElement[] = [];
  private terminalElement: HTMLElement;
  private lastTouchDistance: number | null = null;
  private currentFontSize: number = 17;
  private outputElement: HTMLElement;
  private promptDelimiter: string = '$';

  constructor(private handexTerm: IHandexTerm, private element: HTMLElement) {
    this.terminalElement = element;
    this.terminalElement.classList.add(TerminalCssClasses.Terminal);
    this.outputElement = this.createOutputElement();
    this.terminalElement.prepend(this.outputElement);
    // this._terminalElement.appendChild(this.createPromptElement());
    this.terminal = new Terminal();
    this.terminal.open(element);
    this.terminal.onData(this.onDataHandler.bind(this));
    this.loadCommandHistory();
  }

  public getCommandHistory(): HTMLElement[] {
    return this.handexTerm.getCommandHistory();
  }

  private getCurrentCommand(): string {
    const buffer = this.terminal.buffer.active;
    // Assuming the command prompt starts at the top of the terminal (line 0)
    // Adjust the starting line accordingly if your prompt starts elsewhere
    let command = '';
    for (let i = 0; i <= buffer.cursorY; i++) {
      const line = buffer.getLine(i);
      if (line) {
        command += line.translateToString(true);
      }
    }
    return command.substring(command.indexOf(this.promptDelimiter) + 2);
  }

  public onDataHandler(data: string): void {
    // Check if the Enter key was pressed
    if (data.charCodeAt(0) === 13) { // Enter key
      // Process the command before clearing the terminal
      let buffer = this.getCurrentCommand();
      console.log(buffer);
      let result = this.handexTerm.handleCommand(buffer);

      this.outputElement.appendChild(result);

      // Clear the terminal after processing the command
      this.terminal.reset();

      // Write the new prompt after clearing
      this.prompt();
    } else if (data.charCodeAt(0) === 3) { // Ctrl+C
      this.terminal.reset();
    } else if (data.charCodeAt(0) === 127) { // Backspace
      // Remove the last character from the terminal
      this.terminal.write('\x1b[D \x1b[D');
      let cursorIndex = this.terminal.buffer.active.cursorX;
    } else {
      // For other input, just return it to the terminal.
      let wpm = this.handexTerm.handleCharacter(data);
      this.terminal.write(data);
      if (data.charCodeAt(0) === 27) return; // escape and navigation characters
    }
  }

  private loadCommandHistory(): void {
    const commandHistory = this.handexTerm.getCommandHistory();
    this.outputElement.innerHTML = commandHistory.join('');
  }

  private createOutputElement(): HTMLElement {
    const output = document.createElement('div');
    output.id = 'terminal-output';
    output.classList.add('terminal-output');
    // Additional styles and attributes can be set here
    return output;
  }

  prompt(user: string = 'guest', host: string = 'handex.io') {
    this.terminal.write(`\r\n\x1b[1;34m${user}@${host} \x1b[0m\x1b[1;32m~${this.promptDelimiter}\x1b[0m `);
  }

  // Method to render data to the terminal
  renderOutput(data: string): void {
    this.terminal.write(data);
  }

  // Implement the interface methods
  private addTouchListeners(): void {
    this.terminalElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.terminalElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.terminalElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    setTimeout(() => {
      this.terminalElement.focus();
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
        this.terminalElement.style.fontSize = `${this.currentFontSize}px`;
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
}