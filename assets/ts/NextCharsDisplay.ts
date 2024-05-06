import { spaceDisplayChar } from "./types/Types.js";


export class NextCharsDisplay {
    private nextCharsElement: HTMLElement;
    private phraseString: string = '';

    private wholePhraseChords: HTMLElement | null;
    private chordImageHolder: HTMLElement | null;
    private svgCharacter: HTMLElement | null;
    private testMode: HTMLInputElement | null;
    private setWpmCallback: () => void;
    private testArea: HTMLTextAreaElement | null;
    private nextChar: string = '';

    constructor(
        nextCharsElement: HTMLElement,
        wholePhraseChords: HTMLElement | null = null,
        chordImageHolder: HTMLElement | null = null,
        svgCharacter: HTMLElement | null = null,
        testMode: HTMLInputElement | null = null,
        setWpmCallback: () => void = () => {},
        testArea: HTMLTextAreaElement | null = null
    ) {
        if (!nextCharsElement) throw new Error('NextChars element not found');
        this.nextCharsElement = nextCharsElement as HTMLElement;
        this.nextCharsElement.hidden = true;
        this.wholePhraseChords = wholePhraseChords;
        this.chordImageHolder = chordImageHolder;
        this.svgCharacter = svgCharacter;
        this.testMode = testMode;
        this.setWpmCallback = setWpmCallback;
        this.testArea = testArea;   
    }

    reset(): void {
        this.phraseString = '';
        this.setNext('');
        this.nextCharsElement.hidden = true;
    }

    setPhrase(newPhrase: string): void {
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

    private formatNextChars(chars: string): string {
        let result = chars;
        // Format the characters as needed for display, e.g., replace spaces, add span for the next character, etc.
        // Return the formatted string to be set as innerHTML of the nextCharsElement
        return result;
    }

    public setNext = (testPhrase: string): HTMLElement | null => {
        const nextIndex = this.getFirstNonMatchingChar(testPhrase);
        console.log("Next index: " + nextIndex);
        if (nextIndex < 0) {
            return null;
        }
        // Remove the outstanding class from the previous chord.
        Array
            .from(this.wholePhraseChords?.children ?? [])
            .forEach((chord, i) => {
                chord.classList.remove("next");
            });
        if (this.wholePhraseChords && nextIndex > this.wholePhraseChords.children.length - 1) return null;

        let nextCharacter = `<span class="nextCharacter">${this.phraseString.substring(nextIndex, nextIndex + 1).replace(' ', '&nbsp;')}</span>`;

        // this.updateDisplay(testPhrase);
        const nextChars = this.phraseString.substring(nextIndex, nextIndex + 40);
        this.nextCharsElement.innerHTML = this.formatNextChars(nextChars);
        
        const next = this.wholePhraseChords?.children[nextIndex] as HTMLElement;
        if (next) {
            console.log("Next character: " + nextCharacter);
            if (this.nextChar) this.nextChar = next.getAttribute("name")?.replace("Space", " ") ?? "";
            next.classList.add("next");
            // If we're in test mode and the last character typed doesn't match the next, expose the svg.
            Array.from(next.childNodes)
                .filter((x): x is HTMLImageElement => x.nodeName == "IMG")
                .forEach((x: HTMLImageElement) => {
                    x.width = 140;
                    let charSvgClone = x.cloneNode(true) as HTMLImageElement;
                    charSvgClone.hidden = this.testMode?.checked ?? false;
                    if (this.chordImageHolder){
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
        if (this.svgCharacter && !this.testMode?.checked) {
            this.svgCharacter.hidden = false;
        }
        this.setWpmCallback();
        return next;
    };

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
}