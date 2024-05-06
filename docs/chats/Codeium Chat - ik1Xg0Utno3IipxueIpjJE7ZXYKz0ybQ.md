# Codeium Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

**User** _at 1:52 pm, May 5, 2024_

I have the `nextCharsDisplay` displaying in `XtermAdapter` now, so abracting `nextCharsDisplay` from `HandChord` worked. Thanks for your help

Now I am realizing that in order for `nextCharsDisplay` to function as a separate component, I think I need this code to also be in `class NextCharsDisplay`, rather than `class HandChord`

```ts
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
```

---

**Codeium** _at 1:53 pm, May 5, 2024_

The method `setNext` in `class HandChord` seems to perform several tasks related to the `wholePhraseChords` element, updating the `nextCharsDisplay`, and managing SVG characters. If you want to move this functionality to `class NextCharsDisplay`, you will need to ensure that `NextCharsDisplay` has access to all necessary elements and state.

Here's a strategy for moving `setNext` into `NextCharsDisplay`:

1. Move any relevant state and utility methods (`getFirstNonMatchingChar`, etc.) from `HandChord` to `NextCharsDisplay`.
2. Pass any necessary elements (`wholePhraseChords`, `chordImageHolder`, `svgCharacter`) to `NextCharsDisplay` either in the constructor or via setter methods.
3. Ensure that `NextCharsDisplay` has a way to communicate back to `HandChord` if it needs to perform actions outside of its scope (for example, calling `setWpm`).

Here's an example of how you might start to refactor the `setNext` function into `NextCharsDisplay`. This example assumes that you have moved or will move the necessary state and utility methods to `NextCharsDisplay`:

```typescript
class NextCharsDisplay {
  // ... existing fields and methods ...

  // New fields for moved state and elements
  private wholePhraseChords: HTMLElement | null;
  private chordImageHolder: HTMLElement | null;
  private svgCharacter: HTMLElement | null;
  private testMode: HTMLInputElement | null;
  private setWpmCallback: () => void;

  // Example constructor modification to accept new elements and callback
  constructor(nextCharsElement: HTMLElement, wholePhraseChords: HTMLElement | null, chordImageHolder: HTMLElement | null, svgCharacter: HTMLElement | null, testMode: HTMLInputElement | null, setWpmCallback: () => void) {
    // ... existing constructor code ...
    this.wholePhraseChords = wholePhraseChords;
    this.chordImageHolder = chordImageHolder;
    this.svgCharacter = svgCharacter;
    this.testMode = testMode;
    this.setWpmCallback = setWpmCallback;
  }

  public setNext = () => {
    // ... moved setNext logic with modifications to work within NextCharsDisplay ...
  };

  // ... additional methods as needed ...
}
```

You will need to adjust the implementation details based on the actual responsibilities of `NextCharsDisplay` and how it interacts with the rest of your system. Remember to handle any dependencies `setNext` has on `HandChord` and ensure that it only manipulates state and elements that are relevant to the display of the next characters.