import { useState, useEffect } from 'react';
import { getRandomQuote, Quote } from '../data/quotes';

interface MotivationalQuoteProps {
  sessionType: 'work' | 'shortBreak' | 'longBreak';
  isDark: boolean;
}

export const MotivationalQuote = ({ sessionType }: MotivationalQuoteProps) => {
  const [quote, setQuote] = useState<Quote>(() => getRandomQuote(sessionType === 'work'));
  const [isVisible, setIsVisible] = useState(true);

  // Update quote when session type changes
  useEffect(() => {
    // Fade out
    setIsVisible(false);
    
    // Wait for fade out, then update quote and fade in
    const timer = setTimeout(() => {
      setQuote(getRandomQuote(sessionType === 'work'));
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [sessionType]);

  return (
    <div 
      className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="status"
      aria-live="polite"
    >
      <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed">
        "{quote.text}"
      </p>
    </div>
  );
};

