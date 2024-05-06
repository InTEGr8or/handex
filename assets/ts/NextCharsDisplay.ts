import { spaceDisplayChar, ChordRow, createCharTime, CharTime } from "./types/Types.js";
import { Timer } from "./Timer.js";
import { createElement } from "./utils/dom.js";
import { TerminalCssClasses } from "./terminal/TerminalTypes.js";
import { createHTMLElementFromHTML } from "./utils/dom.js";
import * as phrases from './phrases.json';
import { allChords } from "./allChords.js"; 

export class NextCharsDisplay {
    private _nextChars: HTMLElement;
    private _phrase: HTMLInputElement;
    private phraseString: string = '';

    private _wholePhraseChords: HTMLElement;
    private _chordImageHolder: HTMLElement;
    private _svgCharacter: HTMLElement;
    private _testMode: HTMLInputElement;
    private setWpmCallback: () => void;
    private _testArea: HTMLTextAreaElement;
    private _nextChar: string = '';
    private _timer: Timer;
    private _chordified: HTMLElement;
    private _allChordsList: HTMLElement;
    private _errorCount: HTMLElement;
    private _voiceMode: HTMLInputElement;
    private voiceSynth: SpeechSynthesis;
    private _lambdaUrl: string;
    private _prevCharTime: number = 0;
    private _charTimeArray: CharTime[] = [];
    private _charTimes: HTMLElement;


    constructor(
        cancelCallback: () => void
    ) {
        const handleInputEvent = this.test.bind(this);
        this._phrase = createElement('div', TerminalCssClasses.Phrase);
        this._lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
        this.voiceSynth = window.speechSynthesis as SpeechSynthesis;
        this._nextChars = createElement('pre', TerminalCssClasses.NextChars);
        this._nextChars.hidden = true;
        this._charTimes = createElement('div', TerminalCssClasses.CharTimes);
        this._wholePhraseChords = createElement('div', TerminalCssClasses.WholePhraseChords);
        this._allChordsList = createElement('div', TerminalCssClasses.allChordsList);
        this._chordImageHolder = createElement('div', TerminalCssClasses.ChordImageHolder);
        this._svgCharacter = createElement('img', TerminalCssClasses.SvgCharacter);
        this._testMode = createElement('input', TerminalCssClasses.TestMode) as HTMLInputElement;
        this._chordified = createElement('div', TerminalCssClasses.chordified);
        this._errorCount = createElement('div', TerminalCssClasses.errorCount);
        this._voiceMode = createElement('input', TerminalCssClasses.voiceMode) as HTMLInputElement;
        this.setWpmCallback = this.wpmCallback.bind(this);
        this._testArea = createElement('textarea', TerminalCssClasses.TestArea) as HTMLTextAreaElement;
        this._testArea.addEventListener('input', (e: Event) => {
            console.log('NextCharsDisplay testArea: input event', e);
            this.test(e as InputEvent);
        });
        this._timer = new Timer(
            this.updateDisplay.bind(this, this._testArea.value),
            cancelCallback,
            handleInputEvent
        );
        this._testArea.addEventListener('keyup', (e: Event) => {
            if (this._voiceMode && this._voiceMode.checked) {
                this.sayText(e as KeyboardEvent);
            }
        });
    }
    wpmCallback = () => {
       console.log('wpmCallback not yet implemented'); 
    }

    get chordified(): HTMLElement {
        return this._chordified;
    }
    set chordified(chordified: HTMLElement) {
        this._chordified = chordified;
    }

    set nextChars(nextCharsElement: HTMLElement) {
        this._nextChars = nextCharsElement;
    }

    set wholePhraseChords(wholePhraseChords: HTMLElement) {
        this._wholePhraseChords = wholePhraseChords;
    }
    set chordImageHolder(chordImageHolder: HTMLElement) {
        this._chordImageHolder = chordImageHolder;
    }

    set svgCharacter(svgCharacter: HTMLElement) {
        this._svgCharacter = svgCharacter;
    }

