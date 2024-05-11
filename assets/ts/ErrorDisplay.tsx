import React, { useState, useImperativeHandle, forwardRef } from 'react';

interface ErrorDisplayProps {
  svgCharacter: HTMLElement;
  chordImageHolder: HTMLElement;
}

const ErrorDisplay = forwardRef((props: ErrorDisplayProps, ref) => {
  const [errorCount, setErrorCount] = useState(0);
  const { svgCharacter, chordImageHolder } = props;

  const showError = () => {
    svgCharacter.hidden = false;
    chordImageHolder.hidden = false;
    const firstChild = chordImageHolder.children[0] as HTMLElement;
    firstChild.hidden = false;
    setErrorCount(prevCount => prevCount + 1);
  };

  const hideError = () => {
    svgCharacter.hidden = true;
    chordImageHolder.hidden = true;
  };

  // Use useImperativeHandle to expose functions to the parent component
  useImperativeHandle(ref, () => ({
    showError,
    hideError,
  }));

  return (
    <React.Fragment>
      <div>Error Count: {errorCount}</div>
      <div className="chord-image-holder" id="chord-image-holder">
        <div className="col-sm-2 row generated next" id="chord2" >
        <span id="char15">P</span>
        <img loading="lazy" alt="2" src="/images/svgs/594.svg" width="100" className="hand"></img>
      </div></div>
    </React.Fragment>
  );
});

export default ErrorDisplay;