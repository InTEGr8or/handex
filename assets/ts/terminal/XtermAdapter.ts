// XtermAdapter.ts
import { Terminal } from '@xterm/xterm';
import { IHandexTerm } from './HandexTerm';
import { TerminalCssClasses } from './TerminalTypes';
import { IWebCam, WebCam } from '../utils/WebCam';
import { NextCharsDisplay } from '../NextCharsDisplay';
import { createElement } from '../utils/dom';
import * as phrases from '../phrases.json';

export class XtermAdapter {
  private terminal: Terminal;
  private terminalElement: HTMLElement;
  private lastTouchDistance: number | null = null;
  private currentFontSize: number = 17;
  private outputElement: HTMLElement;
  private videoElement: HTMLVideoElement;
  private promptDelimiter: string = '$';
  private promptLength: number = 0;
  private webCam: IWebCam;
  private isShowVideo: boolean = false;

  private nextCharsDisplay: NextCharsDisplay;
  private chordImageHolder: HTMLElement;
  private wholePhraseChords: HTMLElement | null = null;
  private isInPhraseMode: boolean = false;

  constructor(private handexTerm: IHandexTerm, private element: HTMLElement) {
    this.terminalElement = element;
    this.terminalElement.classList.add(TerminalCssClasses.Terminal);
    this.videoElement = this.createVideoElement();
    this.webCam = new WebCam(this.videoElement);
    this.terminalElement.prepend(this.videoElement);
    this.chordImageHolder = this.findOrConstructChordImageHolder();
    this.wholePhraseChords = document.getElementById(TerminalCssClasses.WholePhraseChords) as HTMLElement;
    this.wholePhraseChords = createElement('div', TerminalCssClasses.WholePhraseChords);
    this.wholePhraseChords.hidden = true;
    // this.chordImageHolder.hidden = true;
    this.outputElement = this.createOutputElement();
    this.nextCharsDisplay = new NextCharsDisplay();
    this.nextCharsDisplay.nextChars.style.float = 'left';
    this.nextCharsDisplay.phrase.hidden = true;
    this.nextCharsDisplay.isTestMode = true;
    this.terminalElement.prepend(this.nextCharsDisplay.nextCharsRate);
    // this.terminalElement.prepend(this.nextCharsDisplay.timer.timerSvg)
    this.terminalElement.prepend(this.outputElement);
    this.terminalElement.prepend(this.wholePhraseChords);
    this.terminalElement.append(this.chordImageHolder);
    this.terminal = new Terminal({
      fontFamily: '"Fira Code", Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',
      cursorBlink: true,
      cursorStyle: 'block'
    });
    this.terminal.open(element);
    this.terminal.onData(this.onDataHandler.bind(this));
    this.loadCommandHistory();
    this.setViewPortOpacity();
    this.addTouchListeners();
    this.loadFontSize();
  }

  findOrConstructChordImageHolder(): HTMLDivElement {
    let result = document.getElementById(TerminalCssClasses.ChordImageHolder) as HTMLDivElement;
    if (!result) {
      console.log(`Chord image holder not found at #${TerminalCssClasses.ChordImageHolder}, being created`);
      result = createElement("div", TerminalCssClasses.ChordImageHolder)
    }
    return result;
  }

  wpmCallback = () => {
    console.log("Timer not implemented");
  }

