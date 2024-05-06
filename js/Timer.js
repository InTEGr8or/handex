import { TerminalCssClasses } from './terminal/TerminalTypes.js';
import { createElement } from "./utils/dom.js";
export class Timer {
    constructor(updateCallback, cancelCallback, inputEventCallback) {
        this.updateCallback = updateCallback;
        this._intervalId = null;
        this._centiSecond = 0;
        this.timerHandle = null;
        this.start = () => {
            if (!this.timerHandle) {
                this.timerHandle = setInterval(this.run, 10);
                this.setSvg('pause');
            }
        };
        this.setSvg = (status) => {
            switch (status) {
                case 'start':
                    this._timerSvg.innerHTML = '<use href="#start" transform="scale(2,2)" ></use>';
                    break;
                case 'stop':
                    this._timerSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
                    break;
                case 'pause':
                    this._timerSvg.innerHTML = '<use href="#pause" transform="scale(2,2)" ></use>';
                    break;
                default:
                    this._timerSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
            }
        };
        this.run = () => {
            this._centiSecond++;
            this._timerElement.innerHTML = (this._centiSecond / 100).toFixed(1);
        };
        this.cancel = () => {
            // Callback to the calling function.
            this.cancelCallback();
            // Continue with local features
            this._timerElement.innerHTML = '0.0';
            this._centiSecond = 0;
            clearInterval(this.timerHandle);
            this.timerHandle = null;
            this.setSvg('start');
        };
        this._timerElement = createElement('div', TerminalCssClasses.Timer);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = TerminalCssClasses.TimerSvg;
        svg.classList.add(TerminalCssClasses.TimerSvg);
        this._timerSvg = svg;
        this.cancelCallback = cancelCallback;
        this.inputEventCallback = inputEventCallback;
    }
    get timerElement() {
        return this._timerElement;
    }
    set timerElement(element) {
        this._timerElement = element;
    }
    get timerSvg() {
        return this._timerSvg;
    }
    set timerSvg(svg) {
        this._timerSvg = svg;
    }
    updateTimer() {
        if (this._intervalId !== null) {
            this._centiSecond++;
            this.updateCallback(this._centiSecond);
        }
    }
    get centiSecond() {
        return this._centiSecond;
    }
    // TODO: pick one of these two methods
    start_generated(interval) {
        if (this._intervalId === null) {
            this._intervalId = window.setInterval(() => {
                this._centiSecond++;
                this.updateCallback(this._centiSecond);
            }, interval);
        }
    }
    stop() {
        if (this._intervalId !== null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }
    reset() {
        this.stop();
        this._centiSecond = 0;
    }
}
//# sourceMappingURL=Timer.js.map