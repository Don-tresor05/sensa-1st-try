import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n';
import { useTTS } from '../hooks/useTTS';

export function EmergencyButton() {
  const { language } = useApp();
  const t = translations[language];
  const { speak } = useTTS(language);
  const [triggered, setTriggered] = useState(false);

  const handleEmergency = () => {
    setTriggered(true);
    speak(t.emergencyMessage);
    setTimeout(() => setTriggered(false), 4000);
  };

  return (
    <button
      onClick={handleEmergency}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide
        transition-all duration-200 active:scale-95
        ${triggered
          ? 'bg-red-700 text-white shadow-lg shadow-red-500/40 scale-105'
          : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/30'
        }
      `}
    >
      <AlertTriangle size={16} className={triggered ? 'animate-pulse' : ''} />
      {t.emergency}
    </button>
  );
}
