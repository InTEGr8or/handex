// XtermAdapter.ts
import { Terminal } from '@xterm/xterm';
import { IHandexTerm } from './HandexTerm';
import { TerminalCssClasses } from './TerminalTypes';

export class XtermAdapter {
  private terminal: Terminal;
  private terminalElement: HTMLElement;
  private lastTouchDistance: number | null = null;
  private currentFontSize: number = 17;
  private outputElement: HTMLElement;

  constructor(private handexTerm: IHandexTerm, private element: HTMLElement) {
    this.terminalElement = element;
    this.terminalElement.classList.add(TerminalCssClasses.Terminal);
    this.outputElement = this.createOutputElement();
    this.terminalElement.prepend(this.outputElement);
    // this._terminalElement.appendChild(this.createPromptElement());
    this.terminal = new Terminal();
    this.terminal.open(element);
    this.terminal.onData(this.onDataHandler.bind(this));
  }


  private onDataHandler(data: string): void {
    // Check if the Enter key was pressed
    if (data === '\r') {
      // Process the command before clearing the terminal
      let result = this.handexTerm.processInput(data);
      console.log(result);
      this.outputElement.appendChild(result);

      // Clear the terminal after processing the command
      this.clear();

      // Write the new prompt after clearing
      this.prompt();
    } else {
      // For other input, just pass it to the HandexTerm's processInput
      this.handexTerm.processInput(data);
    }
  }

  private createOutputElement(): HTMLElement {
    const output = document.createElement('div');
    output.classList.add('terminal-output');
    // Additional styles and attributes can be set here
    return output;
  }

  clear(): void {
    this.terminal.clear();
  }

  prompt(user: string = 'guest', host: string = 'handex.io') {
    this.terminal.write(`\x1b[1;34m${user}@${host} \x1b[0m\x1b[1;32m~$\x1b[0m `);
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
  // Methods to integrate xterm.js functionality with HandexTerm
}