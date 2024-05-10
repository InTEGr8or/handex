import { Chord, spaceDisplayChar, ChordRow, createCharTime, CharTime } from "./types/Types.js";
import { createElement } from "./utils/dom.js";
import { TerminalCssClasses } from "./terminal/TerminalTypes.js";
import { createHTMLElementFromHTML } from "./utils/dom.js";
import { WPMCalculator } from "./terminal/WPMCalculator.js";

import React, { createRef } from 'react';
import { createRoot, Root } from 'react-dom/client'; // Import createRoot
import Timer from './Timer.js'; // Import the React component
import { allChords } from "./allChords.js";
import { TimerContext } from './TimerContext'; // use the correct relative path


export class NextCharsDisplay {
    private _nextChars: HTMLElement;
    private _phrase: HTMLInputElement;

    private _wholePhraseChords: HTMLElement;
    private _chordImageHolder: HTMLElement;
    private _svgCharacter: HTMLElement;
    private _testMode: HTMLInputElement;
    private _testArea: HTMLTextAreaElement;
    private _nextChar: string = '';
    // private _timer: Timer;
    private _timerRoot: HTMLElement | null = null;
    private _timerRef: React.RefObject<any>;
    private timerComponentRoot: Root | null = null;
    private _chordified: HTMLElement;
    private _allChordsList: HTMLElement;
    private _errorCount: HTMLElement;
    private _voiceMode: HTMLInputElement;
    private voiceSynth: SpeechSynthesis;
    private _lambdaUrl: string;
    private _prevCharTime: number = 0;
    private _charTimeArray: CharTime[] = [];
    private _charTimes: HTMLElement;
    private _wpm: HTMLSpanElement;
    private _centiSecond: number = 0;
    public isTestMode: boolean;

    constructor() {
        const handleInputEvent = this.testInput.bind(this);
        this._phrase = createElement('div', TerminalCssClasses.Phrase);
        this._lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
        this.voiceSynth = window.speechSynthesis as SpeechSynthesis;
        this._nextChars = document.getElementById(TerminalCssClasses.NextChars) as HTMLElement;
        this._nextChars.hidden = true;
        this._wpm = createElement('div', TerminalCssClasses.WPM) as HTMLSpanElement;
        this._charTimes = createElement('div', TerminalCssClasses.CharTimes);
        this._wholePhraseChords = createElement('div', TerminalCssClasses.WholePhraseChords);
        this._allChordsList = createElement('div', TerminalCssClasses.allChordsList);
        this._chordImageHolder = document.querySelector(`#${TerminalCssClasses.ChordImageHolder}`) as HTMLElement;
        this._svgCharacter = createElement('img', TerminalCssClasses.SvgCharacter);
        this._testMode = createElement('input', TerminalCssClasses.TestMode) as HTMLInputElement;
        this.attachTestMode();
        this._chordified = createElement('div', TerminalCssClasses.chordified);
        this._errorCount = document.getElementById(TerminalCssClasses.errorCount) as HTMLSpanElement;
        this._voiceMode = createElement('input', TerminalCssClasses.voiceMode) as HTMLInputElement;
        this._testArea = (document.getElementById(TerminalCssClasses.TestArea) as HTMLTextAreaElement);
        this.isTestMode = localStorage.getItem('testMode') == 'true';
        this._timerRef = createRef();
        this.mountTimer();
        // this._timer = new Timer();
        this.attachEventListeners();

    }
    mountTimer() {
        this._timerRoot = document.getElementById('timer-root');
        console.log('timerRoot', this._timerRoot);
        if (this._timerRoot) {
            this.timerComponentRoot = createRoot(this._timerRoot); // Create a root
            this.timerComponentRoot.render(<Timer ref={this._timerRef} />); // Render the Timer component with the ref
        }
    }

    stopTimer() {
        if (this._timerRef.current){
            this._timerRef.current.stop();
        }
    }



    findOrConstructPhrase(): HTMLInputElement {
        let result = document.getElementById(TerminalCssClasses.Phrase) as HTMLInputElement;
        if (!result) {
            console.log(`Phrase not found at document.getElementById('${TerminalCssClasses.Phrase}')`, document.getElementById(TerminalCssClasses.Phrase));
            result = createElement('input', TerminalCssClasses.Phrase)
        }
        return result;
    }

