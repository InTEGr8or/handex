
export function createElement<T extends HTMLElement>(tagName: keyof HTMLElementTagNameMap, className?: string): T {
    const element = document.createElement(tagName) as T;
    if (className) {
        element.classList.add(className);
    }
    return element;
}
