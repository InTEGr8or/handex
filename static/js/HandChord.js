var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { NextCharsDisplay } from "./NextCharsDisplay.js";
import { Timer } from "./Timer.js";
import { spaceDisplayChar, createCharTime } from "./types/Types.js";
export class HandChord {
    constructor() {
        var _a, _b, _c, _d, _e, _f;
        this.test = (event) => {
            var _a, _b, _c, _d, _e;
            if (event.data == this.nextChar) {
                const charTime = createCharTime(event.data, Number(((this.timer.centiSecond - this.prevCharTime) / 100).toFixed(2)), this.timer.centiSecond / 100);
                this.charTimer.push(charTime);
            }
            const next = this.setNext();
            if (next) {
                next.classList.remove("error");
            }
            this.prevCharTime = this.timer.centiSecond;
            // TODO: de-overlap this and comparePhrase
            if (this.testArea && this.testArea.value.trim().length == 0) {
                // stop timer
                this.testArea.style.border = "";
                if (this.svgCharacter)
                    this.svgCharacter.hidden = true;
                this.timer.cancel();
                return;
            }
            if (this.svgCharacter &&
                this.testArea &&
                this.testArea.value
                    == ((_a = this
                        .phrase) === null || _a === void 0 ? void 0 : _a.value.trim().substring(0, (_b = this.testArea) === null || _b === void 0 ? void 0 : _b.value.length))) {
                this.testArea.style.border = "4px solid #FFF3";
                this.svgCharacter.hidden = true;
            }
            else {
                // Alert mismatched text with red border.
                if (this.testArea)
                    this.testArea.style.border = "4px solid red";
                const chordImageHolderImg = (_c = this.chordImageHolder) === null || _c === void 0 ? void 0 : _c.querySelector("img");
                if (chordImageHolderImg)
                    chordImageHolderImg.hidden = false;
                if (this.svgCharacter)
                    this.svgCharacter.hidden = false;
                next === null || next === void 0 ? void 0 : next.classList.add("error");
                if (this.errorCount)
                    this.errorCount.innerText = (parseInt(this.errorCount.innerText) + 1).toString(10);
            }
            if (((_d = this.testArea) === null || _d === void 0 ? void 0 : _d.value.trim()) == ((_e = this.phrase) === null || _e === void 0 ? void 0 : _e.value.trim())) {
                // stop timer
                this.timer.setSvg('stop');
                let charTimeList = "";
                this.charTimer.forEach((x) => {
                    charTimeList += `<li>${x.char.replace(' ', spaceDisplayChar)}: ${x.duration}</li>`;
                });
                if (this.charTimes)
                    this.charTimes.innerHTML = charTimeList;
                localStorage.setItem(`charTimerSession_${(new Date).toISOString()}`, JSON.stringify(this.charTimer));
                this.timer.cancel();
                return;
            }
            this.timer.start();
        };
        this.saveMode = (modeEvent) => {
            // chordify();
            // Hide the chordified sub-divs.
            const result = modeEvent.target.checked;
            localStorage.setItem(modeEvent.target.id, result.toString());
            return result;
        };
        this.toggleVideo = (setOn) => {
            var _a;
            if (setOn) {
                navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment'
                    }
                })
                    .then((stream) => {
                    if (this.preview) {
                        this.preview.srcObject = stream;
                    }
                });
                if (this.videoSection && this.chordSection)
                    this.videoSection.appendChild(this.chordSection);
            }
            else {
                const divContent = document.querySelector("div.content");
                if (divContent && this.chordSection) {
                    // Safely use divContent here
                    divContent.appendChild(this.chordSection);
                }
                if ((_a = this.preview) === null || _a === void 0 ? void 0 : _a.srcObject) {
                    this.preview.srcObject.getTracks().forEach(track => track.stop());
                    this.preview.srcObject = null;
                }
            }
            if (this.videoSection)
                this.videoSection.hidden = !setOn;
            if (this.phrase)
                this.phrase.classList.toggle('phrase-over-video', setOn);
            if (this.chordSection)
                this.chordSection.classList.toggle('chord-section-over-video', setOn);
            return !setOn;
        };
        this.setNext = () => {
            var _a, _b, _c, _d, _e, _f, _g;
            const nextIndex = this.getFirstNonMatchingChar();
            if (nextIndex < 0) {
                return;
            }
            // Remove the outstanding class from the previous chord.
            Array
                .from((_b = (_a = this.wholePhraseChords) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [])
                .forEach((chord, i) => {
                chord.classList.remove("next");
            });
            if (this.wholePhraseChords && nextIndex > this.wholePhraseChords.children.length - 1)
                return;
            let nextCharacter = `<span class="nextCharacter">${(_c = this.phrase) === null || _c === void 0 ? void 0 : _c.value.substring(nextIndex, nextIndex + 1).replace(' ', '&nbsp;')}</span>`;
            console.log("nextIndex:", nextIndex);
            this.nextCharsDisplay.updateDisplay(nextIndex);
            const next = (_d = this.wholePhraseChords) === null || _d === void 0 ? void 0 : _d.children[nextIndex];
            if (next) {
                if (this.nextChar)
                    this.nextChar = (_f = (_e = next.getAttribute("name")) === null || _e === void 0 ? void 0 : _e.replace("Space", " ")) !== null && _f !== void 0 ? _f : "";
                next.classList.add("next");
                // If we're in test mode and the last character typed doesn't match the next, expose the svg.
                Array.from(next.childNodes)
                    .filter((x) => x.nodeName == "IMG")
                    .forEach((x) => {
                    var _a, _b;
                    x.width = 140;
                    let charSvgClone = x.cloneNode(true);
                    charSvgClone.hidden = (_b = (_a = this.testMode) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
                    if (this.chordImageHolder)
                        this.chordImageHolder.replaceChildren(charSvgClone);
                });
            }
            if (this.svgCharacter && next) {
                const nameAttribute = next.getAttribute("name");
                if (nameAttribute) {
                    this.svgCharacter.innerHTML = nameAttribute
                        .replace("Space", spaceDisplayChar)
                        .replace("tab", "↹");
                }
            }
            if (this.svgCharacter && !((_g = this.testMode) === null || _g === void 0 ? void 0 : _g.checked)) {
                this.svgCharacter.hidden = false;
            }
            this.setWpm();
            return next;
        };
        this.getFirstNonMatchingChar = () => {
            if (!this.phrase || !this.testArea)
                return -1;
            const sourcePhrase = this.phrase.value.split('');
            const testPhrase = this.testArea.value.split('');
            if (testPhrase.length == 0) {
                return 0;
            }
            if (testPhrase == sourcePhrase) {
                this.timer.setSvg('stop');
                return -1;
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
        this.resetChordify = () => {
            if (this.phrase) {
                this.phrase.value = '';
                this.phrase.disabled = false;
            }
            if (this.wholePhraseChords)
                this.wholePhraseChords.innerHTML = '';
            if (this.allChordsList)
                this.allChordsList.hidden = true;
            if (this.testArea) {
                this.testArea.value = '';
                this.testArea.disabled = false;
            }
        };
        this.listAllChords = () => {
            if (this.allChordsList)
                this.allChordsList.hidden = false;
            // highlight Vim navigation keys
            Array.from(document.querySelectorAll("#allChordsList div span"))
                .filter((x) => {
                const element = x;
                return element.tagName === 'SPAN' && "asdfgjkl;/0$^m\"web".includes(element.innerText);
            })
                .forEach((x, index, array) => {
                const element = x;
                if (element.tagName === 'SPAN' && "asdfgjkl;/0$^m\"web".includes(element.innerText)) {
                    element.style.color = "blue";
                }
            });
        };
        this.phrase = document.getElementById("phrase");
        this.testArea = document.getElementById("testArea");
        this.chordified = document.getElementById("chordified");
        this.wholePhraseChords = document.getElementById("wholePhraseChords");
        this.nextChar = null;
        this.nextChars = document.getElementById("nextChars");
        this.nextCharsDisplay = new NextCharsDisplay(this.nextChars);
        this.charTimer = [];
        this.charTimes = document.getElementById("charTimes");
        this.wpm = document.getElementById("wpm");
        this.timerElement = document.getElementById("timer");
        if (!this.timerElement) {
            throw new Error('timer element not found');
        }
        this.timerSvg = document.getElementById('timerSvg');
        const cancelAction = () => {
            var _a, _b;
            if (this.testArea) {
                this.testArea.value = '';
                this.testArea.focus();
                this.testArea.style.border = "";
            }
            this.charTimer = [];
            this.prevCharTime = 0;
            if (this.wpm)
                this.wpm.innerText = '0';
            if (this.charTimes)
                this.charTimes.innerHTML = '';
            // clear error class from all chords
            Array.from((_b = (_a = this.wholePhraseChords) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : []).forEach(function (chord) {
                chord.classList.remove("error");
            });
            this.setNext();
        };
        const handleInputEvent = this.test.bind(this);
        this.timer = new Timer(this.timerElement, this.updateTimerDisplay.bind(this, this), this.timerSvg, cancelAction, handleInputEvent);
        this.prevCharTime = 0;
        this.testMode = document.getElementById("testMode");
        this.testMode.checked = localStorage.getItem('testMode') == 'true';
        this.lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
        this.pangrams = document.getElementById("pangrams");
        this.chordImageHolder = document.getElementById("chord-image-holder");
        this.prevCharTime = 0;
        this.preview = document.getElementById("preview");
        this.charTimer = [];
        this.chordSection = document.getElementById("chord-section");
        (_a = this.testMode) === null || _a === void 0 ? void 0 : _a.addEventListener('change', e => {
            this.saveMode(e);
            this.chordify();
        });
        this.voiceMode = document.getElementById("voiceMode");
        this.voiceMode.checked = localStorage.getItem('voiceMode') == 'true';
        (_b = this.voiceMode) === null || _b === void 0 ? void 0 : _b.addEventListener('change', e => {
            this.saveMode(e);
        });
        this.videoMode = document.getElementById("videoMode");
        this.voiceSynth = window.speechSynthesis;
        // NOTE: Starting video on page load is non-optimal.
        // APP.videoMode.checked = localStorage.getItem('videoMode') == 'true';
        this.videoSection = document.getElementById("video-section");
        if (this.videoSection) {
            this.videoSection.hidden = !this.videoMode.checked;
        }
        (_c = this.videoMode) === null || _c === void 0 ? void 0 : _c.addEventListener('change', e => {
            var changeResult = this.saveMode(e);
            this.toggleVideo(changeResult);
        });
        this.allChordsList = document.getElementById("allChordsList");
        // APP.testModeLabel = document.getElementById("testModeLabel");
        this.svgCharacter = document.getElementById("svgCharacter");
        this.errorCount = document.getElementById("errorCount");
        this.nextChar = null;
        this.testArea.addEventListener('input', (e) => {
            this.test(e);
        });
        this.testArea.addEventListener('keyup', (e) => {
            if (this.voiceMode && this.voiceMode.checked) {
                sayText(e, this);
            }
        });
        this.phrase.addEventListener('change', this.chordify);
        this.phrase.addEventListener('touchend', (e) => {
            if (this.voiceMode && this.voiceMode.checked) {
                sayText(e, this);
            }
        });
        this.pangrams.addEventListener('click', (e) => {
            const targetElement = e.target;
            if (!targetElement) {
                console.log("Pangram element missing");
                return;
            }
            if (this.phrase && targetElement && targetElement.innerText === "Termux") {
                this.phrase.value = "Termux is an Android terminal emulator and Linux environment app that works directly with no rooting or setup required. A minimal base system is installed automatically - additional packages are available using the APT package manager. The termux-shared library was added in v0.109. It defines shared constants and utils of the Termux app and its plugins. It was created to allow for the removal of all hardcoded paths in the Termux app. Some of the termux plugins are using this as well and rest will in future. If you are contributing code that is using a constant or a util that may be shared, then define it in termux-shared library if it currently doesn't exist and reference it from there. Update the relevant changelogs as well. Pull requests using hardcoded values will/should not be accepted. Termux app and plugin specific classes must be added under com.termux.shared.termux package and general classes outside it. The termux-shared LICENSE must also be checked and updated if necessary when contributing code. The licenses of any external library or code must be honoured. The main Termux constants are defined by TermuxConstants class. It also contains information on how to fork Termux or build it with your own package name. Changing the package name will require building the bootstrap zip packages and other packages with the new $PREFIX, check Building Packages for more info. Check Termux Libraries for how to import termux libraries in plugin apps and Forking and Local Development for how to update termux libraries for plugins. The versionName in build.gradle files of Termux and its plugin apps must follow the semantic version 2.0.0 spec in the format major.minor.patch(-prerelease)(+buildmetadata). When bumping versionName in build.gradle files and when creating a tag for new releases on GitHub, make sure to include the patch number as well, like v0.1.0 instead of just v0.1. The build.gradle files and attach_debug_apks_to_release workflow validates the version as well and the build/attachment will fail if versionName does not follow the spec.";
            }
            else if (this.phrase && targetElement && targetElement.innerText === "Handex") {
                this.phrase.value = "Type anywhere with this one-handed keyboard. Stop sitting down to type. Stop looking down to send messages. Built to the shape of your finger actions, this device will eliminate your need to reposition your fingers while typeing. Use the same keyboard, designed for your hand, everywhere. You never have to learn a new one. The natural motions of your fingers compose the characters. It's build around your hand, so you don't have to reorient your finger placement on a board. Repositioning your fingers on a board is the biggest hurdle of typing-training, so don't do it. Handex is built around your finger movements, so you'll never have to reposition your fingers to find a key. Even unusual keys, such `\`, `~`, `|`, `^`, `&` are easy to type. Handex liberates you from the key-board-shackle problem. 151 keys are currently available and more are coming.";
            }
            else {
                if (targetElement && this.phrase) {
                    this.phrase.value = targetElement.innerText;
                }
            }
            this.chordify();
        });
        (_d = document.getElementById('timerCancel')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', (e) => {
            this.timer.cancel();
        });
        (_e = document.getElementById('listAllChords')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', this.listAllChords);
        (_f = document.getElementById('resetChordify')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', this.resetChordify);
        this.toggleVideo(false);
    }
    updateTimerDisplay(handChord) {
        if (handChord.timer) {
            console.log("HandChord.updateTimerDisplay:", handChord.timer.centiSecond);
            handChord.timer.updateTimer();
        }
    }
    chordify() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.chordified)
                this.chordified.innerHTML = '';
            if (!this.phrase || this.phrase.value.trim().length == 0) {
                return [];
            }
            const phraseEncoded = btoa(this.phrase.value);
            const response = yield fetch(this.lambdaUrl, {
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
            if (this.wholePhraseChords)
                this.wholePhraseChords.innerHTML = '';
            const isTestMode = this.testMode ? this.testMode.checked : false;
            chordRows.forEach((row, i) => {
                var _a, _b, _c, _d;
                const rowDiv = document.createElement('div');
                const chordCode = row.chord;
                const foundChords = Array.from((_b = (_a = this.allChordsList) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [])
                    .filter(x => { return x.id == `chord${chordCode}`; });
                // Load the clone in Chord order into the wholePhraseChords div.
                if (foundChords.length > 0) {
                    const inChord = foundChords[0].cloneNode(true);
                    inChord.setAttribute("name", row.char);
                    inChord.hidden = isTestMode;
                    Array.from(inChord.children)
                        .filter(x => x.nodeName == "IMG")
                        .forEach(x => {
                        x.setAttribute("loading", "eager");
                        // x.hidden = isTestMode;
                    });
                    if (this.wholePhraseChords)
                        this.wholePhraseChords.appendChild(inChord);
                }
                else {
                    console.log("Missing chord:", chordCode);
                }
                (_d = (_c = document.getElementById(`chord${chordCode}`)) === null || _c === void 0 ? void 0 : _c.querySelector(`img`)) === null || _d === void 0 ? void 0 : _d.setAttribute("loading", "eager");
                // document.querySelector(`#${chordCode}`).hidden = false;
                rowDiv.id = i.toString();
                rowDiv.setAttribute("name", row.char);
                const charSpan = document.createElement('span');
                charSpan.innerHTML = row.char;
                rowDiv.appendChild(charSpan);
                rowDiv.appendChild(document.createTextNode(row.strokes));
                if (this.chordified)
                    this.chordified.appendChild(rowDiv);
            });
            this.setNext();
            this.timer.setSvg('start');
            if (this.testArea)
                this.testArea.focus();
            this.timer.cancel();
            this.phrase.disabled = true;
            this.nextCharsDisplay.setPhrase(this.phrase.value);
            return chordRows;
        });
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
        return (words / (this.timer.centiSecond / 100 / 60) + 0.000001).toFixed(2);
    }
}
;
/**
 * Say the text in the input element when a key is pressed.
 * @param {KeyboardEvent} e The keyboard event.
 * @param {HandChord} APP The HandChord instance.
 */
const sayText = (e, APP) => {
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
    if (!APP.voiceSynth) {
        APP.voiceSynth = window.speechSynthesis;
    }
    // If speaking, cancel the speech
    if (APP.voiceSynth.speaking) {
        APP.voiceSynth.cancel();
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
    APP.voiceSynth.speak(utterThis);
};
//# sourceMappingURL=HandChord.js.map