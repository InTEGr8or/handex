import { HandChord } from './HandChord.js';
import { CharTime, createCharTime, spaceDisplayChar } from './types/Types.js';

let timerHandle: any = null;

export class Timer {
    private intervalId: number | null = null;
    private _centiSecond: number = 0;
    private _timerElement: HTMLElement;
    private handle: any = null;

    constructor(
        private timerElement: HTMLElement,
        private updateCallback: (centiSecond: number) => void
    ) {
        this._timerElement = timerElement;
    }

    public get centiSecond(): number {
        return this._centiSecond;
    }

    // TODO: pick one of these two methods
    start(interval: number): void {
        if (this.intervalId === null) {
            this.intervalId = window.setInterval(() => {
                this._centiSecond++;
                this.updateCallback(this._centiSecond);
            }, interval);
        }
    }
    startTimer = (handChord: HandChord) => {
        if (!timerHandle) {
            timerHandle = setInterval(this.run, 10);
            this.setSvg('pause', handChord);
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
    test = (event: InputEvent, handChord: HandChord) => {
        if (event.data == handChord.nextChar) {
            const charTime = createCharTime(
                event.data as string,
                Number(((this._centiSecond - handChord.prevCharTime) / 100).toFixed(2)),
                this._centiSecond / 100
            );
            handChord.charTimer.push(charTime);
        }

        const next = handChord.setNext();
        if (next) {
            next.classList.remove("error");
        }
        handChord.prevCharTime = this._centiSecond;

        // TODO: de-overlap this and comparePhrase
        if (handChord.testArea && handChord.testArea.value.trim().length == 0) {
            // stop timer
            handChord.testArea.style.border = "";
            if (handChord.svgCharacter) handChord.svgCharacter.hidden = true;
            clearInterval(timerHandle);
            timerHandle = null;
            this._timerElement.innerHTML = (0).toFixed(1);
            handChord.timer._centiSecond = 0;
            this.setSvg('start', handChord);
            return;
        }
        if (
            handChord.svgCharacter &&
            handChord.testArea &&
            handChord.testArea.value
            == handChord
                .phrase
                ?.value
                .trim()
                .substring(0, handChord.testArea?.value.length)
        ) {
            handChord.testArea.style.border = "4px solid #FFF3";
            handChord.svgCharacter.hidden = true;
        }
        else {
            // Alert mismatched text with red border.
            if (handChord.testArea) handChord.testArea.style.border = "4px solid red";
            const chordImageHolderImg = handChord.chordImageHolder?.querySelector("img");
            if (chordImageHolderImg) chordImageHolderImg.hidden = false;
            if (handChord.svgCharacter) handChord.svgCharacter.hidden = false;
            next?.classList.add("error");
            if (handChord.errorCount)
                handChord.errorCount.innerText = (parseInt(handChord.errorCount.innerText) + 1).toString(10);
        }
        if (handChord.testArea?.value.trim() == handChord.phrase?.value.trim()) {
            // stop timer
            clearInterval(timerHandle);
            this.setSvg('stop', handChord);
            let charTimeList = "";
            handChord.charTimer.forEach(x => {
                charTimeList += `<li>${x.char.replace(' ', spaceDisplayChar)}: ${x.duration}</li>`;
            });
            if (handChord.charTimes) handChord.charTimes.innerHTML = charTimeList;
            localStorage.setItem(`charTimerSession_${(new Date).toISOString()}`, JSON.stringify(handChord.charTimer));
            timerHandle = null;
            return;
        }
        this.start(10);
    }

    setSvg = (status: 'start' | 'stop' | 'pause', handChord: HandChord): void => {
        handChord.setWpm();
        switch (status) {
            case 'start':
                if (handChord.timerSvg) handChord.timerSvg.innerHTML = '<use href="#start" transform="scale(2,2)" ></use>';
                if (handChord.testArea) handChord.testArea.disabled = false;
                if (handChord.errorCount) handChord.errorCount.innerText = '0';
                break;
            case 'stop':
                if (handChord.timerSvg) handChord.timerSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
                if (handChord.testArea) handChord.testArea.disabled = true;
                break;
            case 'pause':
                if (handChord.timerSvg) handChord.timerSvg.innerHTML = '<use href="#pause" transform="scale(2,2)" ></use>';
                break;
            default:
                if (handChord.timerSvg) handChord.timerSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
        }
    };

    private run = () => {
        this._centiSecond++;
        this._timerElement.innerHTML = (this._centiSecond / 100).toFixed(1);
    };

    cancel = (handChord: HandChord): void => {
        if (handChord.testArea) handChord.testArea.value = '';
        handChord.charTimer = [];
        handChord.prevCharTime = 0;
        if (handChord.wpm) handChord.wpm.innerText = '0';
        if (handChord.charTimes) handChord.charTimes.innerHTML = '';
        if (handChord.testArea) {
            handChord.testArea.focus();
            handChord.testArea.style.border = "";
        }
        this._timerElement.innerHTML = '0.0';
        this._centiSecond = 0;
        // clear error class from all chords
        Array
            .from(handChord.wholePhraseChords?.children ?? [])
            .forEach(function (chord) {
                chord.classList.remove("error");
                // element.setAttribute("class", "outstanding");
            });
        clearInterval(timerHandle);
        timerHandle = null;
        handChord.setNext();
        this.setSvg('start', handChord);
    }
}
