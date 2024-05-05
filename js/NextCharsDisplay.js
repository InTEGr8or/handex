export class NextCharsDisplay {
    constructor(nextCharsElement) {
        this.phrase = '';
        if (!nextCharsElement)
            throw new Error('NextChars element not found');
        this.nextCharsElement = nextCharsElement;
        this.nextCharsElement.hidden = true;
        // this.phrase = phrase;
        // this.updateDisplay(0);
    }
    setPhrase(newPhrase) {
        this.phrase = newPhrase;
        this.updateDisplay(0); // Reset the display with the new phrase from the beginning
        this.nextCharsElement.hidden = false;
    }
    updateDisplay(nextIndex) {
        const nextChars = this.phrase.substring(nextIndex, nextIndex + 40);
        console.log(nextChars);
        this.nextCharsElement.innerHTML = this.formatNextChars(nextChars);
    }
    formatNextChars(chars) {
        let result = chars;
        // Format the characters as needed for display, e.g., replace spaces, add span for the next character, etc.
        // Return the formatted string to be set as innerHTML of the nextCharsElement
        return result;
    }
}
//# sourceMappingURL=NextCharsDisplay.js.map