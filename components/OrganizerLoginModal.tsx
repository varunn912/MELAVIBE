import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';

// This password should be managed as a secure environment variable in a real production app.
const ORGANIZER_PASSWORD = 'organizer';

interface OrganizerLoginModalProps {
  onLoginSuccess: () => void;
  onClose: () => void;
  language: string;
}

const OrganizerLoginModal: React.FC<OrganizerLoginModalProps> = ({ onLoginSuccess, onClose, language }) => {
  const { t } = useTranslations(language);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ORGANIZER_PASSWORD) {
      setError('');
      onLoginSuccess();
    } else {
      setError(t('incorrectPasswordError'));
      setPassword(''); // Clear password on failure
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scale-in">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('organizerLoginTitle')}</h2>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('passwordLabel')}</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark rounded-lg focus:ring-primary focus:border-primary"
                    placeholder={t('passwordPlaceholder')}
                    autoFocus
                />
            </div>
             {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg">{error}</p>}
        </div>
        

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-light dark:border-border-dark">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-copy-secondary-light dark:text-copy-primary-dark bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20">
              {t('cancel')}
            </button>
            <button 
              type="button" 
              onClick={handleLogin}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:outline-none focus:ring-primary/50"
            >
              {t('signInButton')}
            </button>
       </div>
      </div>
    </div>
  );
};

export default OrganizerLoginModal;