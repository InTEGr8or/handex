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
        this.terminalElement.appendChild(this.outputElement);
        // this._terminalElement.appendChild(this.createPromptElement());
        this.terminal = new xterm_1.Terminal();
        this.terminal.open(element);
        this.terminal.onData((data) => {
            this.handexTerm.processInput(data);
        });
    }
    clearTerminal() {
        this.terminal.clear();
    }
    // Method to render data to the terminal
    renderOutput(data) {
        this.terminal.write(data);
    }
    // Implement the interface methods
    attachToXterm(term) {
        term.onData((data) => {
            this.handexTerm.processInput(data);
        });
    }
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