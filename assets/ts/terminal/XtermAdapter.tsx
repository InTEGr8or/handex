// XtermAdapter.ts
import { Terminal } from '@xterm/xterm';
import { HandexTerm, IHandexTerm } from './HandexTerm';
import { TerminalCssClasses } from './TerminalTypes';
import { IWebCam, WebCam } from '../utils/WebCam';
import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot, Root } from 'react-dom/client';
import { NextCharsDisplay } from '../NextCharsDisplay';
import { createElement } from '../utils/dom';
import { Output } from '../terminal/Output';

interface XtermAdapterState {
  commandLine: string;
  isInPhraseMode: boolean;
  isActive: boolean;
  outputElements: HTMLElement[]
}

interface XtermAdapterProps {
  terminalElement: HTMLElement | null;
  terminalElementRef: React.RefObject<HTMLElement>;
}

export class XtermAdapter extends React.Component<XtermAdapterProps, XtermAdapterState> {


  private nextCharsDisplayRef: React.RefObject<NextCharsDisplay> = React.createRef();
  private handexTerm: IHandexTerm;
  private nextCharsRate: HTMLDivElement;
  private terminal: Terminal;
  private terminalElement: HTMLElement | null = null;
  private terminalElementRef: React.RefObject<HTMLElement>;
  private lastTouchDistance: number | null = null;
  private currentFontSize: number = 17;
  // private outputElement: HTMLElement;
  private videoElement: HTMLVideoElement;
  private promptDelimiter: string = '$';
  private promptLength: number = 0;
  private webCam: IWebCam;
  private isShowVideo: boolean = false;

  private nextCharsDisplayRoot: Root | null = null;

  private wholePhraseChords: HTMLElement | null = null;
  private isInPhraseMode: boolean = false;

  constructor(props: XtermAdapterProps, state: XtermAdapterState) {
    super(props);
    const { terminalElement, terminalElementRef } = props;
    this.terminalElementRef = terminalElementRef;
    this.handexTerm = new HandexTerm();
    const commandHistory = this.getCommandHistory();
    console.log('XtermAdapter constructor() this.handexTerm', this.handexTerm, commandHistory);
    this.state = {
      commandLine: '',
      isInPhraseMode: false,
      isActive: false,
      outputElements: this.getCommandHistory()
    }
    this.videoElement = this.createVideoElement();
    this.webCam = new WebCam(this.videoElement);
    // this.terminalElement.prepend(this.videoElement);
    this.wholePhraseChords = document.getElementById(TerminalCssClasses.WholePhraseChords) as HTMLElement;
    this.nextCharsRate = document.getElementById(TerminalCssClasses.NextCharsRate) as HTMLDivElement;
    this.wholePhraseChords = createElement('div', TerminalCssClasses.WholePhraseChords);
    // this.wholePhraseChords.hidden = true;
    // this.chordImageHolder.hidden = true;
    // this.outputElement = this.createOutputElement();
    // this.terminalElement.prepend(this.nextCharsDisplay.timer.timerSvg)
    // this.terminalElement.prepend(this.nextCharsRate);
    // this.terminalElement.prepend(this.outputElement);
    // this.terminalElement.prepend(this.wholePhraseChords);
    this.terminal = new Terminal({
      fontFamily: '"Fira Code", Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',
      cursorBlink: true,
      cursorStyle: 'block'
    });
  }

  initializeTerminal() {
    const { terminalElementRef } = this.props;
    if (terminalElementRef?.current) {
      this.terminalElementRef = terminalElementRef;
      this.terminal.open(terminalElementRef.current);
      console.log('XtermAdapter.initializeTerminal() terminal opened', terminalElementRef.current);
      // Other terminal initialization code...
    }
  }

  componentDidUpdate(prevProps: Readonly<XtermAdapterProps>, prevState: Readonly<XtermAdapterState>, snapshot?: any): void {
    console.log('XtermAdapter.componentDidUpdate()', prevProps.terminalElementRef?.current, this.props.terminalElementRef?.current);
    if (prevProps.terminalElementRef?.current !== this.props.terminalElementRef?.current) {
      this.initializeTerminal();
    }
  }

  componentDidMount() {
    const { terminalElement, terminalElementRef } = this.props;
    console.log('document.getElementById(TerminalCssClasses.Terminal)', document.getElementById(TerminalCssClasses.Terminal));
    console.log('terminalElement', terminalElement);
    if (terminalElementRef?.current) {
      this.initializeTerminal();
    } else {
      console.error('terminalElementRef.current is NULL');
    }
    this.terminal.onData(this.onDataHandler.bind(this));
    // this.loadCommandHistory();
    // this.setViewPortOpacity();
    // this.addTouchListeners();
    // this.loadFontSize();
  }

