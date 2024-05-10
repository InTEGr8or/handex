import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context object
const TimerContext = createContext({
  centiSecond: 0,
  setCentiSecond: (value: number) => {},
  getCentiSecond: () => 0,
});

// Context Provider component
const TimerProvider: React.FC = ({ children }) => {
  const [centiSecond, setCentiSecond] = useState(0);
  // The rest of your timer logic...
  const getCentiSecond = () => centiSecond;

  return (
    <TimerContext.Provider value={{ centiSecond, setCentiSecond, getCentiSecond }}>
      {children}
    </TimerContext.Provider>
  );
};

// Custom hook to use the context
const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export { TimerProvider, TimerContext, useTimer };