    set testMode(testMode: HTMLInputElement) {
        this._testMode = testMode;
    }

    set testArea(testArea: HTMLTextAreaElement) {
        this._testArea = testArea;
        console.log('testArea', testArea);
        this._testArea.addEventListener('input', (e: Event) => {
            console.log('NextCharsDisplay testArea: input event', e);
            this.test(e as InputEvent);
        });
    }

    get testArea(): HTMLTextAreaElement {
        return this._testArea;
    }

    reset(): void {
        this.phraseString = '';
        this.setNext('');
        this._nextChars.hidden = true;
    }

    set phrase(phrase: HTMLInputElement) {
        this._phrase = phrase;
    }
    setPhraseString(newPhrase: string): void {
        this.phraseString = newPhrase;
        this.setNext(''); // Reset the display with the new phrase from the beginning
        this._nextChars.hidden = false;
    }

    updateDisplay(testPhrase: string): void {
        const nextIndex = this.getFirstNonMatchingChar(testPhrase);
        // this.setNext(testPhrase);
        const nextChars = this.phraseString.substring(nextIndex, nextIndex + 40);
        this._nextChars.innerHTML = this.formatNextChars(nextChars);
    }

    /**
     * Calculates the words per minute (WPM) based on the text typed in the test area.
     *
     * @return {string} The calculated words per minute as a string with two decimal places.
     */
    setWpm(): string {
        if (!this.testArea) return "0";
        if (this.testArea.value.length < 2) {
            return "0";
        }

        const words = this.testArea.value.length / 5;
        return (words / (this._timer.centiSecond / 100 / 60) + 0.000001).toFixed(2);
    }

    private formatNextChars(chars: string): string {
        let result = chars;
        // Format the characters as needed for display, e.g., replace spaces, add span for the next character, etc.
        // Return the formatted string to be set as innerHTML of the nextCharsElement
        return result;
    }