  renderNextCharsDisplay() {
    // Find or create a container element where you want to mount your React component.
    const container = document.getElementById(TerminalCssClasses.NextCharsRate) as HTMLElement;

    // Create a root and render your React component.
    // Check if a root has been created
    if (!this.nextCharsDisplayRoot) {
      // If not, create a root and save the reference
      this.nextCharsDisplayRoot = createRoot(container);
      // this.nextCharsDisplay.nextChars.style.float = 'left';
      // this.nextCharsDisplay.phrase.hidden = true;
      // this.nextCharsDisplay.isTestMode = true;
      // this.terminalElement.prepend(this.nextCharsDisplay.nextCharsRate);
    }

    // Now use the root to render your React component.
    this.nextCharsDisplayRoot.render(
      <NextCharsDisplay
        onTimerStatusChange={this.handleTimerStatusChange}
        ref={this.nextCharsDisplayRef}
        commandLine={this.state.commandLine}
        onNewPhraseSet={this.handleNewPhraseSet}
      />
    );
  }

  wpmCallback = () => {
    console.log("Timer not implemented");
  }

  public onDataHandler(data: string): void {
    // Check if the Enter key was pressed
    if (data.charCodeAt(0) === 3) { // Ctrl+C
      this.setState({ isInPhraseMode: false });
      this.terminal.reset();
      this.prompt();
    } else if (data.charCodeAt(0) === 127) { // Backspace
      // Remove the last character from the terminal
      if (this.terminal.buffer.active.cursorX < this.promptLength) return;
      this.terminal.write('\x1b[D \x1b[D');
      // let cursorIndex = this.terminal.buffer.active.cursorX;
    }
    if (data.charCodeAt(0) === 13) { // Enter key
      // Process the command before clearing the terminal
      // TODO: cancel timer
      if (this.nextCharsDisplayRef.current) this.nextCharsDisplayRef.current.cancelTimer();
      let command = this.getCurrentCommand();
      // Clear the terminal after processing the command
      this.terminal.reset();
      // TODO: reset timer
      // Write the new prompt after clearing
      this.prompt();
      if (command === '') return;
      if (command === 'clear') {
        this.handexTerm.clearCommandHistory();
        this.setState({ outputElements: [] });
        return;
      }
      if (command === 'video') {
        this.toggleVideo();
        let result = this.handexTerm.handleCommand(command + ' --' + this.isShowVideo);
        this.setState(prevState => ({ outputElements: [...prevState.outputElements, result] }));
        return;
      }
      if (command === 'phrase') {

        console.log("phrase");
        this.setState({ isInPhraseMode: true });
      }
      let result = this.handexTerm.handleCommand(command);
      this.setState(prevState => ({ outputElements: [...prevState.outputElements, result] }));
    } else if (this.state.isInPhraseMode) {
      this.terminal.write(data);
      let command = this.getCurrentCommand();
      this.setState({ commandLine: command });
      if (command.length === 0) {

        if (this.nextCharsDisplayRef.current) this.nextCharsDisplayRef.current.resetTimer();
        return;
      }
      this.setState({ commandLine: command });
    } else {
      // For other input, just return it to the terminal.
      let wpm = this.handexTerm.handleCharacter(data);

      if (data.charCodeAt(0) === 27) { // escape and navigation characters
        // console.log(
        //   "BufferXY:", this.terminal.buffer.active.cursorX, this.terminal.buffer.active.cursorY,
        //   "lines", this.terminal.buffer.active.viewportY, "chars:", data.split('').map(x => x.charCodeAt(0)));
        if (data.charCodeAt(1) === 91) {
          if (data.charCodeAt(2) === 65 && this.terminal.buffer.active.cursorY < 2) {
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

  private setViewPortOpacity(): void {
    const viewPort = document.getElementsByClassName('xterm-viewport')[0] as HTMLDivElement;
    viewPort.style.opacity = "0.5";
  }

  private loadFontSize(): void {
    const fontSize = localStorage.getItem('terminalFontSize');
    if (fontSize) {
      this.currentFontSize = parseInt(fontSize);
      if (this.terminalElement) {

        this.terminalElement.style.fontSize = `${this.currentFontSize}px`;
      } else {
        console.error('XtermAdapter:211 - terminalElement is NULL');
      }
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
  // private addTouchListeners(): void {
  //   this.terminalElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
  //   this.terminalElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
  //   this.terminalElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
  // }

  private handleTouchStart(event: TouchEvent): void {
    setTimeout(() => {
      // this.terminalElement.focus();
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
        // TODO:
        // this.terminalElement.style.fontSize = `${this.currentFontSize}px`;
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

  handleNewPhraseSet(phrase: string) {
    this.setState({ isInPhraseMode: true, commandLine: phrase });
  }
  handleTimerStatusChange(isActive: boolean) {
    console.log('handleTimerStatusChange', isActive);
    this.setState({ isActive });
  }

  render() {
    // Use state and refs in your render method
    return (
      <>
        <Output
          elements={this.state.outputElements}
        />
        <NextCharsDisplay
          ref={this.nextCharsDisplayRef}
          onTimerStatusChange={this.handleTimerStatusChange}
          onNewPhraseSet={this.handleNewPhraseSet}
          commandLine={this.state.commandLine}
        />
        <div
          ref={this.terminalElementRef as React.RefObject<HTMLDivElement>}
          id={TerminalCssClasses.Terminal}
          className={TerminalCssClasses.Terminal}
        />
        <video
          id="terminal-video"
          hidden={!this.isShowVideo}
        ></video>
      </>
    );
  }
}