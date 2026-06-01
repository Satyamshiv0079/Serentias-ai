import { useEffect, useState, useRef } from 'react';

const transitionStyles = `
.page-transition-enter {
  opacity: 0;
  transform: translateY(12px);
}
.page-transition-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms ease-out, transform 400ms ease-out;
}
.page-transition-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  overflow: hidden;
}
`;

export default function PageTransition({ children, viewKey }) {
  const [animClass, setAnimClass] = useState('page-transition-enter');
  const prevKeyRef = useRef(viewKey);
  const styleInjectedRef = useRef(false);

  // Inject transition styles once
  useEffect(() => {
    if (styleInjectedRef.current) return;
    const style = document.createElement('style');
    style.textContent = transitionStyles;
    document.head.appendChild(style);
    styleInjectedRef.current = true;
    return () => {
      document.head.removeChild(style);
      styleInjectedRef.current = false;
    };
  }, []);

  // Trigger enter animation on mount
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setAnimClass('page-transition-active');
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Re-trigger animation when viewKey changes
  useEffect(() => {
    if (prevKeyRef.current === viewKey) return;
    prevKeyRef.current = viewKey;

    // Reset to hidden state
    setAnimClass('page-transition-enter');

    // Use a double-rAF to ensure the browser has applied the reset
    // before transitioning to the active state
    const outerFrame = requestAnimationFrame(() => {
      const innerFrame = requestAnimationFrame(() => {
        setAnimClass('page-transition-active');
      });
      // Store for cleanup
      frameRef.current = innerFrame;
    });

    const frameRef = { current: null };

    return () => {
      cancelAnimationFrame(outerFrame);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [viewKey]);

  return (
    <div className={`${animClass} page-transition-container`}>
      {children}
    </div>
  );
}
