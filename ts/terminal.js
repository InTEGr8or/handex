(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // <stdin>
  var TerminalGame = class {
    constructor(terminalElement) {
      this.terminalElement = terminalElement;
      __publicField(this, "commandHistory", []);
      __publicField(this, "wpmCounter", 0);
      __publicField(this, "startTime", null);
      __publicField(this, "outputElement");
      __publicField(this, "inputElement");
      this.terminalElement.classList.add("terminal");
      this.outputElement = this.createOutputElement();
      this.inputElement = this.createInputElement();
      this.terminalElement.appendChild(this.outputElement);
      this.terminalElement.appendChild(this.inputElement);
      this.bindInput();
    }
    createOutputElement() {
      const output = document.createElement("div");
      output.classList.add("terminal-output");
      return output;
    }
    createInputElement() {
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("terminal-input");
      return input;
    }
    bindInput() {
      if (this.inputElement) {
        this.inputElement.addEventListener("keydown", (event) => this.handleKeyPress(event));
      }
    }
    handleKeyPress(event) {
      console.log("Key pressed:", event.key);
    }
    // ... (rest of the existing methods)
    // Additional methods for calculating WPM, updating the progress bar, etc.
  };
  document.addEventListener("DOMContentLoaded", () => {
    const terminalContainer = document.getElementById("terminal");
    if (terminalContainer) {
      const terminalGame = new TerminalGame(terminalContainer);
    }
  });
})();
