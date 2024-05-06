import { TerminalCssClasses } from './terminal/TerminalTypes.js';
import { CharTime, createCharTime, spaceDisplayChar, CancelCallback, InputEventCallback } from './types/Types.js';
import { createElement } from "./utils/dom.js";

export class Timer {
    private _intervalId: number | null = null;
    private _centiSecond: number = 0;
    private _timerElement: HTMLElement;
    private _timerSvg: SVGElement;

    private timerHandle: any = null;
    private cancelCallback: CancelCallback;
    private inputEventCallback: InputEventCallback;

    constructor(
        private updateCallback: (centiSecond: number) => void,
        cancelCallback: CancelCallback, 
        inputEventCallback: InputEventCallback
    ) {
        this._timerElement = createElement('div', TerminalCssClasses.Timer);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = TerminalCssClasses.TimerSvg;
        svg.classList.add(TerminalCssClasses.TimerSvg);
        this._timerSvg = svg;
        this.cancelCallback = cancelCallback;
        this.inputEventCallback = inputEventCallback;
    }
    get timerElement(): HTMLElement {
        return this._timerElement;
    }
    set timerElement(element: HTMLElement) {
        this._timerElement = element;
    }
    get timerSvg(): SVGElement {
        return this._timerSvg;
    }
    set timerSvg(svg: SVGElement) {
        this._timerSvg = svg;
    }

    public updateTimer(): void {
        if (this._intervalId !== null) {
            this._centiSecond++;
            this.updateCallback(this._centiSecond);
        }
    }

    public get centiSecond(): number {
        return this._centiSecond;
    }

    // TODO: pick one of these two methods
    public start_generated(interval: number): void {
        if (this._intervalId === null) {
            this._intervalId = window.setInterval(() => {
                this._centiSecond++;
                this.updateCallback(this._centiSecond);
            }, interval);
        }
    }
    public start = () => {
        if (!this.timerHandle) {
            this.timerHandle = setInterval(this.run, 10);
            this.setSvg('pause');
        }
    };

    stop(): void {
        if (this._intervalId !== null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    reset(): void {
        this.stop();
        this._centiSecond = 0;
    }

    setSvg = (status: 'start' | 'stop' | 'pause' ): void => {
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

    private run = () => {
        this._centiSecond++;
        this._timerElement.innerHTML = (this._centiSecond / 100).toFixed(1);
    };

    cancel = (): void => {
        // Callback to the calling function.
        this.cancelCallback();
        
        // Continue with local features
        this._timerElement.innerHTML = '0.0';
        this._centiSecond = 0;
        clearInterval(this.timerHandle);
        this.timerHandle = null;
        this.setSvg('start');
    }
}
