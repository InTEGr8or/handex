export class Timer {
    constructor(timerElement, updateCallback, timerSvg, cancelCallback, inputEventCallback) {
        this.timerElement = timerElement;
        this.updateCallback = updateCallback;
        this.intervalId = null;
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
        this._timerElement = timerElement;
        this.timerSvg = timerSvg;
        this.cancelCallback = cancelCallback;
        this.inputEventCallback = inputEventCallback;
    }
    updateTimer() {
        if (this.intervalId !== null) {
            this._centiSecond++;
            this.updateCallback(this._centiSecond);
        }
    }
    get centiSecond() {
        return this._centiSecond;
    }
    // TODO: pick one of these two methods
    start_generated(interval) {
        if (this.intervalId === null) {
            this.intervalId = window.setInterval(() => {
                this._centiSecond++;
                this.updateCallback(this._centiSecond);
            }, interval);
        }
    }
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    reset() {
        this.stop();
        this._centiSecond = 0;
    }
}
//# sourceMappingURL=Timer.js.map