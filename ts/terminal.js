"use strict";
(() => {
  // <stdin>
  var TerminalCssClasses = {
    Terminal: "terminal",
    Line: "terminal-line",
    Output: "terminal-output",
    Input: "terminal-input",
    Prompt: "prompt",
    Head: "head",
    Tail: "tail",
    LogPrefix: "log-prefix",
    LogTime: "log-time"
  };
  var LogKeys = {
    CharTime: "char-time",
    Command: "command"
  };
  function createElement(tagName, className) {
    const element = document.createElement(tagName);
    if (className) {
      element.classList.add(className);
    }
    return element;
  }
  var WPMCalculator = class {
    constructor() {
      this.previousTimestamp = 0;
      this.keystrokes = [];
    }
    getKeystrokes() {
      return this.keystrokes;
    }
    clearKeystrokes() {
      this.keystrokes = [];
    }
    saveKeystrokes(timeCode) {
      let charWpms = this.keystrokes.map(this.getWPM);
      let wpmSum = charWpms.filter((charWpm) => charWpm.wpm > 0).reduce((a, b) => a + b.wpm, 0);
      localStorage.setItem(LogKeys.CharTime + "_" + timeCode, JSON.stringify(charWpms));
      wpmSum = Math.round(wpmSum * 1e3) / 1e3;
      return wpmSum;
    }
    recordKeystroke(character) {
      let charDur = { character, durationMilliseconds: 0 };
      if (this.previousTimestamp > 0) {
        charDur.durationMilliseconds = Date.now() - this.previousTimestamp;
      }
      this.previousTimestamp = Date.now();
      this.keystrokes.push(charDur);
      return charDur;
    }
    getWPM(charDur) {
      let charWpm = { character: charDur.character, wpm: 0 };
      if (charDur.durationMilliseconds > 0) {
        let timeDifferenceMinute = charDur.durationMilliseconds / 6e4;
        if (timeDifferenceMinute > 0) {
          let CPM = 1 / timeDifferenceMinute;
          charWpm.wpm = CPM / 5;
        }
      }
      charWpm.wpm = Math.round(charWpm.wpm * 1e3) / 1e3;
      return charWpm;
    }
  };
  var TerminalInputElement = class {
    constructor() {
      this.input = createElement("textarea", TerminalCssClasses.Input);
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
      this.commandHistory = [];
      this.wpmCalculator = new WPMCalculator();
      this.lastTouchDistance = null;
      this.terminal.classList.add(TerminalCssClasses.Terminal);
      this.outputElement = this.createOutputElement();
      this.terminal.appendChild(this.outputElement);
      this.terminal.appendChild(this.createPromptElement());
      this.loadCommandHistory();
      this.bindInput();
      this.addTouchListeners();
      this.currentFontSize = 14;
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
      let wpmSum = this.wpmCalculator.saveKeystrokes(commandTime);
      this.wpmCalculator.clearKeystrokes();
      commandText = commandText.replace(/{{wpm}}/g, ("_____" + wpmSum.toFixed(0)).slice(-4));
      localStorage.setItem(`${_TerminalGame.commandHistoryKey}_${commandTime}`, JSON.stringify(commandText));
      return wpmSum;
    }
    loadCommandHistory() {
      var _a;
      let keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        if (!((_a = localStorage.key(i)) == null ? void 0 : _a.startsWith(_TerminalGame.commandHistoryKey)))
          continue;
        const key = localStorage.key(i);
        if (!key)
          continue;
        keys.push(key);
      }
      keys.sort();
      for (let key of keys) {
        const historyJSON = localStorage.getItem(key);
        if (historyJSON) {
          this.commandHistory = [JSON.parse(historyJSON)];
          if (!this.commandHistory)
            return;
          this.outputElement.innerHTML += this.commandHistory;
        }
      }
    }
    clearCommandHistory() {
      let keys = [];
      for (let i = localStorage.length; i >= 0; i--) {
        let key = localStorage.key(i);
        if (!key)
          continue;
        if (key.includes(_TerminalGame.commandHistoryKey) || key.includes("terminalCommandHistory") || key.includes(_TerminalGame.wpmLogKey) || key.includes(LogKeys.Command) || key.includes(LogKeys.CharTime)) {
          keys.push(key);
        }
      }
      for (let key of keys) {
        localStorage.removeItem(key);
      }
      this.commandHistory = [];
      this.outputElement.innerHTML = "";
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
      if (command === "clear") {
        this.clearCommandHistory();
        return;
      }
      const commandTime = /* @__PURE__ */ new Date();
      const timeCode = this.createTimeCode(commandTime);
      let commandText = `<span class="log-time">${this.createTimeHTML(commandTime)}</span><span class="wpm">{{wpm}}</span>${command}<br>`;
      if (this.commandHistory.length > _TerminalGame.commandHistoryLimit) {
        this.commandHistory.shift();
      }
      let wpm = this.saveCommandHistory(commandText, timeCode.join(""));
      commandText = commandText.replace(/{{wpm}}/g, ("_____" + wpm.toFixed(0)).slice(-4));
      if (!this.commandHistory) {
        this.commandHistory = [];
      }
      this.commandHistory.push(commandText);
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
      head.innerHTML = `<span class="user">${user}</span>@<span class="domain"><a href="https://handex.io">handex.io</a></span> via \u{1F439} v1.19.3 on \u2601\uFE0F (us-west-1)`;
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
      tail.innerHTML = `\u276F `;
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
  _TerminalGame.commandHistoryKey = "cmd";
  _TerminalGame.wpmLogKey = "wpmLogKey";
  _TerminalGame.commandHistoryLimit = 100;
  var TerminalGame = _TerminalGame;
  document.addEventListener("DOMContentLoaded", () => {
    const terminalContainer = document.getElementById("terminal");
    if (terminalContainer) {
      const terminalGame = new TerminalGame(terminalContainer);
    }
  });
})();
