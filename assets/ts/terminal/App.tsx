// App.tsx
import React from 'react';
import { XtermAdapter } from './XtermAdapter';
import { LocalStoragePersistence } from './Persistence';
import { HandexTerm } from './HandexTerm';
import { TerminalCssClasses } from './TerminalTypes';

// App.tsx
class App extends React.Component {
  terminalElement: HTMLDivElement | null = null;

  terminalElementRef = (element: HTMLDivElement) => {
    this.terminalElement = element;
    // Now that the terminalElement is set, you can pass it down to XtermAdapter
    this.forceUpdate(); // This will cause App to re-render
  };

  render() {
    return (
      <div>
        <div
          ref={this.terminalElementRef}
          id={TerminalCssClasses.Terminal}
          className={TerminalCssClasses.Terminal}
        />
        {this.terminalElement && <XtermAdapter 
          terminalElement={this.terminalElement} 
          />}
      </div>
    );
  }
}

export default App;