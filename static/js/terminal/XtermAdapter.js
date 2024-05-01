"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtermAdapter = void 0;
// XtermAdapter.ts
const xterm_1 = require("@xterm/xterm");
const TerminalTypes_1 = require("./TerminalTypes");
class XtermAdapter {
    constructor(handexTerm, element) {
        this.handexTerm = handexTerm;
        this.element = element;
        this.lastTouchDistance = null;
        this.currentFontSize = 17;
        this.terminalElement = element;
        this.terminalElement.classList.add(TerminalTypes_1.TerminalCssClasses.Terminal);
        this.outputElement = this.createOutputElement();
        this.terminalElement.prepend(this.outputElement);
        // this._terminalElement.appendChild(this.createPromptElement());
        this.terminal = new xterm_1.Terminal();
        this.terminal.open(element);
        this.terminal.onData(this.onDataHandler.bind(this));
    }
    onDataHandler(data) {
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
        }
        else {
            // For other input, just pass it to the HandexTerm's processInput
            this.handexTerm.processInput(data);
        }
    }
    createOutputElement() {
        const output = document.createElement('div');
        output.classList.add('terminal-output');
        // Additional styles and attributes can be set here
        return output;
    }
    clear() {
        this.terminal.clear();
    }
    prompt(user = 'guest', host = 'handex.io') {
        this.terminal.write(`\x1b[1;34m${user}@${host} \x1b[0m\x1b[1;32m~$\x1b[0m `);
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
            }
        }
    }
    handleTouchEnd(event) {
        this.lastTouchDistance = null;
    }
    getDistanceBetweenTouches(touches) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2));
    }
}
exports.XtermAdapter = XtermAdapter;
//# sourceMappingURL=XtermAdapter.js.map