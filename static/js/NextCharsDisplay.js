import { spaceDisplayChar } from "./types/Types.js";
export class NextCharsDisplay {
    constructor(nextCharsElement, wholePhraseChords = null, chordImageHolder = null, svgCharacter = null, testMode = null, setWpmCallback = () => { }, testArea = null) {
        this.phraseString = '';
        this.nextChar = '';
        this.setNext = (testPhrase) => {
            var _a, _b, _c, _d, _e, _f;
            const nextIndex = this.getFirstNonMatchingChar(testPhrase);
            console.log("Next index: " + nextIndex);
            if (nextIndex < 0) {
                return null;
            }
            // Remove the outstanding class from the previous chord.
            Array
                .from((_b = (_a = this.wholePhraseChords) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [])
                .forEach((chord, i) => {
                chord.classList.remove("next");
            });
            if (this.wholePhraseChords && nextIndex > this.wholePhraseChords.children.length - 1)
                return null;
            let nextCharacter = `<span class="nextCharacter">${this.phraseString.substring(nextIndex, nextIndex + 1).replace(' ', '&nbsp;')}</span>`;
            // this.updateDisplay(testPhrase);
            const nextChars = this.phraseString.substring(nextIndex, nextIndex + 40);
            this.nextCharsElement.innerHTML = this.formatNextChars(nextChars);
            const next = (_c = this.wholePhraseChords) === null || _c === void 0 ? void 0 : _c.children[nextIndex];
            if (next) {
                console.log("Next character: " + nextCharacter);
                if (this.nextChar)
                    this.nextChar = (_e = (_d = next.getAttribute("name")) === null || _d === void 0 ? void 0 : _d.replace("Space", " ")) !== null && _e !== void 0 ? _e : "";
                next.classList.add("next");
                // If we're in test mode and the last character typed doesn't match the next, expose the svg.
                Array.from(next.childNodes)
                    .filter((x) => x.nodeName == "IMG")
                    .forEach((x) => {
                    var _a, _b;
                    x.width = 140;
                    let charSvgClone = x.cloneNode(true);
                    charSvgClone.hidden = (_b = (_a = this.testMode) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
                    if (this.chordImageHolder) {
                        console.log("chordImageHolder: ", charSvgClone);
                        this.chordImageHolder.replaceChildren(charSvgClone);
                    }
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
            if (this.svgCharacter && !((_f = this.testMode) === null || _f === void 0 ? void 0 : _f.checked)) {
                this.svgCharacter.hidden = false;
            }
            this.setWpmCallback();
            return next;
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
        if (!nextCharsElement)
            throw new Error('NextChars element not found');
        this.nextCharsElement = nextCharsElement;
        this.nextCharsElement.hidden = true;
        this.wholePhraseChords = wholePhraseChords;
        this.chordImageHolder = chordImageHolder;
        this.svgCharacter = svgCharacter;
        this.testMode = testMode;
        this.setWpmCallback = setWpmCallback;
        this.testArea = testArea;
    }
    reset() {
        this.phraseString = '';
        this.setNext('');
        this.nextCharsElement.hidden = true;
    }
    setPhrase(newPhrase) {
        this.phraseString = newPhrase;
        this.setNext(''); // Reset the display with the new phrase from the beginning
        this.nextCharsElement.hidden = false;
    }
    // updateDisplay(testPhrase: string): void {
    //     const nextIndex = this.getFirstNonMatchingChar(testPhrase);
    //     // this.setNext(testPhrase);
    //     const nextChars = this.phraseString.substring(nextIndex, nextIndex + 40);
    //     this.nextCharsElement.innerHTML = this.formatNextChars(nextChars);
    // }
    formatNextChars(chars) {
        let result = chars;
        // Format the characters as needed for display, e.g., replace spaces, add span for the next character, etc.
        // Return the formatted string to be set as innerHTML of the nextCharsElement
        return result;
    }
}
//# sourceMappingURL=NextCharsDisplay.js.map