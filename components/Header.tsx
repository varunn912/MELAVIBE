import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

type View = 'attendee' | 'organizer';
type Theme = 'light' | 'dark';

interface HeaderProps {
  currentView: View;
  onViewChangeRequest: (view: View) => void;
  language: string;
  setLanguage: (lang: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isOnline: boolean;
  isOrganizerAuthenticated: boolean;
  onLogout: () => void;
}

const Logo: React.FC = () => (
  <div className="w-10 h-10 flex items-center justify-center" aria-label="MelaVibe Logo">
     <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-fade-in">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6"/>
                <stop offset="100%" stopColor="#2DD4BF"/>
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <path d="M10 60 L35 35 L60 60 L35 85 Z" fill="url(#logoGradient)" opacity="0.7" style={{filter: 'url(#glow)'}}/>
        <path d="M60 60 L85 35 L110 60 L85 85 Z" fill="url(#logoGradient)" opacity="0.9" style={{filter: 'url(#glow)'}}/>
        <path d="M10 60 L35 35 L60 60 L35 85 Z" stroke="url(#logoGradient)" strokeWidth="4" fill="none"/>
        <path d="M60 60 L85 35 L110 60 L85 85 Z" stroke="url(#logoGradient)" strokeWidth="4" fill="none"/>
    </svg>
  </div>
);

const ThemeToggle: React.FC<{ theme: Theme; setTheme: (theme: Theme) => void }> = ({ theme, setTheme }) => {
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  return (
    <button onClick={toggleTheme} className="p-2 rounded-full text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
      {theme === 'light' ? (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      ) : (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      )}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ currentView, onViewChangeRequest, language, setLanguage, theme, setTheme, isOnline, isOrganizerAuthenticated, onLogout }) => {
  const { t } = useTranslations(language);

  const viewButtonClasses = (view: View) => 
    `px-4 py-1.5 rounded-md font-semibold transition-all text-sm transform active:scale-95 ${
      currentView === view ? 'bg-primary text-white shadow-md' : 'text-copy-secondary-light dark:text-copy-secondary-dark hover:bg-black/5 dark:hover:bg-white/10'
    }`;

  return (
    <header className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm dark:shadow-black/20 p-3 border-b border-border-light dark:border-border-dark">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary hidden sm:block">
            {t('appName')}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 pr-2 border-r border-border-light dark:border-border-dark">
            <div className="flex items-center gap-2 text-xs" title={isOnline ? 'Internet connection available' : 'No internet connection'}>
              <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              <span className="hidden sm:block font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg">
            <button onClick={() => onViewChangeRequest('attendee')} className={viewButtonClasses('attendee')}>{t('attendee')}</button>
            <button onClick={() => onViewChangeRequest('organizer')} className={viewButtonClasses('organizer')}>{t('organizer')}</button>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark text-sm rounded-lg focus:ring-primary focus:border-primary p-2"
          >
            <option value="en" className="bg-surface-light dark:bg-surface-dark">English</option>
            <option value="hi" className="bg-surface-light dark:bg-surface-dark">हिन्दी</option>
            <option value="te" className="bg-surface-light dark:bg-surface-dark">తెలుగు</option>
            <option value="bn" className="bg-surface-light dark:bg-surface-dark">বাংলা</option>
            <option value="mr" className="bg-surface-light dark:bg-surface-dark">मराठी</option>
            <option value="ta" className="bg-surface-light dark:bg-surface-dark">தமிழ்</option>
          </select>
           {currentView === 'organizer' && isOrganizerAuthenticated && (
            <button 
              onClick={onLogout} 
              className="p-2 rounded-full text-copy-secondary-light dark:text-copy-secondary-dark hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title={t('logoutButton')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
};

export default Header;