    public async chordify(): Promise<Array<ChordRow>> {
        if (this._chordified) this._chordified.innerHTML = '';
        console.log("Chordifying: ", this._phrase.value);
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
        const isTestMode = this._testMode ? this._testMode.checked : false;
        chordRows.forEach((row: ChordRow, i: number) => {
            const rowDiv = document.createElement('div') as HTMLDivElement;
            const chordCode = row.chord;
            const foundChords
                = Array.from(allChords)
                    .filter(x => { return x.chordCode == chordCode.toString(); });
            // Load the clone in Chord order into the wholePhraseChords div.
            if (foundChords.length > 0) {
                // const inChord = foundChords[0].cloneNode(true) as HTMLDivElement;
                const foundChord = foundChords[0];
                const inChord = createHTMLElementFromHTML(`<div class="col-sm-2 row generated" id="chord2">
		<span id="char${foundChord.index}">d</span>
		<img loading="lazy" alt="2" src="/images/svgs/${foundChord.chordCode}.svg" width="100" class="hand">
	</div>`)
                inChord.setAttribute("name", row.char);
                inChord.hidden = isTestMode;
                Array.from(inChord.children)
                    .filter(x => x.nodeName == "IMG")
                    .forEach(x => {
                        x.setAttribute("loading", "eager");
                        // x.hidden = isTestMode;
                    });
                if (this._wholePhraseChords) this._wholePhraseChords.appendChild(inChord);
            }
            else {
                console.log("Missing chord:", chordCode);
            }
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
        this._timer.setSvg('start');
        if (this._testArea) this._testArea.focus();
        this._timer.cancel();
        this._phrase.disabled = true;
        this.setPhraseString(this._phrase.value);
        return chordRows;
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
    public setNext = (testPhrase: string): HTMLElement | null => {
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
        if (this._wholePhraseChords && nextIndex > this._wholePhraseChords.children.length - 1) return null;

        let nextCharacter = `<span class="nextCharacter">${this.phraseString.substring(nextIndex, nextIndex + 1).replace(' ', '&nbsp;')}</span>`;

        // this.updateDisplay(testPhrase);
        const nextChars = this.phraseString.substring(nextIndex, nextIndex + 40);
        this._nextChars.innerHTML = this.formatNextChars(nextChars);

        const next = this._wholePhraseChords?.children[nextIndex] as HTMLElement;
        if (next) {
            if (this._nextChar) this._nextChar = next.getAttribute("name")?.replace("Space", " ") ?? "";
            next.classList.add("next");
            // If we're in test mode and the last character typed doesn't match the next, expose the svg.
            Array.from(next.childNodes)
                .filter((x): x is HTMLImageElement => x.nodeName == "IMG")
                .forEach((x: HTMLImageElement) => {
                    x.width = 140;
                    let charSvgClone = x.cloneNode(true) as HTMLImageElement;
                    charSvgClone.hidden = this._testMode?.checked ?? false;
                    if (this._chordImageHolder) {
                        this._chordImageHolder.replaceChildren(charSvgClone);
                    }

                });
        }
        if (this._svgCharacter && next) {
            const nameAttribute = next.getAttribute("name");
            if (nameAttribute) {
                this._svgCharacter.innerHTML = nameAttribute
                    .replace("Space", spaceDisplayChar)
                    .replace("tab", "↹");
            }
        }
        if (this._svgCharacter && !this._testMode?.checked) {
            this._svgCharacter.hidden = false;
        }
        this.setWpmCallback();
        return next;
    };

    test = (event: InputEvent) => {
        console.log("test(): ", event.data);
        if (event.data == this._nextChar) {
            const charTime = createCharTime(
                event.data as string,
                Number(((this._timer.centiSecond - this._prevCharTime) / 100).toFixed(2)),
                this._timer.centiSecond / 100
            );
            this._charTimeArray.push(charTime);
        }

        const next = this.setNext(this.testArea?.value ?? '');
        if (next) {
            next.classList.remove("error");
        }
        this._prevCharTime = this._timer.centiSecond;

        // TODO: de-overlap this and comparePhrase
        if (this.testArea && this.testArea.value.trim().length == 0) {
            // stop timer
            this.testArea.style.border = "";
            if (this.svgCharacter) this.svgCharacter.hidden = true;
            this._timer.cancel();
            return;
        }
        if (
            this.svgCharacter &&
            this.testArea &&
            this.testArea.value
            == this
                ._phrase
                ?.value
                .trim()
                .substring(0, this.testArea?.value.length)
        ) {
            this.testArea.style.border = "4px solid #FFF3";
            this.svgCharacter.hidden = true;
        }
        else {
            // Alert mismatched text with red border.
            if (this.testArea) this.testArea.style.border = "4px solid red";
            const chordImageHolderImg = this.chordImageHolder?.querySelector("img");
            if (chordImageHolderImg) chordImageHolderImg.hidden = false;
            if (this.svgCharacter) this.svgCharacter.hidden = false;
            next?.classList.add("error");
            if (this._errorCount)
                this._errorCount.innerText = (parseInt(this._errorCount.innerText) + 1).toString(10);
        }
        if (this.testArea?.value.trim() == this._phrase?.value.trim()) {
            // stop timer
            this._timer.setSvg('stop');
            let charTimeList = "";
            this._charTimeArray.forEach((x: CharTime) => {
                charTimeList += `<li>${x.char.replace(' ', spaceDisplayChar)}: ${x.duration}</li>`;
            });
            if (this._charTimes) this._charTimes.innerHTML = charTimeList;
            localStorage.setItem(`charTimerSession_${(new Date).toISOString()}`, JSON.stringify(this._charTimeArray));
            this._timer.cancel();
            return;
        }
        this._timer.start();
    }
    private getFirstNonMatchingChar = (testPhrase: string): number => {
        if (!this.phraseString) return 0;
        const sourcePhrase = this.phraseString.split('');
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