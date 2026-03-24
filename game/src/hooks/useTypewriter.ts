import { useState, useEffect, useCallback, useRef } from 'react';

const TYPING_DELAY = 15;

export function useTypewriter(text: string) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
    indexRef.current = 0;
    setIsTyping(true);
    setDisplayedText('');

    const typeChar = () => {
      const currentText = textRef.current;
      let idx = indexRef.current;

      if (idx < currentText.length) {
        if (currentText[idx] === '<') {
          const tagEnd = currentText.indexOf('>', idx);
          if (tagEnd !== -1) {
            idx = tagEnd + 1;
          } else {
            idx++;
          }
        } else {
          idx++;
        }

        indexRef.current = idx;
        setDisplayedText(currentText.slice(0, idx));
        timeoutRef.current = setTimeout(typeChar, TYPING_DELAY);
      } else {
        setIsTyping(false);
      }
    };

    timeoutRef.current = setTimeout(typeChar, TYPING_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text]);

  const skipToEnd = useCallback(() => {
    if (!isTyping) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDisplayedText(textRef.current);
    setIsTyping(false);
  }, [isTyping]);

  return { displayedText, isTyping, skipToEnd };
}
