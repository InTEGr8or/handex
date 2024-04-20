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
      this.terminalElement.appendChild(this.outputElement);
      const firstLineElement = document.createElement("div");
      firstLineElement.classList.add("terminal-line");
      const promptHead = this.createPromptHead();
      firstLineElement.appendChild(promptHead);
      this.terminalElement.appendChild(firstLineElement);
      const secondLineElement = document.createElement("div");
      secondLineElement.classList.add("terminal-line");
      this.inputElement = this.createInputElement();
      const promptTail = this.createPromptTail(this.createTimeString());
      secondLineElement.appendChild(promptTail);
      secondLineElement.appendChild(this.inputElement);
      this.terminalElement.appendChild(secondLineElement);
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
    handleCommand(command) {
      this.commandHistory.push(command);
      this.outputElement.innerHTML += `[<span class="log-time">${this.createTimeString()}</span>] ${command}<br>`;
    }
    handleKeyPress(event) {
      if (event.key === "Enter") {
        const command = this.inputElement.value;
        this.inputElement.value = "";
        this.handleCommand(command);
      }
    }
    createTimeString() {
      const now = /* @__PURE__ */ new Date();
      return now.toLocaleTimeString("en-US", { hour12: false });
    }
    createPromptHead(user = "guest") {
      const head = document.createElement("div");
      head.classList.add("head");
      head.innerHTML = `<span class="domain">handex.io</span>@<span class="user">${user}</span>[$] via \u{1F439} v1.19.3 on \u2601\uFE0F (us-west-1)`;
      return head;
    }
    createPromptTail(timeString) {
      const tail = document.createElement("div");
      tail.classList.add("tail");
      tail.innerHTML = `\u{1F550}[${timeString}]\u276F `;
      return tail;
    }
    createPromptElement(user = "guest") {
      const prompt = document.createElement("div");
      prompt.classList.add("prompt");
      const timeString = this.createTimeString();
      prompt.innerHTML = `<span class="domain">handex.io</span>@<span class="user">${user}</span>[$] via \u{1F439} v1.19.3 on \u2601\uFE0F (us-west-1) <br>\u{1F550}[${timeString}]\u276F `;
      return prompt;
    }
    // Additional methods for calculating WPM, updating the progress bar, etc.
  };
  document.addEventListener("DOMContentLoaded", () => {
    const terminalContainer = document.getElementById("terminal");
    if (terminalContainer) {
      const terminalGame = new TerminalGame(terminalContainer);
    }
  });
})();
