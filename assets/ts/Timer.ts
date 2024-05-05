import { CharTime, createCharTime, spaceDisplayChar, CancelCallback, InputEventCallback } from './types/Types.js';


export class Timer {
    private intervalId: number | null = null;
    private _centiSecond: number = 0;
    private _timerElement: HTMLElement;
    private timerSvg: SVGElement;

    private timerHandle: any = null;
    private cancelCallback: CancelCallback;
    private inputEventCallback: InputEventCallback;

    constructor(
        private timerElement: HTMLElement,
        private updateCallback: (centiSecond: number) => void,
        timerSvg: SVGElement,
        cancelCallback: CancelCallback, 
        inputEventCallback: InputEventCallback
    ) {
        this._timerElement = timerElement;
        this.timerSvg = timerSvg;
        this.cancelCallback = cancelCallback;
        this.inputEventCallback = inputEventCallback;
    }

    public updateTimer(): void {
        if (this.intervalId !== null) {
            this._centiSecond++;
            this.updateCallback(this._centiSecond);
        }
    }

    public get centiSecond(): number {
        return this._centiSecond;
    }

    // TODO: pick one of these two methods
    public start_generated(interval: number): void {
        if (this.intervalId === null) {
            this.intervalId = window.setInterval(() => {
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
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset(): void {
        this.stop();
        this._centiSecond = 0;
    }


    setSvg = (status: 'start' | 'stop' | 'pause' ): void => {
        switch (status) {
            case 'start':
                this.timerSvg.innerHTML = '<use href="#start" transform="scale(2,2)" ></use>';
                break;
            case 'stop':
                this.timerSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
                break;
            case 'pause':
                this.timerSvg.innerHTML = '<use href="#pause" transform="scale(2,2)" ></use>';
                break;
            default:
                this.timerSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
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