    attachEventListeners() {
        if (this._testArea) {
            this._testArea.addEventListener('keyup', (e: Event) => {
                if (this._voiceMode && this._voiceMode.checked) {
                    this.sayText(e as KeyboardEvent);
                }
            })
            this._testArea.addEventListener('input', (e: Event) => {
                this.testInput(this._testArea.value);
            });
        }
    }
    set wpm(wpm: HTMLSpanElement) {
        this._wpm = wpm;
    }
    get phrase(): HTMLInputElement {
        return this._phrase;
    }
    public get nextChars(): HTMLElement {
        return this._nextChars;
    }

    get chordified(): HTMLElement {
        return this._chordified;
    }

    set testMode(testMode: HTMLInputElement) {
        this._testMode = testMode;
        this._testMode.checked = localStorage.getItem('testMode') == 'true';
        this.isTestMode = this._testMode.checked;
        this.attachTestMode();
    }

    private attachTestMode() {
        this._testMode.addEventListener('change', e => {
            localStorage.setItem('testMode', this.isTestMode.valueOf().toString());
            this.getWpm();
        })
    }

    set testArea(testArea: HTMLTextAreaElement) {
        this._testArea = testArea;
        this._testArea.addEventListener('input', (e: Event) => {
            this.testInput(this._testArea.value);
        });
    }

    get testArea(): HTMLTextAreaElement {
        return this._testArea;
    }

    reset(): void {
        this._phrase.value = '';
        this.setNext('');
        this._nextChars.hidden = true;
    }

    set phrase(phrase: HTMLInputElement) {
        this._phrase = phrase;
    }
    setPhraseString(newPhrase: string): void {
        this._phrase.innerText = newPhrase;
        this.setNext(''); // Reset the display with the new phrase from the beginning
        this._nextChars.hidden = false;
    }

    updateDisplay(testPhrase: string): void {
        const nextIndex = this.getFirstNonMatchingChar(testPhrase);
        this.setNext(testPhrase);
        const nextChars = this._phrase.value.substring(nextIndex, nextIndex + 40);
        this._nextChars.innerHTML = this.formatNextChars(nextChars);
    }
    getNextCharacters(testPhrase: string, fullPhrase: string): string {
        const nextIndex = this.getFirstNonMatchingChar(testPhrase);
        const nextChars = fullPhrase.substring(nextIndex, nextIndex + 40);
        return nextChars;
    }

    getCurrentCentiSecond = () => {
        const timerContext = TimerContext._currentValue;
        return timerContext.getCentiSecond();
    }

    /**
     * Calculates the words per minute (WPM) based on the text typed in the test area.
     *
     * @return {string} The calculated words per minute as a string with two decimal places.
     */
    getWpm(): string {
        if (!this._testArea) return "0";
        if (this._testArea.value.length < 2) {
            return "0";
        }

        const words = this._testArea.value.length / 5;
        const result = (words / (this._centiSecond / 100 / 60) + 0.000001).toFixed(2);
        return result;
    }

    private formatNextChars(chars: string): string {
        let result = chars;
        // Format the characters as needed for display, e.g., replace spaces, add span for the next character, etc.
        // Return the formatted string to be set as innerHTML of the nextCharsElement
        return result;
    }

    createChordHTML(foundChord: Chord): HTMLElement {
        return createHTMLElementFromHTML(
            `<div class="col-sm-2 row generated" id="chord2">
                <span id="char${foundChord.index}">${foundChord.key}</span>
                <img loading="lazy" alt="2" src="/images/svgs/${foundChord.chordCode}.svg" width="100" class="hand">
            </div>`
        )
    }

