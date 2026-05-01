import { Eye, Ear, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n';
import { AppMode } from '../types';

interface ModeCard {
  mode: Exclude<AppMode, 'home'>;
  icon: React.ReactNode;
  titleKey: keyof typeof translations.en;
  descKey: keyof typeof translations.en;
  bg: string;
  border: string;
  iconBg: string;
  accent: string;
}

const modes: ModeCard[] = [
  {
    mode: 'see',
    icon: <Eye size={32} />,
    titleKey: 'seeMode',
    descKey: 'seeDesc',
    bg: 'bg-sky-950',
    border: 'border-sky-700',
    iconBg: 'bg-sky-700',
    accent: 'text-sky-300',
  },
  {
    mode: 'hear',
    icon: <Ear size={32} />,
    titleKey: 'hearMode',
    descKey: 'hearDesc',
    bg: 'bg-teal-950',
    border: 'border-teal-700',
    iconBg: 'bg-teal-700',
    accent: 'text-teal-300',
  },
  {
    mode: 'speak',
    icon: <MessageSquare size={32} />,
    titleKey: 'speakMode',
    descKey: 'speakDesc',
    bg: 'bg-amber-950',
    border: 'border-amber-700',
    iconBg: 'bg-amber-700',
    accent: 'text-amber-300',
  },
];

export function HomeScreen() {
  const { setMode, language, setLanguage } = useApp();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-600/30">
          <span className="text-white font-black text-2xl tracking-tighter">S</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">{t.appName}</h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">{t.tagline}</p>
        <button
          onClick={() => setLanguage(language === 'en' ? 'rw' : 'en')}
          className="mt-4 px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
        >
          {language === 'en' ? 'Kinyarwanda' : 'English'}
        </button>
      </div>

      {/* Mode Cards */}
      <div className="flex-1 px-4 pb-8 pt-2 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {modes.map((card) => (
          <button
            key={card.mode}
            onClick={() => setMode(card.mode)}
            className={`
              ${card.bg} border ${card.border}
              rounded-2xl p-5 text-left flex items-center gap-4
              hover:brightness-110 active:scale-98 transition-all duration-200
              shadow-lg group
            `}
            style={{ transform: 'scale(1)' }}
          >
            <div className={`${card.iconBg} rounded-xl p-3 text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <h2 className={`text-lg font-bold ${card.accent} mb-0.5`}>{t[card.titleKey] as string}</h2>
              <p className="text-slate-400 text-sm leading-snug">{t[card.descKey] as string}</p>
            </div>
            <svg className="ml-auto text-slate-600 flex-shrink-0" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pb-6 px-4">
        <p className="text-slate-600 text-xs italic">"Communication is not a privilege. It is the foundation of everything else."</p>
      </div>
    </div>
  );
}