  public onDataHandler(data: string): void {
    // Check if the Enter key was pressed
    if (data.charCodeAt(0) === 3) { // Ctrl+C
      this.isInPhraseMode = false;
      this.terminal.reset();
      this.prompt();
    } else if (data.charCodeAt(0) === 127) { // Backspace
      // Remove the last character from the terminal
      if (this.terminal.buffer.active.cursorX < this.promptLength) return;
      this.terminal.write('\x1b[D \x1b[D');
      // let cursorIndex = this.terminal.buffer.active.cursorX;
    }
    if (data.charCodeAt(0) === 13) { // Enter key
      this.nextCharsDisplay.cancelTimer();
      // Process the command before clearing the terminal
      let command = this.getCurrentCommand();
      // Clear the terminal after processing the command
      this.terminal.reset();
      this.nextCharsDisplay.resetTimer();
      // Write the new prompt after clearing
      this.prompt();
      if (command === '') return;
      if (command === 'clear') {
        this.handexTerm.clearCommandHistory();
        this.outputElement.innerHTML = '';
        return;
      }
      if (command === 'video') {
        this.toggleVideo();
        let result = this.handexTerm.handleCommand(command + ' --' + this.isShowVideo);
        this.outputElement.appendChild(result);
        return;
      }
      if (command === 'phrase') {

        const phrase = this.getRandomPhrase();
        let result = this.nextCharsDisplay.phrase.value = phrase;
        this.nextCharsDisplay.nextChars.hidden = false;
        this.nextCharsDisplay.nextChars.innerHTML = phrase;
        this.isInPhraseMode = true;

      }
      let result = this.handexTerm.handleCommand(command);
      this.outputElement.appendChild(result);
    } else if (this.isInPhraseMode) {
      this.terminal.write(data);
      let command = this.getCurrentCommand();
      if(command.length === 0){
        this.nextCharsDisplay.resetTimer();
        return;
      }
      this.nextCharsDisplay.testInput(command);
    } else {
      // For other input, just return it to the terminal.
      let wpm = this.handexTerm.handleCharacter(data);

      if (data.charCodeAt(0) === 27) { // escape and navigation characters
        // console.log(
        //   "BufferXY:", this.terminal.buffer.active.cursorX, this.terminal.buffer.active.cursorY,
        //   "lines", this.terminal.buffer.active.viewportY, "chars:", data.split('').map(x => x.charCodeAt(0)));
        if (data.charCodeAt(1) === 91) {
          if(data.charCodeAt(2) === 65 && this.terminal.buffer.active.cursorY < 2) {
            return;
          }
          if (
            data.charCodeAt(2) === 68 
            && (
              this.terminal.buffer.active.cursorX < this.promptLength 
              && this.terminal.buffer.active.cursorY === 0)
            ) {
            return;
          }
        }
      }
    
      this.terminal.write(data);
    }
  }
  getRandomPhrase(): string {
    const keys = Object.keys(phrases);
    if (keys.length === 0) return '';
    const randomKey = keys[Math.floor(Math.random() * keys.length)] as keyof typeof phrases;
    const result = phrases[randomKey];
    return result;
  }

  private setViewPortOpacity(): void {
    const viewPort = document.getElementsByClassName('xterm-viewport')[0] as HTMLDivElement;
    viewPort.style.opacity = "0.5";
  }

  private loadFontSize(): void {
    const fontSize = localStorage.getItem('terminalFontSize');
    if (fontSize) {
      this.currentFontSize = parseInt(fontSize);
      this.terminalElement.style.fontSize = `${this.currentFontSize}px`;
      this.terminal.options.fontSize = this.currentFontSize;
    }
  }

  public toggleVideo(): boolean {
    this.isShowVideo = !this.isShowVideo;
    this.webCam.toggleVideo(this.isShowVideo);
    return this.isShowVideo;
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

  private createVideoElement(isVisible: boolean = false): HTMLVideoElement {
    const video = document.createElement('video');
    video.id = 'terminal-video';
    video.hidden = !isVisible;
    // Additional styles and attributes can be set here
    return video;
  }

  prompt(user: string = 'guest', host: string = 'handex.io') {
    const promptText = `\x1b[1;34m${user}@${host} \x1b[0m\x1b[1;32m~${this.promptDelimiter}\x1b[0m `;
    this.promptLength = promptText.length - 21;
    this.terminal.write(promptText);
    // this.promptLength = this.terminal.buffer.active.cursorX;
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
        const currentFontSize = this.terminal.options.fontSize;
        this.terminal.options.fontSize = this.currentFontSize;
        this.terminal.refresh(0, this.terminal.rows - 1); // Refresh the terminal display
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    localStorage.setItem('terminalFontSize', `${this.currentFontSize}`);
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