import { NextCharsDisplay } from "./NextCharsDisplay.js";
import { Timer } from "./Timer.js";
import { CharTime, spaceDisplayChar, CancelCallback, InputEventCallback, createCharTime } from "./types/Types.js";


interface ChordRow {
    char: string;
    chord: number;
    strokes: string;
}

export class HandChord {
    phrase: HTMLInputElement | null;
    testArea: HTMLTextAreaElement | null;
    chordified: HTMLElement | null;
    wholePhraseChords: HTMLElement | null;
    nextChar: string | null;
    charTimer: CharTime[];
    charTimes: HTMLElement | null;
    wpm: HTMLElement | null;
    timerElement: HTMLElement;
    timer: Timer;
    timerSvg: SVGElement | null;
    prevCharTime: number;
    preview: HTMLVideoElement | null;
    testMode: HTMLInputElement | null;
    lambdaUrl: string;
    pangrams: HTMLElement | null;
    chordImageHolder: HTMLElement | null;
    voiceSynth: SpeechSynthesis;
    voiceMode: HTMLInputElement | null;
    videoMode: HTMLInputElement | null;
    videoSection: HTMLDivElement | null;
    errorCount: HTMLElement | null;
    allChordsList: HTMLDivElement | null;
    svgCharacter: HTMLImageElement | null;
    chordSection: HTMLDivElement | null;
    nextChars: HTMLElement | null;
    private nextCharsDisplay: NextCharsDisplay;

