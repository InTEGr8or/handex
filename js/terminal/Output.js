var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from "react";
import { TerminalCssClasses } from "./TerminalTypes";
export const Output = (_a) => {
    var props = __rest(_a, []);
    return (React.createElement("div", { id: TerminalCssClasses.Output, className: TerminalCssClasses.Output, onTouchStart: props.onTouchStart, onTouchMove: props.onTouchMove, onTouchEnd: props.onTouchEnd }, props.elements.map((htmlString, index) => (React.createElement("div", { key: index, dangerouslySetInnerHTML: { __html: htmlString } })))));
};
//# sourceMappingURL=Output.js.map