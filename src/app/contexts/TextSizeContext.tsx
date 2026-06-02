import React, { createContext, useContext, useState, useEffect } from 'react';

type TextSize = 'small' | 'medium' | 'large';

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export const useTextSize = () => {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error('useTextSize must be used within TextSizeProvider');
  }
  return context;
};

const fontSizeMap = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

export const TextSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>('medium');

  useEffect(() => {
    const storedSize = localStorage.getItem('textSize') as TextSize;
    if (storedSize && ['small', 'medium', 'large'].includes(storedSize)) {
      setTextSizeState(storedSize);
      document.documentElement.style.setProperty('--font-size', fontSizeMap[storedSize]);
    }
  }, []);

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    document.documentElement.style.setProperty('--font-size', fontSizeMap[size]);
    localStorage.setItem('textSize', size);
  };

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};
