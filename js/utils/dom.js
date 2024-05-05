export function createElement(tagName, className) {
    const element = document.createElement(tagName);
    if (className) {
        element.id = className;
        element.classList.add(className);
    }
    return element;
}
//# sourceMappingURL=dom.js.map