import React, { useState, useImperativeHandle, forwardRef } from 'react';
const ErrorDisplay = forwardRef((props, ref) => {
    const [errorCount, setErrorCount] = useState(0);
    const { svgCharacter, chordImageHolder, mismatchedChar, mismatchedCharCode, isVisible } = props;
    const showError = (charCode) => {
        // svgCharacter.hidden = !isVisible;
        // chordImageHolder.hidden = false;
        // const firstChild = chordImageHolder.children[0] as HTMLElement;
        // firstChild.hidden = false;
        // mismatchedCharCode = charCode;
        setErrorCount(prevCount => prevCount + 1);
        console.log("ErrorDisplay isVisible", isVisible, mismatchedChar, mismatchedCharCode, errorCount);
    };
    const hideError = () => {
        // svgCharacter.hidden = false;
        // chordImageHolder.hidden = false;
        console.log("ErrorDisplay isVisible", isVisible, mismatchedChar, mismatchedCharCode, errorCount);
    };
    // Use useImperativeHandle to expose functions to the parent component
    useImperativeHandle(ref, () => ({
        showError,
        hideError,
    }));
    return (React.createElement("div", { style: { display: props.isVisible ? 'block' : 'none' } },
        React.createElement("div", null,
            "Error Count: ",
            errorCount),
        React.createElement("div", { className: "chord-image-holder", id: "chord-image-holder", "data-source": "ErrorDisplay.tsx" },
            React.createElement("div", { className: "col-sm-2 row generated next", id: "chord2" },
                React.createElement("span", { id: "char15" }, mismatchedChar),
                React.createElement("img", { loading: "lazy", alt: "2", src: `/images/svgs/${mismatchedCharCode}.svg`, width: "100", className: "hand" })))));
});
export default ErrorDisplay;
//# sourceMappingURL=ErrorDisplay.js.map