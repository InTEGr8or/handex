// HandexTerm.ts
import { LogKeys, TimeHTML } from './TerminalTypes';
import { IWPMCalculator, WPMCalculator } from './WPMCalculator';
import { IPersistence } from './Persistence';
import { createElement } from '../utils/dom';
import { createHTMLElementFromHTML } from '../utils/dom';

export interface IHandexTerm {
  // Define the interface for your HandexTerm logic
  handleCommand(input: string): HTMLElement;
  clearCommandHistory(): void;
  handleCharacter(character: string): number;
  getCommandHistory(): HTMLElement[];
}

export class HandexTerm implements IHandexTerm {
  // Implement the interface methods
  private _persistence: IPersistence;
  private _commandHistory: HTMLElement[] = [];
  private wpmCalculator: IWPMCalculator = new WPMCalculator();
  private static readonly commandHistoryLimit = 100;
  private wholePhraseChords: HTMLElement | null = null;
  private chordImageHolder: HTMLElement | null = null;
  private svgCharacter: HTMLElement | null = null;
  private testMode: HTMLInputElement | null = null;
  private setWpmCallback: () => void = () => {};

  constructor(private persistence: IPersistence,) {
    this._persistence = persistence;
    this.wholePhraseChords = createElement('div', 'whole-phrase-chords')
  }

  public handleCommand(command: string): HTMLElement {
    let status = 404;
    let response = "Command not found.";
    if (command === 'clear') {
      status = 200;
      this.clearCommandHistory();
      return new HTMLElement();
    }
    if (command === 'play') {
      status = 200;
      response = "Would you like to play a game?"
    }
    if(command === 'phrase') {
      status = 200;
      response = "Type the phrase as fast as you can."
    }
    if (command.startsWith('video --')) {
      status = 200;
      if (command === 'video --true') {
        response = "Starting video camera..."
      }
      else {
        response = "Stopping video camera..."
      }
    }

    // Truncate the history if it's too long before saving
    if (this._commandHistory.length > HandexTerm.commandHistoryLimit) {
      this._commandHistory.shift(); // Remove the oldest command
    }
    const commandTime = new Date();
    const timeCode = this.createTimeCode(commandTime);
    let commandText = this.createCommandRecord(command, commandTime);
    const commandElement = createHTMLElementFromHTML(commandText);
    let commandResponseElement = document.createElement('div');
    commandResponseElement.dataset.status = status.toString();
    commandResponseElement.appendChild(commandElement);
    commandResponseElement.appendChild(createHTMLElementFromHTML(`<div class="response">${response}</div>`));
    let wpm = this.saveCommandResponseHistory(commandResponseElement, timeCode.join('')); // Save updated history to localStorage
    commandText = commandText.replace(/{{wpm}}/g, ('_____' + wpm.toFixed(0)).slice(-4));
    if (!this._commandHistory) { this._commandHistory = []; }
    this._commandHistory.push(commandResponseElement);
    return commandResponseElement;
  }

  parseCommand(input: string): void {
    const args = input.split(/\s+/); // Split the input by whitespace
    const command = args[0]; // The first element is the command
    const options = args.slice(1); // The rest are the associated options/arguments

    // Now you can handle the command and options
    

    // Based on the command, you can switch and call different functions
    switch (command) {
      case 'someCommand':
        // Handle 'someCommand'
        break;
      // Add cases for other commands as needed
      default:
        // Handle unknown command
        break;
    }
  }

  getCommandHistory(): HTMLElement[] {
    let keys: string[] = [];
    let commandHistory: HTMLElement[] = [];
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
        commandHistory.push(JSON.parse(historyJSON));
      }
    }
    return commandHistory;
  }

  private saveCommandResponseHistory(commandResponseElement: HTMLDivElement, commandTime: string): number {
    // Only keep the latest this.commandHistoryLimit number of commands
    let wpmSum = this.wpmCalculator.saveKeystrokes(commandTime);
    this.wpmCalculator.clearKeystrokes();
    commandResponseElement.innerHTML = commandResponseElement.innerHTML.replace(/{{wpm}}/g, ('_____' + wpmSum.toFixed(0)).slice(-4));
    this._persistence.setItem(`${LogKeys.Command}_${commandTime}`, JSON.stringify(commandResponseElement.innerHTML));
    return wpmSum;
  }

  clearCommandHistory(): void {
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
    this._commandHistory = [];
  }


  public handleCharacter(character: string): number {
    return this.wpmCalculator.recordKeystroke(character).durationMilliseconds;
  }

  createCommandRecord(command: string, commandTime: Date): string {
    let commandText = `<div class="log-line"><span class="log-time">[${this.createTimeHTML(commandTime)}]</span><span class="wpm">{{wpm}}</span>${command}</div>`;
    return commandText;
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

}