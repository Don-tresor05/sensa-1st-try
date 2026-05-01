import { AppProvider, useApp } from './context/AppContext';
import { HomeScreen } from './screens/HomeScreen';
import { SeeMode } from './screens/SeeMode';
import { HearMode } from './screens/HearMode';
import { SpeakMode } from './screens/SpeakMode';

function AppRouter() {
  const { mode } = useApp();
  switch (mode) {
    case 'see': return <SeeMode />;
    case 'hear': return <HearMode />;
    case 'speak': return <SpeakMode />;
    default: return <HomeScreen />;
  }
}

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
