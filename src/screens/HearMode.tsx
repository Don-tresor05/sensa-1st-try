import { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n';

interface TranscriptLine {
  id: string;
  text: string;
  timestamp: string;
  isFinal: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function HearMode() {
  const { language } = useApp();
  const t = translations[language];
  const [listening, setListening] = useState(false);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getSpeechLang = () => language === 'rw' ? 'rw-RW' : 'en-US';

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLang();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) {
            const now = new Date();
            const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLines(prev => [...prev, {
              id: `${Date.now()}-${Math.random()}`,
              text,
              timestamp,
              isFinal: true,
            }]);
          }
          setInterim('');
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterim(interimText);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim('');
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setInterim('');
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, interim]);

  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header title={t.hearMode} showBack showEmergency />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Transcript Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          {lines.length === 0 && !interim && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-16 h-16 rounded-full bg-teal-900/40 flex items-center justify-center mb-4 border border-teal-800">
                <Mic size={28} className="text-teal-600" />
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                {listening ? t.noSpeech : (language === 'en' ? 'Tap the microphone to start transcribing' : 'Kanda button yo kumva gutangira')}
              </p>
            </div>
          )}

          {lines.map((line) => (
            <div key={line.id} className="flex gap-3 items-start animate-in slide-in-from-bottom-2">
              <span className="text-slate-600 text-xs pt-1 flex-shrink-0 font-mono">{line.timestamp}</span>
              <p className="text-white text-base leading-relaxed flex-1">{line.text}</p>
            </div>
          ))}

          {interim && (
            <div className="flex gap-3 items-start">
              <span className="text-slate-600 text-xs pt-1 flex-shrink-0 font-mono">...</span>
              <p className="text-teal-400 text-base leading-relaxed italic">{interim}</p>
            </div>
          )}
        </div>

        {/* Status bar */}
        {listening && (
          <div className="mx-4 mb-2 px-4 py-2 bg-teal-900/40 rounded-xl border border-teal-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-300 text-xs font-medium">
              {language === 'en' ? 'Listening...' : 'Kumva...'}
            </span>
          </div>
        )}

        {!supported && (
          <div className="mx-4 mb-2 px-4 py-2 bg-red-900/40 rounded-xl border border-red-800">
            <p className="text-red-300 text-xs">{language === 'en' ? 'Speech recognition not supported in this browser.' : 'Kwumva ijwi ntibisfashwa muri iki kizamini.'}</p>
          </div>
        )}

        {/* Controls */}
        <div className="px-4 pb-6 pt-2 flex gap-3">
          <button
            onClick={listening ? stopListening : startListening}
            disabled={!supported}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 disabled:opacity-40 ${
              listening
                ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {listening ? (
              <>
                <MicOff size={20} />
                {t.stopListening}
              </>
            ) : (
              <>
                <Mic size={20} />
                {t.startListening}
              </>
            )}
          </button>

          {lines.length > 0 && (
            <button
              onClick={() => setLines([])}
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all active:scale-95"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mx-4 mb-4 p-3 bg-teal-950 rounded-xl border border-teal-900">
          <p className="text-teal-400 text-xs leading-relaxed">
            {language === 'en'
              ? 'All speech around you will be transcribed to text in real time. Works with conversations, announcements, and media.'
              : 'Ijwi ryose ry\'abantu bari imbere yawe rizahindurwa mu nyandiko. Bikora neza mu biganiro, itangazo, no mu mfashanyigisho.'}
          </p>
        </div>
      </div>
    </div>
  );
}
