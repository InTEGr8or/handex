// App.tsx
import React from 'react';
import { XtermAdapter } from './XtermAdapter';
// App.tsx
class App extends React.Component {
    constructor(props) {
        super(props);
        this.terminalElementRef = React.createRef();
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(XtermAdapter, { terminalElement: this.terminalElementRef.current, terminalElementRef: this.terminalElementRef })));
    }
}
export default App;
//# sourceMappingURL=App.js.map