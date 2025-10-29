import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ConfigSetupProps {
  onConfigured: () => void;
}

const ConfigSetup: React.FC<ConfigSetupProps> = ({ onConfigured }) => {
  const { t } = useTranslations('en'); // Use a fixed language for the setup screen
  const [configText, setConfigText] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<'paste' | 'scan'>('paste');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const saveConfigAndReload = (configObject: object) => {
    try {
      localStorage.setItem('firebaseConfig', JSON.stringify(configObject));
      onConfigured();
    } catch (e) {
      setError(t('configSaveError'));
      console.error(e);
    }
  };
  
  const handlePasteSave = () => {
    setError('');
    if (!configText.trim()) {
      setError(t('configEmptyError'));
      return;
    }
    
    // Robustly find the JavaScript object within the pasted text.
    const startIndex = configText.indexOf('{');
    const endIndex = configText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      setError(t('configParsingError'));
      return;
    }
    
    const objectString = configText.substring(startIndex, endIndex + 1);
    
    try {
      // Use the Function constructor as a safe-eval to parse the JS object literal.
      // This correctly handles unquoted keys and other JS object syntax.
      const configObject = new Function(`return ${objectString}`)();

      if (configObject.apiKey && configObject.databaseURL) {
        saveConfigAndReload(configObject);
      } else {
        setError(t('configParsingError'));
      }
    } catch (e) {
      setError(t('configParsingError'));
      console.error("Error parsing config object:", e);
    }
  };
  
  useEffect(() => {
    if (view !== 'scan' || scannerRef.current) return;

    const scanner = new Html5QrcodeScanner("config-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
      scanner.clear();
      try {
        const parsedConfig = JSON.parse(decodedText);
        if (parsedConfig.apiKey && parsedConfig.databaseURL) {
          saveConfigAndReload(parsedConfig);
        } else {
          setError(t('invalidQRCode'));
        }
      } catch (e) {
        setError(t('scanError'));
      }
    };
    const onScanFailure = (error: string) => {
       if (error.includes('permission')) {
         setError(t('cameraPermissionError'));
         scanner.clear();
       }
    };
    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear config QR scanner.", err));
        scannerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-surface-light dark:bg-surface-dark p-8 rounded-xl shadow-2xl border border-border-light dark:border-border-dark">
        <h1 className="text-3xl font-bold text-center text-copy-primary-light dark:text-copy-primary-dark mb-2">{t('configSetupTitle')}</h1>
        {view === 'paste' ? (
          <>
            <p className="text-center text-copy-secondary-light dark:text-copy-secondary-dark mb-6">{t('configSetupPasteInstructions')}</p>
            <div>
              <label htmlFor="config-paste-area" className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('configSetupPasteLabel')}</label>
              <textarea
                id="config-paste-area" value={configText} onChange={(e) => setConfigText(e.target.value)}
                rows={8}
                className="w-full p-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark rounded-lg focus:ring-primary focus:border-primary font-mono text-sm"
                placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  ...\n};`}
              />
            </div>
            <button onClick={handlePasteSave} className="w-full mt-6 px-5 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:outline-none focus:ring-primary/50">
              {t('configSetupSaveButton')}
            </button>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
              <span className="flex-shrink mx-4 text-copy-secondary-light dark:text-copy-secondary-dark text-sm">{t('configSetupOr')}</span>
              <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
            </div>
            <button onClick={() => setView('scan')} className="w-full px-5 py-3 text-base font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20">
              {t('configSetupScanButton')}
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-copy-secondary-light dark:text-copy-secondary-dark mb-4">{t('configSetupScanInstructions')}</p>
            <div id="config-qr-reader" className="w-full border-2 border-dashed border-border-light dark:border-border-dark rounded-lg qr-scanner-container"></div>
            <button onClick={() => setView('paste')} className="w-full mt-4 px-5 py-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark hover:bg-black/5 dark:hover:bg-white/10 rounded-lg">
              Back to Manual Entry
            </button>
          </>
        )}
        {error && <p className="text-red-500 text-sm mt-4 text-center bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <p className="text-xs text-center text-gray-500 mt-6">{t('configSetupFooter')}</p>
      </div>
    </div>
  );
};

export default ConfigSetup;