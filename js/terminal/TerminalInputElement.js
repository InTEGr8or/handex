"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalInputElement = void 0;
const dom_1 = require("../utils/dom");
const TerminalTypes_1 = require("./TerminalTypes");
class TerminalPrompt {
    constructor() {
        this.head = (0, dom_1.createElement)('div', TerminalTypes_1.TerminalCssClasses.Head);
        this.tail = (0, dom_1.createElement)('div', TerminalTypes_1.TerminalCssClasses.Tail);
        this.input = (0, dom_1.createElement)('textarea', TerminalTypes_1.TerminalCssClasses.Input);
        this.head.appendChild(this.input);
        this.tail.appendChild(this.input);
    }
    toString() {
        return this.input.value;
    }
}
class TerminalInputElement {
    constructor() {
        this.input = (0, dom_1.createElement)('textarea', TerminalTypes_1.TerminalCssClasses.Input);
        this.input.title = 'Terminal Input';
        this.input.id = 'terminal-input';
        this.input.wrap = 'off'; // Disables soft-wrapping
        this.input.spellcheck = true;
        this.input.autofocus = true;
        this.input.setAttribute('rows', '1');
        // Set additional properties and attributes
        // Optionally, bind the 'input' event listener here if it's standard for all input elements
        this.bindInputEventListener('input', this.autoExpand);
    }
    focus() {
        this.input.focus();
    }
    bindInputEventListener(eventType, listener) {
        this.input.addEventListener(eventType, listener);
    }
    autoExpand(event) {
        const textarea = event.target;
        textarea.style.height = 'auto'; // Reset the height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
}
exports.TerminalInputElement = TerminalInputElement;
//# sourceMappingURL=TerminalInputElement.js.map