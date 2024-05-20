export function createElement(tagName, className) {
    const element = document.createElement(tagName);
    if (className) {
        element.id = className;
        element.classList.add(className);
    }
    return element;
}
export function createHTMLElementFromHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.firstChild;
}
//# sourceMappingURL=dom.js.map