    findChordHTML(chordChar: string): HTMLElement | null {
        let inChord: HTMLElement | null = null;
        const foundChords
            = Array.from(allChords)
                .filter(x => { return x.key == chordChar; });
        // Load the clone in Chord order into the wholePhraseChords div.
        if (foundChords.length > 0) {
            // const inChord = foundChords[0].cloneNode(true) as HTMLDivElement;
            const foundChord = foundChords[0];
            inChord = this.createChordHTML(foundChord);
            inChord.setAttribute("name", foundChord.key);
            inChord.hidden = this.isTestMode;
        }
        else {
            console.log("Missing chord:", chordChar);
        }
        return inChord;
    }
    public async chordify(): Promise<Array<ChordRow>> {
        if (this._chordified) this._chordified.innerHTML = '';
        if (!this._phrase || !this._phrase.value || this._phrase.value.trim().length == 0) {
            return [];
        }
        const phraseEncoded = btoa(this._phrase.value);
        const response = await fetch(this._lambdaUrl, {
            method: 'POST',
            headers: {

            },
            body: JSON.stringify({
                phrase: phraseEncoded
            })
        });
        const chordList = await response.json();
        if (chordList.error) {
            console.log("chordList.error:", chordList.error);
            return [];
        }
        const chordRows = chordList.json as Array<ChordRow>;
        // Add each row to the chordified element as a separate div with the first character of the row as the name.
        if (this._wholePhraseChords) this._wholePhraseChords.innerHTML = '';
        chordRows.forEach((row: ChordRow, i: number) => {
            const rowDiv = document.createElement('div') as HTMLDivElement;
            const chordCode = row.chord.toString(16);
            let inChord = this.findChordHTML(row.char);
            if (this._wholePhraseChords && inChord) this._wholePhraseChords.appendChild(inChord);
            document.getElementById(`chord${chordCode}`)?.querySelector(`img`)?.setAttribute("loading", "eager");
            // document.querySelector(`#${chordCode}`).hidden = false;
            rowDiv.id = i.toString();
            rowDiv.setAttribute("name", row.char);
            const charSpan = document.createElement('span');
            charSpan.innerHTML = row.char;
            rowDiv.appendChild(charSpan);
            rowDiv.appendChild(document.createTextNode(row.strokes));
            if (this._chordified) this._chordified.appendChild(rowDiv);
        });
        this.setNext('');
        // this._timer.setSvg('start');
        if (this._testArea) this._testArea.focus();
        this._phrase.disabled = true;
        this.setPhraseString(this._phrase.value);
        return chordRows;
    }
    cancelTimer = () => {
        console.log("cancelTimer");
        if(this._timerRef.current) {
            this._timerRef.current.stop();
        }
        this._nextChars.innerText = this._phrase.value;
        this._chordImageHolder.textContent = '';
        if (this._testArea) {
            this._testArea.style.border = "2px solid lightgray";
            this._testArea.disabled = false;
            this._testArea.value = '';
            this._testArea.focus();
        }

    }
    resetChordify = () => {
        if (this._phrase) {
            this._phrase.value = '';
            this._phrase.disabled = false;
        }
        if (this._wholePhraseChords) this._wholePhraseChords.innerHTML = '';
        if (this._allChordsList) this._allChordsList.hidden = true;
        if (this._testArea) {
            this._testArea.value = '';
            this._testArea.disabled = false;
        }
    };
    private setNext = (testPhrase: string): HTMLElement | null => {
        const nextIndex = this.getFirstNonMatchingChar(testPhrase);
        if (nextIndex < 0) {
            return null;
        }
        // Remove the outstanding class from the previous chord.
        Array
            .from(this._wholePhraseChords?.children ?? [])
            .forEach((chord, i) => {
                chord.classList.remove("next");
            });

        if (nextIndex > this._phrase.value.length - 1) {
            return null;
        }

        let nextCharacter = `<span class="nextCharacter">${this._phrase.value.substring(nextIndex, nextIndex + 1).replace(' ', '&nbsp;')}</span>`;

        // this.updateDisplay(testPhrase);
        const nextChars = this._phrase.value.substring(nextIndex, nextIndex + 40);
        this._nextChars.innerHTML = this.formatNextChars(nextChars);

        const next = this._wholePhraseChords?.children[nextIndex] as HTMLElement;
        let inChord = this.findChordHTML(nextChars[0]);

        if (inChord) {
            inChord.classList.add("next");
            this._chordImageHolder.replaceChildren(inChord);
        }

        if (this._svgCharacter && next) {
            const nameAttribute = next.getAttribute("name");
            if (nameAttribute) {
                this._svgCharacter.innerHTML = nameAttribute
                    .replace("Space", spaceDisplayChar)
                    .replace("tab", "↹");
            }
        }
        if (this._svgCharacter && !this.isTestMode) {
            this._svgCharacter.hidden = false;
        }
        this._wpm.innerText = this.getWpm();
        return next;
    };

    cancel = () => {
        if (this._testArea) {
            this._testArea.value = '';
            this._testArea.focus();
            this._testArea.style.border = "";
        }
        this._charTimeArray = [];
        this._prevCharTime = 0;
        if (this.wpm) this.wpm.innerText = '0';
        if (this._charTimes) this._charTimes.innerHTML = '';
        // clear error class from all chords
        Array
            .from(this._wholePhraseChords.children)
            .forEach(
                (chord: HTMLElement) => {
                    chord.classList.remove("error");
                }
            );
        this.setNext('');
    }

