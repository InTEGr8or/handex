
class HandChord {
    phrase: HTMLInputElement | null;
    testArea: HTMLTextAreaElement | null;
    chordified: HTMLElement | null;
    wholePhraseChords: HTMLElement | null;
    nextChar: null;
    charTimer: [];
    charTimes: HTMLElement | null;
    wpm: HTMLElement | null;
    timer: HTMLElement | null;
    timerCentiSecond: 0;
    timerSvg: SVGElement | null;
    prevCharTime: 0;
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

    constructor() {
        this.phrase = document.getElementById("phrase") as HTMLInputElement;
        this.testArea = document.getElementById("testArea") as HTMLTextAreaElement;
        this.chordified = document.getElementById("chordified") as HTMLElement;
        this.wholePhraseChords = document.getElementById("wholePhraseChords") as HTMLElement;
        this.nextChar = null;
        this.charTimer = [];
        this.charTimes = document.getElementById("charTimes") as HTMLElement;
        this.wpm = document.getElementById("wpm") as HTMLElement;
        this.timer = document.getElementById("timer") as HTMLElement;
        this.timerCentiSecond = 0;
        this.prevCharTime = 0;
        this.testMode = document.getElementById("testMode") as HTMLInputElement;
        this.testMode.checked = localStorage.getItem('testMode') == 'true';
        this.lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
        this.pangrams = document.getElementById("pangrams") as HTMLElement;
        this.chordImageHolder = document.getElementById("chord-image-holder") as HTMLElement;
        this.prevCharTime = 0;
        this.charTimer = [];
        this.chordSection = document.getElementById("chord-section") as HTMLDivElement;
        this.timerSvg = document.getElementById('timerSvg') as SVGElement;
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

        this.timerCentiSecond = 0;

        this.testArea.addEventListener('input', testTimer.bind(this, null, this));
        this.testArea.addEventListener('keyup', e => {
            if (this.voiceMode && this.voiceMode.checked) {
                sayText(e, this);
            }
        });
        this.phrase.addEventListener('change', this.chordify);
        this.phrase.addEventListener('touchend', e => {
            if (this.voiceMode && this.voiceMode.checked) {
                sayText(e, this);
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
            ?.addEventListener('click', timerCancel);
        document.getElementById('listAllChords')
            ?.addEventListener('click', listAllChords);
        document.getElementById('resetChordify')
            ?.addEventListener('click', resetChordify);

        this.toggleVideo(false);
    }

    async chordify(): Promise<Array<ChordRow>> {
        if (this.chordified) this.chordified.innerHTML = '';
        if (!this.phrase || this.phrase.value.trim().length == 0) {
            return [];
        }
        console.log("handChord.phrase:", this.phrase);
        const phraseEncoded = btoa(this.phrase.value);
        console.log("phraseEncoded:", phraseEncoded);
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
        setNext(this);
        setTimerSvg('start', this);
        if (this.testArea) this.testArea.focus();
        this.timerCancel();
        this.phrase.disabled = true;
        return chordRows;
    }

    saveMode = (modeEvent: Event): boolean => {
        // chordify();
        // Hide the chordified sub-divs.
        const result = (modeEvent.target as HTMLInputElement).checked
        localStorage.setItem((modeEvent.target as HTMLInputElement).id, result.toString());
        return result;
    }
    toggleVideo = (setOn: boolean): boolean => {
        if (setOn) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                }
            })
                .then(
                    (stream: MediaStream) => (this.preview.srcObject = stream)
                );
            if (this.videoSection) this.videoSection.appendChild(this.chordSection);
        } else {
            document.querySelector<HTMLDivElement>("div.content").appendChild(this.chordSection);
            if (preview.srcObject) {
                (preview.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
            preview.srcObject = null;
        }
        this.videoSection.hidden = !setOn;
        this.phrase.classList.toggle('phrase-over-video', setOn);
        this.chordSection.classList.toggle('chord-section-over-video', setOn);
        return !setOn;
    }
    timerCancel = (): void => {
        if (this.testArea) this.testArea.value = '';
        this.charTimer = [];
        this.prevCharTime = 0;
        if (this.wpm) this.wpm.innerText = '0';
        if (this.charTimes) this.charTimes.innerHTML = '';
        if (this.testArea) {
            this.testArea.focus();
            this.testArea.style.border = "";
        }
        if (this.timer) this.timer.innerHTML = '0.0';
        this.timerCentiSecond = 0;
        // clear error class from all chords
        Array
            .from(this.wholePhraseChords?.children ?? [])
            .forEach(function (chord) {
                chord.classList.remove("error");
                // element.setAttribute("class", "outstanding");
            });
        clearInterval(timerHandle);
        timerHandle = null;
        this.setNext());
        setTimerSvg('start');
    }
    setNext = () => {
        const nextIndex = getFirstNonMatchingChar();

        if (nextIndex < 0) {
            return;
        }
        // Remove the outstanding class from the previous chord.
        Array
            .from(APP.wholePhraseChords.children)
            .forEach((chord, i) => {
                chord.classList.remove("next");
            }
            );
        if (nextIndex > APP.wholePhraseChords.children.length - 1) return;

        let nextCharacter = `<span class="nextCharacter">${APP.phrase.value.substring(nextIndex, nextIndex + 1).replace(' ', '&nbsp;')}</span>`;
        document.getElementById('nextChars').innerHTML
            = `${nextCharacter}${APP.phrase.value
                .substring(nextIndex + 1, nextIndex + 40)}`;

        const next = APP.wholePhraseChords.children[nextIndex];
        APP.nextChar = next.getAttribute("name").replace("Space", " ");
        next.classList.add("next");
        // If we're in test mode and the last character typed doesn't match the next, expose the svg.
        Array.from(next.childNodes)
            .filter(x => x.nodeName == "IMG")
            .forEach(x => {
                x.width = 140;
                charSvgClone = x.cloneNode(true);
                charSvgClone.hidden = APP.testMode.checked;
                APP.chordImageHolder.replaceChildren(charSvgClone);

            });
        APP.svgCharacter.innerHTML = next.getAttribute("name")
            .replace("Space", spaceDisplayChar)
            .replace("tab", "↹");
        if (!APP.testMode.checked) {
            APP.svgCharacter.hidden = false;
        }
        setWpm();
        return next;
    };
    getFirstNonMatchingChar = () => {
        if(!this.phrase || !this.testArea) return -1;
        const sourcePhrase = this.phrase.value.split('');
        const testPhrase = this.testArea.value.split('');
        if (testPhrase.length == 0) {
            return 0;
        }
        if (testPhrase == sourcePhrase) {
            setTimerSvg('stop');
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

};


const spaceDisplayChar = "&#x2581;";
const tabDisplayChar = "&#x2B7E;";

var timerHandle: any = null;

const fingers = { t: "thumb", i: "index", m: "middle", r: "ring", p: "pinky" };

/**
 * Creates a timer object that can be started, stopped, and reset.
 * @param t The initial interval in milliseconds (a `number`).
 * @param fn The function to call on each interval (a function that takes no arguments and returns no value).
 * @return The timer object (with type `Timer<T>` where `T` is the type of `fn`).
 */
var Timer = function <T extends (() => void)>(t: number, fn: T): Timer<T> {
    let timerObj: number | null = null;

    /**
     * Stops the timer, if it is running.
     * @return The timer object (with type `Timer<T>` where `T` is the type of `fn`).
     */
    this.stop = function (): Timer<T> {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    /**
     * Starts the timer using the current settings (if it's not already running).
     * @return The timer object (with type `Timer<T>` where `T` is the type of `fn`).
     */
    this.start = function (): Timer<T> {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    /**
     * Starts with a new or original interval, and stops the current interval.
     * @param newT The new interval in milliseconds; defaults to `t` (optional, a `number`).
     * @return The timer object (with type `Timer<T>` where `T` is the type of `fn`).
     */
    this.reset = function (newT?: number): Timer<T> {
        t = newT ?? t;
        return this.stop().start();
    }
};

type Timer = {
    stop: () => Timer;
    start: () => Timer;
    reset: (newT?: number) => Timer;
};


/**
 * Saves the state of a checkbox input element to local storage.
 * @param {Event} modeEvent - A change event from a checkbox input element.
 * @return {boolean} The new state of the checkbox.
 */


interface ChordRow {
    char: string;
    chord: number;
    strokes: string;
}
var listAllChords = () => {
    APP.allChordsList.hidden = false;
    // highlight Vim navigation keys
    Array.from(document.querySelectorAll("#allChordsList div span"))
        .filter(x => "asdfgjkl;/0$^m\"web".includes(x.innerText))
        .forEach(x => x.style.color = "blue");
};

var sayText = (e, APP: HandChord) => {
    var text = e.target.value;
    const key = e.key;
    if (!APP.voiceSynth) {
        APP.voiceSynth = window.speechSynthesis;
    }
    if (APP.voiceSynth.speaking) {
        APP.voiceSynth.cancel();
    }
    if (key) {
        if (key.match(/^[a-z0-9]$/i)) {
            text = key;
        }
        else if (key == "Backspace") {
            text = "delete";
        }
        else if (key == "Enter") {
            text = text;
        }
        else {
            textSplit = text.trim().split(' ')
            text = textSplit[textSplit.length - 1];
        }
    }
    var utterThis = new SpeechSynthesisUtterance(text);
    utterThis.pitch = 1;
    utterThis.rate = 0.7;
    APP.voiceSynth.speak(utterThis);
}
var testTimer = function (event, APP: HandChord) {
    if (event.data == APP.nextChar) {
        APP.charTimer.push({
            char: event.data,
            duration: ((APP.timerCentiSecond - APP.prevCharTime) / 100).toFixed(2),
            time: (APP.timerCentiSecond / 100).toFixed(2)
        });
    }
    const next = setNext(APP);
    if (next) {
        next.classList.remove("error");
    }
    APP.prevCharTime = APP.timerCentiSecond;

    // TODO: de-overlap this and comparePhrase
    if (APP.testArea.value.trim().length == 0) {
        // stop timer
        APP.testArea.style.border = "";
        APP.svgCharacter.hidden = true;
        clearInterval(timerHandle);
        timerHandle = null;
        APP.timer.innerHTML = (0).toFixed(1);
        APP.timerCentiSecond = 0;
        setTimerSvg('start', APP);
        return;
    }
    if (APP.testArea.value == APP.phrase.value.trim().substring(0, APP.testArea.value.length)) {
        APP.testArea.style.border = "4px solid #FFF3";
        APP.svgCharacter.hidden = true;

    }
    else {
        // Alert mismatched text with red border.
        APP.testArea.style.border = "4px solid red";
        chordImageHolderImg = APP.chordImageHolder.querySelector("img");
        if (chordImageHolderImg) chordImageHolderImg.hidden = false;
        APP.svgCharacter.hidden = false;
        next?.classList.add("error");
        APP.errorCount.innerText = parseInt(APP.errorCount.innerText) + 1;
    }
    if (APP.testArea.value.trim() == APP.phrase.value.trim()) {
        // stop timer
        clearInterval(timerHandle);
        setTimerSvg('stop', APP);
        let charTimeList = "";
        APP.charTimer.forEach(x => {
            charTimeList += `<li>${x.char.replace(' ', spaceDisplayChar)}: ${x.duration}</li>`;
        });
        APP.charTimes.innerHTML = charTimeList;
        localStorage.setItem(`charTimerSession_${(new Date).toISOString()}`, JSON.stringify(APP.charTimer));
        timerHandle = null;
        return;
    }
    startTimer();
}
/**
 * Sets the current WPM based on the number of characters in the textarea and the elapsed time.
 * @param testAreaValue The current value of the textarea.
 * @param timerCentiSecond The elapsed time in centiseconds.
 * @returns The calculated WPM as a string.
 */
function setWpm(testAreaValue: string, timerCentiSecond: number): string {
    if (testAreaValue.length < 2) {
        return "0";
    }
    const words = testAreaValue.length / 5;
    return (words / (timerCentiSecond / 100 / 60) + 0.000001).toFixed(2);
}

/**
 * Sets the timer SVG based on the given status string.
 * @param status The status string to set the timer to. Valid options are 'start', 'stop', and 'pause'.
 * @returns void
 */
const setTimerSvg = (status: 'start' | 'stop' | 'pause', APP: HandChord): void => {
    const statusSvg =
        setWpm(APP.testArea.value, APP.timerCentiSecond);
    switch (status) {
        case 'start':
            statusSvg.innerHTML = '<use href="#start" transform="scale(2,2)" ></use>';
            APP.testArea.disabled = false;
            APP.errorCount.innerText = '0';
            break;
        case 'stop':
            statusSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
            APP.testArea.disabled = true;
            break;
        case 'pause':
            statusSvg.innerHTML = '<use href="#pause" transform="scale(2,2)" ></use>';
            break;
        default:
            statusSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
    }
};
const runTimer = (APP: HandChord) => {
    APP.timerCentiSecond++;
    APP.timer.innerHTML = (APP.timerCentiSecond / 100).toFixed(1);
};
const resetChordify = (APP: HandChord) => {
    APP.phrase.value = '';
    APP.phrase.disabled = false;
    APP.wholePhraseChords.innerHTML = '';
    APP.allChordsList.hidden = true;
    APP.testArea.value = '';
    APP.testArea.disabled = false;
};

var startTimer = function () {
    if (!timerHandle) {
        timerHandle = setInterval(runTimer, 10);
        setTimerSvg('pause');
    }
};
/**
 * Clears the chords from the search input.
 * @function
 * @returns {void}
 */
var clearChords: () => void = () => {
    (document.getElementById('searchChords') as HTMLInputElement).value = '';
    // listAllChords();
};

document.addEventListener("DOMContentLoaded", () => {
    const handChord = new HandChord();
});
