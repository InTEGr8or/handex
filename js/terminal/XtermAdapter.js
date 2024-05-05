// XtermAdapter.ts
import { Terminal } from '@xterm/xterm';
import { TerminalCssClasses } from './TerminalTypes';
import { WebCam } from '../utils/WebCam';
export class XtermAdapter {
    constructor(handexTerm, element) {
        this.handexTerm = handexTerm;
        this.element = element;
        this.commandHistory = [];
        this.lastTouchDistance = null;
        this.currentFontSize = 17;
        this.promptDelimiter = '$';
        this.promptLength = 0;
        this.isShowVideo = false;
        this.terminalElement = element;
        this.terminalElement.classList.add(TerminalCssClasses.Terminal);
        this.outputElement = this.createOutputElement();
        this.videoElement = this.createVideoElement();
        this.webCam = new WebCam(this.videoElement);
        this.terminalElement.prepend(this.videoElement);
        this.terminalElement.prepend(this.outputElement);
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
    setViewPortOpacity() {
        const viewPort = document.getElementsByClassName('xterm-viewport')[0];
        viewPort.style.opacity = "0.5";
    }
    loadFontSize() {
        const fontSize = localStorage.getItem('terminalFontSize');
        if (fontSize) {
            this.currentFontSize = parseInt(fontSize);
            this.terminalElement.style.fontSize = `${this.currentFontSize}px`;
            this.terminal.options.fontSize = this.currentFontSize;
        }
    }
    toggleVideo() {
        this.isShowVideo = !this.isShowVideo;
        this.webCam.toggleVideo(this.isShowVideo);
        return this.isShowVideo;
    }
    getCommandHistory() {
        return this.handexTerm.getCommandHistory();
    }
    getCurrentCommand() {
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
    onDataHandler(data) {
        // Check if the Enter key was pressed
        if (data.charCodeAt(0) === 13) { // Enter key
            // Process the command before clearing the terminal
            let command = this.getCurrentCommand();
            // Clear the terminal after processing the command
            this.terminal.reset();
            // Write the new prompt after clearing
            this.prompt();
            if (command === '')
                return;
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
            let result = this.handexTerm.handleCommand(command);
            this.outputElement.appendChild(result);
        }
        else if (data.charCodeAt(0) === 3) { // Ctrl+C
            this.terminal.reset();
            this.prompt();
        }
        else if (data.charCodeAt(0) === 127) { // Backspace
            // Remove the last character from the terminal
            if (this.terminal.buffer.active.cursorX < this.promptLength)
                return;
            this.terminal.write('\x1b[D \x1b[D');
            let cursorIndex = this.terminal.buffer.active.cursorX;
        }
        else {
            // For other input, just return it to the terminal.
            let wpm = this.handexTerm.handleCharacter(data);
            if (data.charCodeAt(0) === 27) { // escape and navigation characters
                if (data.charCodeAt(1) === 91) {
                    if (data.charCodeAt(2) === 68 && (this.terminal.buffer.active.cursorX < this.promptLength)) {
                        return;
                    }
                }
            }
            this.terminal.write(data);
        }
    }
    loadCommandHistory() {
        const commandHistory = this.handexTerm.getCommandHistory();
        this.outputElement.innerHTML = commandHistory.join('');
    }
    createOutputElement() {
        const output = document.createElement('div');
        output.id = 'terminal-output';
        output.classList.add('terminal-output');
        // Additional styles and attributes can be set here
        return output;
    }
    createVideoElement(isVisible = false) {
        const video = document.createElement('video');
        video.id = 'terminal-video';
        video.hidden = !isVisible;
        // Additional styles and attributes can be set here
        return video;
    }
    prompt(user = 'guest', host = 'handex.io') {
        const promptText = `\x1b[1;34m${user}@${host} \x1b[0m\x1b[1;32m~${this.promptDelimiter}\x1b[0m `;
        this.promptLength = promptText.length - 21;
        this.terminal.write(promptText);
        // this.promptLength = this.terminal.buffer.active.cursorX;
    }
    // Method to render data to the terminal
    renderOutput(data) {
        this.terminal.write(data);
    }
    // Implement the interface methods
    addTouchListeners() {
        this.terminalElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.terminalElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.terminalElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    handleTouchStart(event) {
        setTimeout(() => {
            this.terminalElement.focus();
        }, 500);
        if (event.touches.length === 2) {
            event.preventDefault();
            this.lastTouchDistance = this.getDistanceBetweenTouches(event.touches);
        }
    }
    handleTouchMove(event) {
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
    handleTouchEnd(event) {
        localStorage.setItem('terminalFontSize', `${this.currentFontSize}`);
        this.lastTouchDistance = null;
    }
    getDistanceBetweenTouches(touches) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2));
    }
}
//# sourceMappingURL=XtermAdapter.js.map