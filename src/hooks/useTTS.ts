import { useCallback } from 'react';
import { Language } from '../types';

export function useTTS(language: Language) {
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'rw' ? 'rw-RW' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith(language === 'rw' ? 'rw' : 'en'));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}
