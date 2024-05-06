import { NextCharsDisplay } from "./NextCharsDisplay.js";
import { TerminalCssClasses } from "./terminal/TerminalTypes.js";
export class HandChord {
    constructor() {
        var _a, _b, _c, _d, _e, _f;
        // updateTimerDisplay(handChord: HandChord): void {
        //     console.log("Update Timer Display not implemented", handChord);
        //     if (handChord.nextCharsDisplay.timer) {
        //         // handChord.nextCharsDisplay.updateCallback();
        //     }
        // }
        this.cancelCallback = () => {
            var _a, _b;
            if (this.nextCharsDisplay.testArea) {
                this.nextCharsDisplay.testArea.value = '';
                this.nextCharsDisplay.testArea.focus();
                this.nextCharsDisplay.testArea.style.border = "";
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
            this.nextCharsDisplay.setNext('');
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
        const cancelAction = this.cancelCallback.bind(this);
        this.nextCharsDisplay = new NextCharsDisplay(cancelAction);
        this.phrase = document.getElementById("phrase");
        this.nextCharsDisplay.phrase = this.phrase;
        this.chordified = document.getElementById("chordified");
        this.wholePhraseChords = document.getElementById(TerminalCssClasses.WholePhraseChords);
        this.nextChars = document.getElementById(TerminalCssClasses.NextChars);
        this.nextCharsDisplay.chordImageHolder = document.getElementById("chord-image-holder");
        this.nextCharsDisplay.svgCharacter = document.getElementById("svgCharacter");
        this.nextCharsDisplay.testMode = document.getElementById("testMode");
        this.nextCharsDisplay.nextChars = this.nextChars;
        this.nextCharsDisplay.testArea = document.getElementById(TerminalCssClasses.TestArea);
        this.charTimer = [];
        this.charTimes = document.getElementById("charTimes");
        this.wpm = document.getElementById("wpm");
        this.nextCharsDisplay.wpm = this.wpm;
        const handleInputEvent = (event) => {
            console.log("Handle Input Event not implementd:", event);
        };
        this.prevCharTime = 0;
        this.pangrams = document.getElementById("pangrams");
        this.prevCharTime = 0;
        this.preview = document.getElementById("preview");
        this.charTimer = [];
        this.chordSection = document.getElementById("chord-section");
        (_a = this.nextCharsDisplay.testMode) === null || _a === void 0 ? void 0 : _a.addEventListener('change', e => {
            this.saveMode(e);
            this.nextCharsDisplay.chordify();
        });
        this.voiceMode = document.getElementById("voiceMode");
        this.voiceMode.checked = localStorage.getItem('voiceMode') == 'true';
        (_b = this.voiceMode) === null || _b === void 0 ? void 0 : _b.addEventListener('change', e => {
            this.saveMode(e);
        });
        this.videoMode = document.getElementById("videoMode");
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
        this.errorCount = document.getElementById("errorCount");
        this.phrase.addEventListener('change', this.nextCharsDisplay.chordify);
        this.phrase.addEventListener('touchend', (e) => {
            if (this.voiceMode && this.voiceMode.checked) {
                this.nextCharsDisplay.sayText(e);
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
            this.nextCharsDisplay.chordify();
        });
        (_d = document.getElementById('timerCancel')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', (e) => {
            this.nextCharsDisplay.timer.cancel();
        });
        (_e = document.getElementById('listAllChords')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', this.listAllChords);
        (_f = document.getElementById('resetChordify')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', this.nextCharsDisplay.resetChordify);
        this.toggleVideo(false);
    }
}
;
//# sourceMappingURL=HandChord.js.map