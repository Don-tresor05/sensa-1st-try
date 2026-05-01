import { useState, useMemo } from 'react';
import { Volume2, Trash2, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n';
import { useTTS } from '../hooks/useTTS';
import { phrases as allPhrases } from '../data/phrases';
import { Phrase } from '../types';

type Category = 'all' | 'basic' | 'needs' | 'feelings' | 'medical' | 'social';

const CATEGORY_COLORS: Record<Category, { bg: string; active: string; text: string }> = {
  all:      { bg: 'bg-slate-800 border-slate-700', active: 'bg-slate-600 border-slate-500', text: 'text-slate-200' },
  basic:    { bg: 'bg-blue-950 border-blue-800', active: 'bg-blue-700 border-blue-600', text: 'text-blue-200' },
  needs:    { bg: 'bg-green-950 border-green-800', active: 'bg-green-700 border-green-600', text: 'text-green-200' },
  feelings: { bg: 'bg-orange-950 border-orange-800', active: 'bg-orange-700 border-orange-600', text: 'text-orange-200' },
  medical:  { bg: 'bg-red-950 border-red-800', active: 'bg-red-700 border-red-600', text: 'text-red-200' },
  social:   { bg: 'bg-violet-950 border-violet-800', active: 'bg-violet-700 border-violet-600', text: 'text-violet-200' },
};

const PHRASE_CARD_COLORS: Record<Category, string> = {
  all:      'bg-slate-800 border-slate-700 hover:border-slate-500',
  basic:    'bg-blue-950 border-blue-900 hover:border-blue-700',
  needs:    'bg-green-950 border-green-900 hover:border-green-700',
  feelings: 'bg-orange-950 border-orange-900 hover:border-orange-700',
  medical:  'bg-red-950 border-red-900 hover:border-red-700',
  social:   'bg-violet-950 border-violet-900 hover:border-violet-700',
};

export function SpeakMode() {
  const { language } = useApp();
  const t = translations[language];
  const { speak } = useTTS(language);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedPhrases, setSelectedPhrases] = useState<Phrase[]>([]);

  const categories: Category[] = ['all', 'basic', 'needs', 'feelings', 'medical', 'social'];

  const filteredPhrases = useMemo(() =>
    selectedCategory === 'all'
      ? allPhrases
      : allPhrases.filter(p => p.category === selectedCategory),
    [selectedCategory]
  );

  const handlePhraseSelect = (phrase: Phrase) => {
    setSelectedPhrases(prev => [...prev, phrase]);
    const text = language === 'rw' ? phrase.labelRw : phrase.label;
    speak(text);
  };

  const handleSpeak = () => {
    if (selectedPhrases.length === 0) return;
    const sentence = selectedPhrases.map(p => language === 'rw' ? p.labelRw : p.label).join('. ');
    speak(sentence);
  };

  const phraseCategory = (p: Phrase): Category => p.category as Category;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header title={t.speakMode} showBack showEmergency />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Selected Phrases Bar */}
        <div className={`mx-4 mt-3 mb-2 rounded-2xl border transition-all ${
          selectedPhrases.length > 0
            ? 'bg-amber-950 border-amber-800 p-3'
            : 'bg-slate-900 border-slate-800 p-3'
        }`}>
          {selectedPhrases.length === 0 ? (
            <p className="text-slate-600 text-sm italic text-center">
              {language === 'en' ? 'Tap cards below to build a message...' : 'Kanda amakarita hasi kugira ngo ubuze ubutumwa...'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {selectedPhrases.map((p, i) => (
                <span key={i} className="bg-amber-800 text-amber-100 text-sm px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <span>{p.icon}</span>
                  {language === 'rw' ? p.labelRw : p.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-4 mb-3 flex gap-2">
          <button
            onClick={handleSpeak}
            disabled={selectedPhrases.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white font-bold text-sm transition-all active:scale-95 shadow-md shadow-amber-600/20"
          >
            <Volume2 size={18} />
            {t.speak}
            <ChevronRight size={16} className="opacity-60" />
          </button>
          <button
            onClick={() => setSelectedPhrases([])}
            disabled={selectedPhrases.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400 transition-all active:scale-95"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => {
            const colors = CATEGORY_COLORS[cat];
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isActive ? colors.active : colors.bg
                } ${colors.text}`}
              >
                {(t.categories as Record<string, string>)[cat]}
              </button>
            );
          })}
        </div>

        {/* Phrase Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="grid grid-cols-2 gap-2">
            {filteredPhrases.map(phrase => {
              const cat = phraseCategory(phrase);
              const cardClass = PHRASE_CARD_COLORS[cat];
              return (
                <button
                  key={phrase.id}
                  onClick={() => handlePhraseSelect(phrase)}
                  className={`
                    ${cardClass} border rounded-2xl p-4
                    flex flex-col items-center justify-center gap-2 text-center
                    active:scale-95 transition-all duration-150
                    min-h-[88px]
                  `}
                >
                  <span className="text-3xl leading-none">{phrase.icon}</span>
                  <span className="text-white text-xs font-semibold leading-tight line-clamp-2">
                    {language === 'rw' ? phrase.labelRw : phrase.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