    constructor() {
        this.phrase = document.getElementById("phrase") as HTMLInputElement;
        this.testArea = document.getElementById("testArea") as HTMLTextAreaElement;
        this.chordified = document.getElementById("chordified") as HTMLElement;
        this.wholePhraseChords = document.getElementById("wholePhraseChords") as HTMLElement;
        this.nextChar = null;
        this.nextChars = document.getElementById("nextChars") as HTMLElement;
        this.nextCharsDisplay = new NextCharsDisplay(this.nextChars);
        this.charTimer = [];
        this.charTimes = document.getElementById("charTimes") as HTMLElement;
        this.wpm = document.getElementById("wpm") as HTMLElement;
        this.timerElement = document.getElementById("timer") as HTMLElement;
        if (!this.timerElement) {
            throw new Error('timer element not found');
        }

        this.timerSvg = document.getElementById('timerSvg') as unknown as SVGElement;

        const cancelAction: CancelCallback = () => {
            if (this.testArea) {
                this.testArea.value = '';
                this.testArea.focus();
                this.testArea.style.border = "";
            }
            this.charTimer = [];
            this.prevCharTime = 0;
            if (this.wpm) this.wpm.innerText = '0';
            if (this.charTimes) this.charTimes.innerHTML = '';
            // clear error class from all chords
            Array.from(this.wholePhraseChords?.children ?? []).forEach(function (chord) {
                chord.classList.remove("error");
            });
            this.setNext();
        };
        const handleInputEvent: InputEventCallback = this.test.bind(this);
        this.timer = new Timer(this.timerElement, this.updateTimerDisplay.bind(this, this), this.timerSvg, cancelAction, handleInputEvent);
        this.prevCharTime = 0;
        this.testMode = document.getElementById("testMode") as HTMLInputElement;
        this.testMode.checked = localStorage.getItem('testMode') == 'true';
        this.lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
        this.pangrams = document.getElementById("pangrams") as HTMLElement;
        this.chordImageHolder = document.getElementById("chord-image-holder") as HTMLElement;
        this.prevCharTime = 0;
        this.preview = document.getElementById("preview") as HTMLVideoElement;
        this.charTimer = [];
        this.chordSection = document.getElementById("chord-section") as HTMLDivElement;
        this.testMode?.addEventListener('change', e => {
            this.saveMode(e);
            this.chordify();
        });
        this.voiceMode = document.getElementById("voiceMode") as HTMLInputElement;
        this.voiceMode.checked = localStorage.getItem('voiceMode') == 'true';
        this.voiceMode?.addEventListener('change', e => {
            this.saveMode(e);
        });
        this.videoMode = document.getElementById("videoMode") as HTMLInputElement;
        this.voiceSynth = window.speechSynthesis as SpeechSynthesis;
        // NOTE: Starting video on page load is non-optimal.
        // APP.videoMode.checked = localStorage.getItem('videoMode') == 'true';
        this.videoSection = document.getElementById("video-section") as HTMLDivElement;
        if (this.videoSection) {
            this.videoSection.hidden = !this.videoMode.checked;
        }
        this.videoMode?.addEventListener('change', e => {
            var changeResult = this.saveMode(e);
            this.toggleVideo(changeResult);
        });

        this.allChordsList = document.getElementById("allChordsList") as HTMLDivElement;
        // APP.testModeLabel = document.getElementById("testModeLabel");
        this.svgCharacter = document.getElementById("svgCharacter") as HTMLImageElement;
        this.errorCount = document.getElementById("errorCount") as HTMLElement;
        this.nextChar = null;

        this.testArea.addEventListener('input', (e: Event) => {
            this.test(e as InputEvent);
        });
        this.testArea.addEventListener('keyup', (e: Event) => {
            if (this.voiceMode && this.voiceMode.checked) {
                sayText(e as KeyboardEvent, this);
            }
        });
        this.phrase.addEventListener('change', this.chordify);
        this.phrase.addEventListener('touchend', (e: Event) => {
            if (this.voiceMode && this.voiceMode.checked) {
                sayText(e as KeyboardEvent, this);
            }
        });
        this.pangrams.addEventListener('click', (e: MouseEvent) => {
            const targetElement = e.target as HTMLElement;
            if (!targetElement) {
                console.log("Pangram element missing");
                return;
            }
            if (this.phrase && targetElement && targetElement.innerText === "Termux") {
                this.phrase.value = "Termux is an Android terminal emulator and Linux environment app that works directly with no rooting or setup required. A minimal base system is installed automatically - additional packages are available using the APT package manager. The termux-shared library was added in v0.109. It defines shared constants and utils of the Termux app and its plugins. It was created to allow for the removal of all hardcoded paths in the Termux app. Some of the termux plugins are using this as well and rest will in future. If you are contributing code that is using a constant or a util that may be shared, then define it in termux-shared library if it currently doesn't exist and reference it from there. Update the relevant changelogs as well. Pull requests using hardcoded values will/should not be accepted. Termux app and plugin specific classes must be added under com.termux.shared.termux package and general classes outside it. The termux-shared LICENSE must also be checked and updated if necessary when contributing code. The licenses of any external library or code must be honoured. The main Termux constants are defined by TermuxConstants class. It also contains information on how to fork Termux or build it with your own package name. Changing the package name will require building the bootstrap zip packages and other packages with the new $PREFIX, check Building Packages for more info. Check Termux Libraries for how to import termux libraries in plugin apps and Forking and Local Development for how to update termux libraries for plugins. The versionName in build.gradle files of Termux and its plugin apps must follow the semantic version 2.0.0 spec in the format major.minor.patch(-prerelease)(+buildmetadata). When bumping versionName in build.gradle files and when creating a tag for new releases on GitHub, make sure to include the patch number as well, like v0.1.0 instead of just v0.1. The build.gradle files and attach_debug_apks_to_release workflow validates the version as well and the build/attachment will fail if versionName does not follow the spec.";
            } else if (this.phrase && targetElement && targetElement.innerText === "Handex") {
                this.phrase.value = "Type anywhere with this one-handed keyboard. Stop sitting down to type. Stop looking down to send messages. Built to the shape of your finger actions, this device will eliminate your need to reposition your fingers while typeing. Use the same keyboard, designed for your hand, everywhere. You never have to learn a new one. The natural motions of your fingers compose the characters. It's build around your hand, so you don't have to reorient your finger placement on a board. Repositioning your fingers on a board is the biggest hurdle of typing-training, so don't do it. Handex is built around your finger movements, so you'll never have to reposition your fingers to find a key. Even unusual keys, such `\`, `~`, `|`, `^`, `&` are easy to type. Handex liberates you from the key-board-shackle problem. 151 keys are currently available and more are coming.";
            } else {
                if (targetElement && this.phrase) {
                    this.phrase.value = targetElement.innerText;
                }
            }
            this.chordify();
        });
        document.getElementById('timerCancel')
            ?.addEventListener('click', (e) => {
                this.timer.cancel();
            });
        document.getElementById('listAllChords')
            ?.addEventListener('click', this.listAllChords);
        document.getElementById('resetChordify')
            ?.addEventListener('click', this.resetChordify);

        this.toggleVideo(false);
    }

