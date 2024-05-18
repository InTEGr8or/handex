import React from 'react';

export function App() {
  return (
    <div className='App'>
      <h1>Hello React.</h1>
      <h2>Start editing to see some magic happen!</h2>
      <Parent />
    </div>
  );
}

export function Parent() {
  const [mode] = React.useState(0);
  const testMode = "parent test";
  return <Child mode={testMode} />;
}

export function Child({mode}) {
  let inputRef;

  function onInputHandler(event) {
    console.log(event.target.value);
  }
  return(
    <div>
      {mode}
      <input 
        ref={inputRef}
        onInput={onInputHandler} />
    </div>
  )
}

// Log to console
console.log('Hello console')