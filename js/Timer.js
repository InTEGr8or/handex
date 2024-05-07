import { TerminalCssClasses } from './terminal/TerminalTypes.js';
export class Timer {
    constructor(inputEventCallback) {
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
            this._timerElement.innerText = (this._centiSecond / 100).toFixed(1);
            // console.log("timer: ",this._centiSecond, this._timerElement.innerText);
        };
        this.cancel = () => {
            // Cancel the timer and reset values.
            this._timerElement.innerHTML = '0.0';
            this._centiSecond = 0;
            clearInterval(this.timerHandle);
            this.timerHandle = null;
            this.setSvg('start');
        };
        this.success = () => {
            // Callback to the calling function.
            console.log("Timer Success");
            // Continue with local features
            this._centiSecond = 0;
            clearInterval(this.timerHandle);
            this.timerHandle = null;
            this.setSvg('start');
        };
        this._timerElement = document.getElementById(TerminalCssClasses.Timer);
        if (!this._timerElement) {
            console.log(`Timer element not found #${TerminalCssClasses.Timer}`);
        }
        const timerSvgElement = document.getElementById(TerminalCssClasses.TimerSvg);
        if (!(timerSvgElement instanceof SVGElement)) {
            console.log('Element is not an SVGElement', TerminalCssClasses.TimerSvg, timerSvgElement);
        }
        else {
            this._timerSvg = timerSvgElement;
        }
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
    get centiSecond() {
        return this._centiSecond;
    }
    // TODO: pick one of these two methods
    start_generated(interval) {
        if (this._intervalId === null) {
            this._intervalId = window.setInterval(() => {
                this._centiSecond++;
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