    testInput = (inputString: string) => {
        const currentChar = inputString.slice(-1); // Get the last character of the inputString
        const expectedChar = this._nextChar; // Expected character to be typed next

        // Use WPM calculator here.
        if (currentChar === expectedChar) {
            const charTime = createCharTime(
                currentChar,
                Number(((this._centiSecond - this._prevCharTime) / 100).toFixed(2)),
                this._centiSecond / 100
            );
            this._charTimeArray.push(charTime);
        }

        const next = this.setNext(inputString);
        if (next) {
            next.classList.remove("error");
        }
        this._prevCharTime = this._centiSecond;

        // TODO: de-overlap this and comparePhrase
        if (inputString.length === 0) {
            // stop timer
            if (this._testArea) this._testArea.style.border = "";
            const chordImageHolderChild = this._chordImageHolder?.firstChild as HTMLImageElement;
            if (chordImageHolderChild) chordImageHolderChild.hidden = true;
            this.cancelTimer();
            return;
        }

        if (inputString
            == this._phrase.value
                .trim().substring(0, inputString.length)
        ) {
            if (this._testArea) this._testArea.style.border = "4px solid #FFF3";
            if (this._svgCharacter) this._svgCharacter.hidden = true;
            this._nextChars.textContent = this.getNextCharacters(inputString, this._phrase.value);
        }
        else {
            // MISMATCHED
            // Alert mismatched text with red border.
            if (this._testArea) this._testArea.style.border = "4px solid red";
            if (this._svgCharacter) {
                // this._svgCharacter
                this._svgCharacter.hidden = false;
                // this._chordImageHolder.appendChild(this._svgCharacter);
                this._chordImageHolder.hidden = false;
            }
            let firstChild = this._chordImageHolder.children[0] as HTMLElement;
            if (firstChild) firstChild.hidden = false;
            // const chordImageHolderChild = this._chordImageHolder?.firstChild as HTMLImageElement;
            // if (chordImageHolderChild) chordImageHolderChild.hidden = false;
            next?.classList.add("error");
            if (this._errorCount)
                this._errorCount.innerText = (parseInt(this._errorCount.innerText) + 1).toString(10);
        }

        if (inputString.trim() == this._phrase.value.trim()) {
            // SUCCESS 
            // SHOW completion indication
            // this._timer.setSvg('stop');
            if (this._testArea) {
                this._testArea.classList.add('disabled');
                this._testArea.disabled = true;
                this._testArea.style.border = "4px solid #0F0A";
            }
            let charTimeList = "";
            this._charTimeArray.forEach((x: CharTime) => {
                charTimeList += `<li>${x.char.replace(' ', spaceDisplayChar)}: ${x.duration}</li>`;
            });

            if (this._charTimes) this._charTimes.innerHTML = charTimeList;
            localStorage
                .setItem(
                    `charTimerSession_${(new Date).toISOString()}`,
                    JSON.stringify(this._charTimeArray)
                );
            // this._timer.success();
            return;
        }
        // this._timer.start();
    }

    private getFirstNonMatchingChar = (testPhrase: string): number => {
        if (!this._phrase.value) return 0;
        const sourcePhrase = this._phrase.value.split('');
        if (testPhrase.length == 0) {
            return 0;
        }
        var result = 0;
        for (let i = 0; i < testPhrase.length; i++) {
            if (testPhrase[i] !== sourcePhrase[i]) {
                return i;
            }
            result++;
        };
        return result;
    };
    sayText = (e: KeyboardEvent) => {
        const eventTarget = e.target as HTMLInputElement;
        // Get the input element value
        if (!eventTarget || !eventTarget.value) return;
        let text = eventTarget.value;
        // Get the key that was pressed
        const char = e.key;
        // If no key was pressed, return
        if (!char) return;
        // If the speechSynthesis object is not defined, return
        if (!this.voiceSynth) {
            this.voiceSynth = window.speechSynthesis;
        }
        // If speaking, cancel the speech
        if (this.voiceSynth.speaking) {
            this.voiceSynth.cancel();
        }
        // If the key is a-z or 0-9, use that as the text
        if (char?.match(/^[a-z0-9]$/i)) {
            text = char;
        }
        // If the key is Backspace, say "delete"
        else if (char == "Backspace") {
            text = "delete";
        }
        // If the key is Enter, say the text
        else if (char == "Enter") {
            text = text;
        }
        // If the key is not one of the above, get the last word in the text
        else {
            const textSplit = text.trim().split(' ');
            text = textSplit[textSplit.length - 1];
        }
        // Create a new speech utterance
        var utterThis = new SpeechSynthesisUtterance(text);
        // Set the pitch and rate
        utterThis.pitch = 1;
        utterThis.rate = 0.7;
        // Speak the text
        this.voiceSynth.speak(utterThis);
    }
}