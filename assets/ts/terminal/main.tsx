import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HandexTerm } from './HandexTerm';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  console.log('main.tsx rootElement', rootElement);
  if (rootElement) {
    // Create a root and render the React App component
    const root = ReactDOM.createRoot(rootElement);
    console.log('main.tsx root', root);
    root.render(<App />);

    // Any other non-React initialization can still happen here
    const terminalNav = document.getElementById('terminal-nav');
    if(terminalNav) terminalNav.addEventListener('click', (event) => {
      rootElement.focus();
    });
  }
});