var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spaceDisplayChar, createCharTime } from "./types/Types.js";
import { Timer } from "./Timer.js";
import { createElement } from "./utils/dom.js";
import { TerminalCssClasses } from "./terminal/TerminalTypes.js";
import { createHTMLElementFromHTML } from "./utils/dom.js";
import { allChords } from "./allChords.js";
export class NextCharsDisplay {
    constructor(cancelCallback) {
        this.phraseString = '';
        this._nextChar = '';
        this._prevCharTime = 0;
        this._charTimeArray = [];
        this.wpmCallback = () => {
            console.log('wpmCallback not yet implemented');
        };
        this.resetChordify = () => {
            if (this._phrase) {
                this._phrase.value = '';
                this._phrase.disabled = false;
            }
            if (this._wholePhraseChords)
                this._wholePhraseChords.innerHTML = '';
            if (this._allChordsList)
                this._allChordsList.hidden = true;
            if (this._testArea) {
                this._testArea.value = '';
                this._testArea.disabled = false;
            }
        };
        this.setNext = (testPhrase) => {
            var _a, _b, _c, _d, _e, _f;
            const nextIndex = this.getFirstNonMatchingChar(testPhrase);
            if (nextIndex < 0) {
                return null;
            }
            // Remove the outstanding class from the previous chord.
            Array
                .from((_b = (_a = this._wholePhraseChords) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [])
                .forEach((chord, i) => {
                chord.classList.remove("next");
            });
            if (this._wholePhraseChords && nextIndex > this._wholePhraseChords.children.length - 1)
                return null;
            let nextCharacter = `<span class="nextCharacter">${this.phraseString.substring(nextIndex, nextIndex + 1).replace(' ', '&nbsp;')}</span>`;
            // this.updateDisplay(testPhrase);
            const nextChars = this.phraseString.substring(nextIndex, nextIndex + 40);
            this._nextChars.innerHTML = this.formatNextChars(nextChars);
            const next = (_c = this._wholePhraseChords) === null || _c === void 0 ? void 0 : _c.children[nextIndex];
            if (next) {
                if (this._nextChar)
                    this._nextChar = (_e = (_d = next.getAttribute("name")) === null || _d === void 0 ? void 0 : _d.replace("Space", " ")) !== null && _e !== void 0 ? _e : "";
                next.classList.add("next");
                // If we're in test mode and the last character typed doesn't match the next, expose the svg.
                Array.from(next.childNodes)
                    .filter((x) => x.nodeName == "IMG")
                    .forEach((x) => {
                    var _a, _b;
                    x.width = 140;
                    let charSvgClone = x.cloneNode(true);
                    charSvgClone.hidden = (_b = (_a = this._testMode) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
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
            if (this._svgCharacter && !((_f = this._testMode) === null || _f === void 0 ? void 0 : _f.checked)) {
                this._svgCharacter.hidden = false;
            }
            this.setWpmCallback();
            return next;
        };
        this.test = (event) => {
            var _a, _b, _c, _d, _e, _f, _g;
            console.log("test(): ", event.data);
            if (event.data == this._nextChar) {
                const charTime = createCharTime(event.data, Number(((this._timer.centiSecond - this._prevCharTime) / 100).toFixed(2)), this._timer.centiSecond / 100);
                this._charTimeArray.push(charTime);
            }
            const next = this.setNext((_b = (_a = this.testArea) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '');
            if (next) {
                next.classList.remove("error");
            }
            this._prevCharTime = this._timer.centiSecond;
            // TODO: de-overlap this and comparePhrase
            if (this.testArea && this.testArea.value.trim().length == 0) {
                // stop timer
                this.testArea.style.border = "";
                if (this.svgCharacter)
                    this.svgCharacter.hidden = true;
                this._timer.cancel();
                return;
            }
            if (this.svgCharacter &&
                this.testArea &&
                this.testArea.value
                    == ((_c = this
                        ._phrase) === null || _c === void 0 ? void 0 : _c.value.trim().substring(0, (_d = this.testArea) === null || _d === void 0 ? void 0 : _d.value.length))) {
                this.testArea.style.border = "4px solid #FFF3";
                this.svgCharacter.hidden = true;
            }
            else {
                // Alert mismatched text with red border.
                if (this.testArea)
                    this.testArea.style.border = "4px solid red";
                const chordImageHolderImg = (_e = this.chordImageHolder) === null || _e === void 0 ? void 0 : _e.querySelector("img");
                if (chordImageHolderImg)
                    chordImageHolderImg.hidden = false;
                if (this.svgCharacter)
                    this.svgCharacter.hidden = false;
                next === null || next === void 0 ? void 0 : next.classList.add("error");
                if (this._errorCount)
                    this._errorCount.innerText = (parseInt(this._errorCount.innerText) + 1).toString(10);
            }
            if (((_f = this.testArea) === null || _f === void 0 ? void 0 : _f.value.trim()) == ((_g = this._phrase) === null || _g === void 0 ? void 0 : _g.value.trim())) {
                // stop timer
                this._timer.setSvg('stop');
                let charTimeList = "";
                this._charTimeArray.forEach((x) => {
                    charTimeList += `<li>${x.char.replace(' ', spaceDisplayChar)}: ${x.duration}</li>`;
                });
                if (this._charTimes)
                    this._charTimes.innerHTML = charTimeList;
                localStorage.setItem(`charTimerSession_${(new Date).toISOString()}`, JSON.stringify(this._charTimeArray));
                this._timer.cancel();
                return;
            }
            this._timer.start();
        };
        this.getFirstNonMatchingChar = (testPhrase) => {
            if (!this.phraseString)
                return 0;
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
            }
            ;
            return result;
        };
        this.sayText = (e) => {
            const eventTarget = e.target;
            // Get the input element value
            if (!eventTarget || !eventTarget.value)
                return;
            let text = eventTarget.value;
            // Get the key that was pressed
            const char = e.key;
            // If no key was pressed, return
            if (!char)
                return;
            // If the speechSynthesis object is not defined, return
            if (!this.voiceSynth) {
                this.voiceSynth = window.speechSynthesis;
            }
            // If speaking, cancel the speech
            if (this.voiceSynth.speaking) {
                this.voiceSynth.cancel();
            }
            // If the key is a-z or 0-9, use that as the text
            if (char === null || char === void 0 ? void 0 : char.match(/^[a-z0-9]$/i)) {
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
        };
        const handleInputEvent = this.test.bind(this);
        this._phrase = createElement('div', TerminalCssClasses.Phrase);
        this._lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
        this.voiceSynth = window.speechSynthesis;
        this._nextChars = createElement('pre', TerminalCssClasses.NextChars);
        this._nextChars.hidden = true;
        this._charTimes = createElement('div', TerminalCssClasses.CharTimes);
        this._wholePhraseChords = createElement('div', TerminalCssClasses.WholePhraseChords);
        this._allChordsList = createElement('div', TerminalCssClasses.allChordsList);
        this._chordImageHolder = createElement('div', TerminalCssClasses.ChordImageHolder);
        this._svgCharacter = createElement('img', TerminalCssClasses.SvgCharacter);
        this._testMode = createElement('input', TerminalCssClasses.TestMode);
        this._chordified = createElement('div', TerminalCssClasses.chordified);
        this._errorCount = createElement('div', TerminalCssClasses.errorCount);
        this._voiceMode = createElement('input', TerminalCssClasses.voiceMode);
        this.setWpmCallback = this.wpmCallback.bind(this);
        this._testArea = createElement('textarea', TerminalCssClasses.TestArea);
        this._testArea.addEventListener('input', (e) => {
            console.log('NextCharsDisplay testArea: input event', e);
            this.test(e);
        });
        this._timer = new Timer(this.updateDisplay.bind(this, this._testArea.value), cancelCallback, handleInputEvent);
        this._testArea.addEventListener('keyup', (e) => {
            if (this._voiceMode && this._voiceMode.checked) {
                this.sayText(e);
            }
        });
    }
    get chordified() {
        return this._chordified;
    }
    set chordified(chordified) {
        this._chordified = chordified;
    }
    set nextChars(nextCharsElement) {
        this._nextChars = nextCharsElement;
    }
    set wholePhraseChords(wholePhraseChords) {
        this._wholePhraseChords = wholePhraseChords;
    }
    set chordImageHolder(chordImageHolder) {
        this._chordImageHolder = chordImageHolder;
    }
    set svgCharacter(svgCharacter) {
        this._svgCharacter = svgCharacter;
    }
    set testMode(testMode) {
        this._testMode = testMode;
    }
    set testArea(testArea) {
        this._testArea = testArea;
        console.log('testArea', testArea);
        this._testArea.addEventListener('input', (e) => {
            console.log('NextCharsDisplay testArea: input event', e);
            this.test(e);
        });
    }
    get testArea() {
        return this._testArea;
    }
    reset() {
        this.phraseString = '';
        this.setNext('');
        this._nextChars.hidden = true;
    }
    set phrase(phrase) {
        this._phrase = phrase;
    }
    setPhraseString(newPhrase) {
        this.phraseString = newPhrase;
        this.setNext(''); // Reset the display with the new phrase from the beginning
        this._nextChars.hidden = false;
    }
    updateDisplay(testPhrase) {
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
    setWpm() {
        if (!this.testArea)
            return "0";
        if (this.testArea.value.length < 2) {
            return "0";
        }
        const words = this.testArea.value.length / 5;
        return (words / (this._timer.centiSecond / 100 / 60) + 0.000001).toFixed(2);
    }
    formatNextChars(chars) {
        let result = chars;
        // Format the characters as needed for display, e.g., replace spaces, add span for the next character, etc.
        // Return the formatted string to be set as innerHTML of the nextCharsElement
        return result;
    }
    chordify() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._chordified)
                this._chordified.innerHTML = '';
            console.log("Chordifying: ", this._phrase.value);
            if (!this._phrase || !this._phrase.value || this._phrase.value.trim().length == 0) {
                return [];
            }
            const phraseEncoded = btoa(this._phrase.value);
            const response = yield fetch(this._lambdaUrl, {
                method: 'POST',
                headers: {},
                body: JSON.stringify({
                    phrase: phraseEncoded
                })
            });
            const chordList = yield response.json();
            if (chordList.error) {
                console.log("chordList.error:", chordList.error);
                return [];
            }
            const chordRows = chordList.json;
            // Add each row to the chordified element as a separate div with the first character of the row as the name.
            if (this._wholePhraseChords)
                this._wholePhraseChords.innerHTML = '';
            const isTestMode = this._testMode ? this._testMode.checked : false;
            chordRows.forEach((row, i) => {
                var _a, _b;
                const rowDiv = document.createElement('div');
                const chordCode = row.chord;
                const foundChords = Array.from(allChords)
                    .filter(x => { return x.chordCode == chordCode.toString(); });
                // Load the clone in Chord order into the wholePhraseChords div.
                if (foundChords.length > 0) {
                    // const inChord = foundChords[0].cloneNode(true) as HTMLDivElement;
                    const foundChord = foundChords[0];
                    const inChord = createHTMLElementFromHTML(`<div class="col-sm-2 row generated" id="chord2">
		<span id="char${foundChord.index}">d</span>
		<img loading="lazy" alt="2" src="/images/svgs/${foundChord.chordCode}.svg" width="100" class="hand">
	</div>`);
                    inChord.setAttribute("name", row.char);
                    inChord.hidden = isTestMode;
                    Array.from(inChord.children)
                        .filter(x => x.nodeName == "IMG")
                        .forEach(x => {
                        x.setAttribute("loading", "eager");
                        // x.hidden = isTestMode;
                    });
                    if (this._wholePhraseChords)
                        this._wholePhraseChords.appendChild(inChord);
                }
                else {
                    console.log("Missing chord:", chordCode);
                }
                (_b = (_a = document.getElementById(`chord${chordCode}`)) === null || _a === void 0 ? void 0 : _a.querySelector(`img`)) === null || _b === void 0 ? void 0 : _b.setAttribute("loading", "eager");
                // document.querySelector(`#${chordCode}`).hidden = false;
                rowDiv.id = i.toString();
                rowDiv.setAttribute("name", row.char);
                const charSpan = document.createElement('span');
                charSpan.innerHTML = row.char;
                rowDiv.appendChild(charSpan);
                rowDiv.appendChild(document.createTextNode(row.strokes));
                if (this._chordified)
                    this._chordified.appendChild(rowDiv);
            });
            this.setNext('');
            this._timer.setSvg('start');
            if (this._testArea)
                this._testArea.focus();
            this._timer.cancel();
            this._phrase.disabled = true;
            this.setPhraseString(this._phrase.value);
            return chordRows;
        });
    }
}
//# sourceMappingURL=NextCharsDisplay.js.map