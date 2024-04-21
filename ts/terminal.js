(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // <stdin>
  var WPMCalculator = class {
    constructor() {
      __publicField(this, "keystrokes");
      this.keystrokes = [];
    }
    getKeystrokes() {
      return this.keystrokes;
    }
    clearKeystrokes() {
      this.keystrokes = [];
    }
    recordKeystroke(character) {
      let wpm = 0;
      if (this.keystrokes.length > 0) {
        const lastTimestamp = this.keystrokes[this.keystrokes.length - 1].timestamp;
        const timeDifferenceMinute = (Date.now() - lastTimestamp) / 6e4;
        if (timeDifferenceMinute > 0) {
          let CPM = 1 / timeDifferenceMinute;
          wpm = CPM / 5;
        }
      }
      this.keystrokes.push({ character, timestamp: Date.now(), wpm });
      return wpm;
    }
  };
  var TerminalInputElement = class {
    constructor() {
      __publicField(this, "input");
      this.input = document.createElement("textarea");
      this.input.classList.add("terminal-input" /* Input */);
      this.input.title = "Terminal Input";
      this.input.id = "terminal-input";
      this.input.wrap = "off";
      this.input.spellcheck = true;
      this.input.autofocus = true;
      this.input.setAttribute("rows", "1");
      this.bindInputEventListener("input", this.autoExpand);
    }
    focus() {
      this.input.focus();
    }
    bindInputEventListener(eventType, listener) {
      this.input.addEventListener(eventType, listener);
    }
    autoExpand(event) {
      const textarea = event.target;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  var _TerminalGame = class _TerminalGame {
    constructor(terminal) {
      this.terminal = terminal;
      __publicField(this, "commandHistory", []);
      __publicField(this, "wpmCalculator", new WPMCalculator());
      __publicField(this, "startTime", null);
      __publicField(this, "outputElement");
      __publicField(this, "inputElement");
      __publicField(this, "lastTouchDistance", null);
      __publicField(this, "currentFontSize");
      this.terminal.classList.add("terminal" /* Terminal */);
      this.outputElement = this.createOutputElement();
      this.terminal.appendChild(this.outputElement);
      this.terminal.appendChild(this.createPromptElement());
      this.loadCommandHistory();
      this.bindInput();
      this.addTouchListeners();
    }
    handleClick(event) {
      setTimeout(() => {
        this.inputElement.focus();
      }, 500);
    }
    addTouchListeners() {
      this.terminal.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false });
      this.terminal.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false });
      this.terminal.addEventListener("touchend", this.handleTouchEnd.bind(this));
    }
    handleTouchStart(event) {
      setTimeout(() => {
        this.inputElement.focus();
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
          this.terminal.style.fontSize = `${this.currentFontSize}px`;
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
      return Math.sqrt(
        Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2)
      );
    }
    saveCommandHistory(commandText, commandTime) {
      const historyToSave = this.commandHistory.slice(-_TerminalGame.commandHistoryLimit);
      localStorage.setItem(`${_TerminalGame.commandHistoryKey}_${commandTime}`, JSON.stringify(historyToSave));
      localStorage.setItem(_TerminalGame.wpmLogKey, JSON.stringify(this.wpmCalculator.getKeystrokes()));
      this.wpmCalculator.clearKeystrokes();
    }
    loadCommandHistory() {
      var _a;
      for (let i = 0; i < localStorage.length; i++) {
        if (!((_a = localStorage.key(i)) == null ? void 0 : _a.startsWith(_TerminalGame.commandHistoryKey)))
          continue;
        const historyJSON = localStorage.getItem(_TerminalGame.commandHistoryKey);
        if (historyJSON) {
          this.commandHistory = JSON.parse(historyJSON);
          if (!this.commandHistory)
            return;
          console.log(this.commandHistory);
          this.outputElement.innerHTML += this.commandHistory.map((command) => `${command}`).join("");
        }
      }
    }
    bindInput() {
      if (this.inputElement) {
        this.inputElement.input.addEventListener(
          "keydown",
          (event) => this.handleKeyPress(event)
        );
      }
    }
    handleCommand(command) {
      const commandTime = /* @__PURE__ */ new Date();
      const timeCode = this.createTimeCode(commandTime);
      const commandText = `<span class="log-time">${this.createTimeHTML(commandTime)}</span> ${command}<br>`;
      if (!this.commandHistory) {
        this.commandHistory = [];
      }
      this.commandHistory.push(commandText);
      if (this.commandHistory.length > _TerminalGame.commandHistoryLimit) {
        this.commandHistory.shift();
      }
      this.saveCommandHistory(commandText, timeCode.join(""));
      this.outputElement.innerHTML += commandText;
    }
    handleKeyPress(event) {
      if (event.key === "Enter") {
        if (event.shiftKey) {
          this.inputElement.input.value += "\n";
          return;
        }
        const command = this.inputElement.input.value.trim();
        this.inputElement.input.value = "";
        this.handleCommand(command);
      }
      if (event.ctrlKey && event.key === "c") {
        this.inputElement.input.value = "";
      }
      const wpm = this.wpmCalculator.recordKeystroke(event.key);
    }
    createTimeCode(now = /* @__PURE__ */ new Date()) {
      return now.toLocaleTimeString("en-US", { hour12: false }).split(":");
    }
    createTimeHTML(time = /* @__PURE__ */ new Date()) {
      const hours = time.getHours().toString().padStart(2, "0");
      const minutes = time.getMinutes().toString().padStart(2, "0");
      const seconds = time.getSeconds().toString().padStart(2, "0");
      return `<span class="log-hour">${hours}</span><span class="log-minute">${minutes}</span><span class="log-second">${seconds}</span>`;
    }
    createPromptHead(user = "guest") {
      const head = document.createElement("div");
      head.classList.add("head");
      head.innerHTML = `<span class="domain"><a href="https://handex.io">handex.io</a></span>@<span class="user">${user}</span>[$] via \u{1F439} v1.19.3 on \u2601\uFE0F (us-west-1)`;
      return head;
    }
    createOutputElement() {
      const output = document.createElement("div");
      output.classList.add("terminal-output");
      return output;
    }
    /**
     * Creates a new textarea element for user input.
     * @returns The new textarea element with the appropriate class, title, and attributes.
     */
    createPromptTail() {
      const tail = document.createElement("div");
      tail.classList.add("tail");
      tail.innerHTML = `\u{1F550}[${this.createTimeHTML()}]\u276F `;
      return tail;
    }
    createPromptElement(user = "guest") {
      const prompt = document.createElement("div");
      prompt.classList.add("prompt");
      const line1 = document.createElement("div");
      line1.classList.add("terminal-line", "first-line");
      const promptHead = this.createPromptHead(user);
      line1.appendChild(promptHead);
      prompt.appendChild(line1);
      const line2 = document.createElement("div");
      line2.classList.add("terminal-line");
      this.inputElement = new TerminalInputElement();
      const promptTailContainer = document.createElement("div");
      promptTailContainer.classList.add("prompt-tail-container");
      const promptTail = this.createPromptTail();
      promptTailContainer.appendChild(promptTail);
      line2.appendChild(promptTailContainer);
      line2.appendChild(this.inputElement.input);
      prompt.appendChild(line2);
      return prompt;
    }
    // Additional methods for calculating WPM, updating the progress bar, etc.
  };
  __publicField(_TerminalGame, "commandHistoryKey", "terminalCommandHistory");
  __publicField(_TerminalGame, "wpmLogKey", "wpmLogKey");
  __publicField(_TerminalGame, "commandHistoryLimit", 100);
  var TerminalGame = _TerminalGame;
  document.addEventListener("DOMContentLoaded", () => {
    const terminalContainer = document.getElementById("terminal");
    if (terminalContainer) {
      const terminalGame = new TerminalGame(terminalContainer);
    }
  });
})();
