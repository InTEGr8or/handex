---
original file name: Codeium Chat - 71UFwtv3lM86Ir0m0CYpZo1M2adYKfnG.md
summary: The user had a TypeScript error related to event listener parameter types not matching the event types being passed to it. The user provided a code snippet where an arrow function with `(e: InputEvent) => {...}` was used as an event listener for the `'input'` event type. The assistant explained the issue and suggested updating the event listener to accept the correct event type, `Event`, to resolve the error.
date: 2024-05-04T17:19
---

# Codeium Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

**User** _at 5:19 pm, May 4, 2024_

Explain problem: `No overload matches this call.
  Overload 1 of 2, '(type: "input", listener: (this: HTMLTextAreaElement, ev: Event) => any, options?: boolean | AddEventListenerOptions | undefined): void', gave the following error.
    Argument of type '(e: InputEvent) => void' is not assignable to parameter of type '(this: HTMLTextAreaElement, ev: Event) => any'.
      Types of parameters 'e' and 'ev' are incompatible.
        Type 'Event' is missing the following properties from type 'InputEvent': data, dataTransfer, inputType, isComposing, and 5 more.
  Overload 2 of 2, '(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void', gave the following error.
    Argument of type '(e: InputEvent) => void' is not assignable to parameter of type 'EventListenerOrEventListenerObject'.
      Type '(e: InputEvent) => void' is not assignable to type 'EventListener'.
        Types of parameters 'e' and 'evt' are incompatible.
          Type 'Event' is not assignable to type 'InputEvent'.`

---

**Codeium** _at 5:19 pm, May 4, 2024_

The error message you're seeing is due to the mismatch between the event listener parameter type and the event type being passed to it. 

In the provided code snippet, when you are adding an event listener to `this.testArea` with `'input'` event type, you are using an arrow function `(e: InputEvent) => {...}` as the event listener. The issue arises because the input event type is not compatible with the event type expected by the event listener.

To resolve this, you can update the event listener to accept the correct event type, which is `Event`. Here's how you can adjust the event listener:

```typescript
this.testArea.addEventListener('input', (e: Event) => {
    this.timer.test(e, this);
});
```

By changing the parameter type from `InputEvent` to `Event`, you align the event type with what the event listener is expecting, resolving the error.