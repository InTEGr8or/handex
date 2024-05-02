"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WPMCalculator = void 0;
const TerminalTypes_1 = require("./TerminalTypes");
class WPMCalculator {
    getKeystrokes() {
        return this.keystrokes;
    }
    constructor() {
        this.previousTimestamp = 0;
        this.keystrokes = [];
    }
    clearKeystrokes() {
        this.keystrokes = [];
    }
    saveKeystrokes(timeCode) {
        let charsAndSum = this.getWPMs();
        localStorage.setItem(TerminalTypes_1.LogKeys.CharTime + '_' + timeCode, JSON.stringify(charsAndSum.charWpms));
        return charsAndSum.wpmSum;
    }
    recordKeystroke(character) {
        let charDur = { character, durationMilliseconds: 0 };
        if (this.previousTimestamp > 0) {
            charDur.durationMilliseconds = Date.now() - this.previousTimestamp;
        }
        this.previousTimestamp = Date.now();
        // Record the keystroke with the current timestamp
        this.keystrokes.push(charDur);
        return charDur;
    }
    getWPMs() {
        let charWpms = this.keystrokes.map(this.getWPM);
        let wpmSum = charWpms.filter(charWpm => charWpm.wpm > 0).reduce((a, b) => a + b.wpm, 0);
        wpmSum = Math.round(wpmSum * 1000) / 1000;
        return { wpmSum, charWpms };
    }
    getWPM(charDur) {
        let charWpm = { character: charDur.character, wpm: 0.0 };
        if (charDur.durationMilliseconds > 0) {
            let timeDifferenceMinute = charDur.durationMilliseconds / 60000.0;
            if (timeDifferenceMinute > 0) {
                let CPM = 1 / timeDifferenceMinute;
                // The standard is that one word = 5 characters
                charWpm.wpm = CPM / 5;
            }
        }
        charWpm.wpm = Math.round(charWpm.wpm * 1000) / 1000;
        return charWpm;
    }
}
exports.WPMCalculator = WPMCalculator;
//# sourceMappingURL=WPMCalculator.js.map