    updateTimerDisplay(handChord: HandChord): void {
        if (handChord.timer) {
            console.log("HandChord.updateTimerDisplay:", handChord.timer.centiSecond);
            handChord.timer.updateTimer();
        }
    }

    test = (event: InputEvent) => {
        if (event.data == this.nextChar) {
            const charTime = createCharTime(
                event.data as string,
                Number(((this.timer.centiSecond - this.prevCharTime) / 100).toFixed(2)),
                this.timer.centiSecond / 100
            );
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
            if (this.svgCharacter) this.svgCharacter.hidden = true;
            this.timer.cancel();
            return;
        }
        if (
            this.svgCharacter &&
            this.testArea &&
            this.testArea.value
            == this
                .phrase
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
            if (this.errorCount)
                this.errorCount.innerText = (parseInt(this.errorCount.innerText) + 1).toString(10);
        }
        if (this.testArea?.value.trim() == this.phrase?.value.trim()) {
            // stop timer
            this.timer.setSvg('stop');
            let charTimeList = "";
            this.charTimer.forEach((x: CharTime) => {
                charTimeList += `<li>${x.char.replace(' ', spaceDisplayChar)}: ${x.duration}</li>`;
            });
            if (this.charTimes) this.charTimes.innerHTML = charTimeList;
            localStorage.setItem(`charTimerSession_${(new Date).toISOString()}`, JSON.stringify(this.charTimer));
            this.timer.cancel();
            return;
        }
        this.timer.start();
    }

