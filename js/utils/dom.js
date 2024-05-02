"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createElement = void 0;
function createElement(tagName, className) {
    const element = document.createElement(tagName);
    if (className) {
        element.classList.add(className);
    }
    return element;
}
exports.createElement = createElement;
//# sourceMappingURL=dom.js.map