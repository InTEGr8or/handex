import { createElement } from '../utils/dom';
import { TerminalCssClasses } from './TerminalTypes';
class TerminalPrompt {
    constructor() {
        this.head = createElement('div', TerminalCssClasses.Head);
        this.tail = createElement('div', TerminalCssClasses.Tail);
        this.input = createElement('textarea', TerminalCssClasses.Input);
        this.head.appendChild(this.input);
        this.tail.appendChild(this.input);
    }
    toString() {
        return this.input.value;
    }
}
export class TerminalInputElement {
    constructor() {
        this.input = createElement('textarea', TerminalCssClasses.Input);
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
//# sourceMappingURL=TerminalInputElement.js.map