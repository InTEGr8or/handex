import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, createRef } from 'react';


const Timer = forwardRef((props: any, ref: any) => {
  const [centiSecond, setCentiSecond] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [svgStatus, setSvgStatus] = useState<'start' | 'stop' | 'pause'>('start');

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isActive) {
      intervalId = setInterval(() => {
        setCentiSecond((prevCentiSecond: number) => prevCentiSecond + 1);
      }, 10);
    } else if (!isActive && centiSecond !== 0) {
      clearInterval(intervalId!);
    }
    
    console.log('centiSecond updated to:', centiSecond); // This should log the updated value

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, centiSecond]);

  const start = () => {
    setIsActive(true);
    setSvgStatus('pause');
  };

  const stop = () => {
    setIsActive(false);
    setSvgStatus('start');
  };

  const reset = (): number => {
    setIsActive(false);
    const finalCentiSecond = centiSecond;
    setCentiSecond(0);
    setSvgStatus('start');
    console.log('Timer reset from:', finalCentiSecond); // This will still log the old value due to the asynchronous nature of setState
    return finalCentiSecond;
  };

  const success = () => {
    console.log("Timer Success");
    setCentiSecond(0);
    setIsActive(false);
    setSvgStatus('start');
  };

  useImperativeHandle(ref, () => ({
    start,
    stop,
    reset,
    success
  }));

  const renderSvg = () => {
    switch (svgStatus) {
      case 'start':
        return <use href="#start" transform="scale(2,2)" />;
      case 'stop':
        return <use href="#stop" transform="scale(2,2)" />;
      case 'pause':
        return <use href="#pause" transform="scale(2,2)" />;
      default:
        return <use href="#stop" transform="scale(2,2)" />;
    }
  };

  return (
    <React.Fragment>
      <span id="timer">{(centiSecond / 100).toFixed(1)}</span>
      <svg width="15" height="20" style={{ float: 'left' }}>
        {renderSvg()}
      </svg>
      {/* Add buttons or interactions to control the timer */}
    </React.Fragment>
  );
});

export default Timer;