    private async chordify(): Promise<Array<ChordRow>> {
        if (this.chordified) this.chordified.innerHTML = '';
        if (!this.phrase || this.phrase.value.trim().length == 0) {
            return [];
        }
        const phraseEncoded = btoa(this.phrase.value);
        const response = await fetch(this.lambdaUrl, {
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
        if (this.wholePhraseChords) this.wholePhraseChords.innerHTML = '';
        const isTestMode = this.testMode ? this.testMode.checked : false;
        chordRows.forEach((row: ChordRow, i: number) => {
            const rowDiv = document.createElement('div') as HTMLDivElement;
            const chordCode = row.chord;
            const foundChords
                = Array.from(this.allChordsList?.children ?? [])
                    .filter(x => { return x.id == `chord${chordCode}`; });
            // Load the clone in Chord order into the wholePhraseChords div.
            if (foundChords.length > 0) {
                const inChord = foundChords[0].cloneNode(true) as HTMLDivElement;
                inChord.setAttribute("name", row.char);
                inChord.hidden = isTestMode;
                Array.from(inChord.children)
                    .filter(x => x.nodeName == "IMG")
                    .forEach(x => {
                        x.setAttribute("loading", "eager");
                        // x.hidden = isTestMode;
                    });
                if (this.wholePhraseChords) this.wholePhraseChords.appendChild(inChord);
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
            if (this.chordified) this.chordified.appendChild(rowDiv);
        });
        this.setNext();
        this.timer.setSvg('start');
        if (this.testArea) this.testArea.focus();
        this.timer.cancel();
        this.phrase.disabled = true;
        this.nextCharsDisplay.setPhrase(this.phrase.value);
        return chordRows;
    }

    private saveMode = (modeEvent: Event): boolean => {
        // chordify();
        // Hide the chordified sub-divs.
        const result = (modeEvent.target as HTMLInputElement).checked
        localStorage.setItem((modeEvent.target as HTMLInputElement).id, result.toString());
        return result;
    }
    private toggleVideo = (setOn: boolean): boolean => {
        if (setOn) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                }
            })
                .then((stream: MediaStream) => {
                    if (this.preview) {
                        this.preview.srcObject = stream;
                    }
                });
            if (this.videoSection && this.chordSection) this.videoSection.appendChild(this.chordSection);
        } else {
            const divContent = document.querySelector<HTMLDivElement>("div.content");
            if (divContent && this.chordSection) {
                // Safely use divContent here
                divContent.appendChild(this.chordSection);
            }
            if (this.preview?.srcObject) {
                (this.preview.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                this.preview.srcObject = null;
            }
        }
        if (this.videoSection) this.videoSection.hidden = !setOn;
        if (this.phrase) this.phrase.classList.toggle('phrase-over-video', setOn);
        if (this.chordSection) this.chordSection.classList.toggle('chord-section-over-video', setOn);
        return !setOn;
    }
    public setNext = () => {
        const nextIndex = this.getFirstNonMatchingChar();

        if (nextIndex < 0) {
            return;
        }
        // Remove the outstanding class from the previous chord.
        Array
            .from(this.wholePhraseChords?.children ?? [])
            .forEach((chord, i) => {
                chord.classList.remove("next");
            }
            );
        if (this.wholePhraseChords && nextIndex > this.wholePhraseChords.children.length - 1) return;

        let nextCharacter = `<span class="nextCharacter">${this.phrase?.value.substring(nextIndex, nextIndex + 1).replace(' ', '&nbsp;')}</span>`;

        console.log("nextIndex:", nextIndex);
        this.nextCharsDisplay.updateDisplay(nextIndex);

        const next = this.wholePhraseChords?.children[nextIndex] as HTMLElement;
        if (next) {
            if (this.nextChar) this.nextChar = next.getAttribute("name")?.replace("Space", " ") ?? "";
            next.classList.add("next");
            // If we're in test mode and the last character typed doesn't match the next, expose the svg.
            Array.from(next.childNodes)
                .filter((x): x is HTMLImageElement => x.nodeName == "IMG")
                .forEach((x: HTMLImageElement) => {
                    x.width = 140;
                    let charSvgClone = x.cloneNode(true) as HTMLImageElement;
                    charSvgClone.hidden = this.testMode?.checked ?? false;
                    if (this.chordImageHolder) this.chordImageHolder.replaceChildren(charSvgClone);

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
        if (this.svgCharacter && !this.testMode?.checked) {
            this.svgCharacter.hidden = false;
        }
        this.setWpm();
        return next;
    };
    private getFirstNonMatchingChar = () => {
        if (!this.phrase || !this.testArea) return -1;
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
        };
        return result;
    };

    private resetChordify = () => {
        if (this.phrase) {
            this.phrase.value = '';
            this.phrase.disabled = false;
        }
        if (this.wholePhraseChords) this.wholePhraseChords.innerHTML = '';
        if (this.allChordsList) this.allChordsList.hidden = true;
        if (this.testArea) {
            this.testArea.value = '';
            this.testArea.disabled = false;
        }
    };
    private listAllChords = () => {
        if (this.allChordsList) this.allChordsList.hidden = false;
        // highlight Vim navigation keys
        Array.from(document.querySelectorAll("#allChordsList div span") as NodeListOf<Element>)
            .filter((x: Element) => {
                const element = x as HTMLElement;
                return element.tagName === 'SPAN' && "asdfgjkl;/0$^m\"web".includes(element.innerText);
            })
            .forEach((x: Element, index: number, array: Element[]) => {
                const element = x as HTMLElement;
                if (element.tagName === 'SPAN' && "asdfgjkl;/0$^m\"web".includes(element.innerText)) {
                    element.style.color = "blue";
                }
            });
    };
    /**
     * Calculates the words per minute (WPM) based on the text typed in the test area.
     *
     * @return {string} The calculated words per minute as a string with two decimal places.
     */
    public setWpm(): string {
        if (!this.testArea) return "0";
        if (this.testArea.value.length < 2) {
            return "0";
        }

        const words = this.testArea.value.length / 5;
        return (words / (this.timer.centiSecond / 100 / 60) + 0.000001).toFixed(2);
    }
};

/**
 * Say the text in the input element when a key is pressed.
 * @param {KeyboardEvent} e The keyboard event.
 * @param {HandChord} APP The HandChord instance.
 */
const sayText = (e: KeyboardEvent, APP: HandChord) => {
    const eventTarget = e.target as HTMLInputElement;
    // Get the input element value
    if (!eventTarget || !eventTarget.value) return;
    let text = eventTarget.value;
    // Get the key that was pressed
    const char = e.key;
    // If no key was pressed, return
    if (!char) return;
    // If the speechSynthesis object is not defined, return
    if (!APP.voiceSynth) {
        APP.voiceSynth = window.speechSynthesis;
    }
    // If speaking, cancel the speech
    if (APP.voiceSynth.speaking) {
        APP.voiceSynth.cancel();
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
    APP.voiceSynth.speak(utterThis);
}
