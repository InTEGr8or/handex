import React from 'react';
export function App() {
    return (React.createElement("div", { className: 'App' },
        React.createElement("h1", null, "Hello React."),
        React.createElement("h2", null, "Start editing to see some magic happen!"),
        React.createElement(Parent, null)));
}
export function Parent() {
    const [mode] = React.useState(0);
    const testMode = "parent test";
    return React.createElement(Child, { mode: testMode });
}
export function Child({ mode }) {
    let inputRef;
    function onInputHandler(event) {
        console.log(event.target.value);
    }
    return (React.createElement("div", null,
        mode,
        React.createElement("input", { ref: inputRef, onInput: onInputHandler })));
}
// Log to console
console.log('Hello console');
//# sourceMappingURL=App.js.map