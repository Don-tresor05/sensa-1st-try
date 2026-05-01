import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n';
import { EmergencyButton } from './EmergencyButton';
import { AppMode } from '../types';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showEmergency?: boolean;
}

const modeColors: Record<Exclude<AppMode, 'home'>, string> = {
  see: 'from-sky-900 to-sky-800',
  hear: 'from-teal-900 to-teal-800',
  speak: 'from-amber-900 to-amber-800',
};

export function Header({ title, showBack = false, showEmergency = false }: HeaderProps) {
  const { setMode, mode, language, setLanguage } = useApp();
  const t = translations[language];

  const bgClass = mode !== 'home' ? modeColors[mode as Exclude<AppMode, 'home'>] : 'from-slate-900 to-slate-800';

  return (
    <header className={`bg-gradient-to-r ${bgClass} text-white px-4 py-3 flex items-center justify-between shadow-lg`}>
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            onClick={() => setMode('home')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label={t.back}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="min-w-0">
          <span className="text-xs font-medium text-white/60 block leading-none">SENSA</span>
          <h1 className="text-base font-bold truncate leading-tight">{title || t.appName}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setLanguage(language === 'en' ? 'rw' : 'en')}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
        >
          {language === 'en' ? 'RW' : 'EN'}
        </button>
        {showEmergency && <EmergencyButton />}
      </div>
    </header>
  );
}
