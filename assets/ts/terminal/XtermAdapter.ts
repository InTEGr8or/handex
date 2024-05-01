// XtermAdapter.ts
import { Terminal } from '@xterm/xterm';
import { IHandexTerm } from './HandexTerm';
import { TerminalCssClasses } from './TerminalTypes';

export class XtermAdapter {
  private terminal: Terminal;
  private terminalElement: HTMLElement;
  private lastTouchDistance: number | null = null;
  private currentFontSize: number = 17;

  constructor(private handexTerm: IHandexTerm, private element: HTMLElement) {
    this.terminalElement = element;
    this.terminalElement.classList.add(TerminalCssClasses.Terminal);
    this.terminalElement.appendChild(this.outputElement);
    // this._terminalElement.appendChild(this.createPromptElement());
    this.terminal = new Terminal();
    this.terminal.open(element);
    this.terminal.onData((data: string) => {
      this.handexTerm.processInput(data);
    });
  }

  clearTerminal(): void {
    this.terminal.clear();
  }

  // Method to render data to the terminal
  renderOutput(data: string): void {
    this.terminal.write(data);
  }

  // Implement the interface methods
  attachToXterm(term: Terminal): void {
    term.onData((data: string) => {
      this.handexTerm.processInput(data); 
    });
  }

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