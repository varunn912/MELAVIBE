import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import QRCode from 'qrcode';

interface QrToolsModalProps {
  onClose: () => void;
  language: string;
  onStartSelection: () => void;
  onStartReceive: () => void;
}

type Tab = 'shareApp' | 'syncReports' | 'shareSetup';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  Icon: React.FC<{ className?: string }>;
}> = ({ label, isActive, onClick, Icon }) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    className={`flex-1 flex flex-col items-center gap-2 p-3 text-sm font-semibold border-b-4 transition-colors ${
      isActive
        ? 'border-primary text-primary'
        : 'border-transparent text-copy-secondary-light dark:text-copy-secondary-dark hover:bg-black/5 dark:hover:bg-white/5'
    }`}
  >
    <Icon className="w-6 h-6" />
    {label}
  </button>
);

const ShareAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
);
const SyncIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
);
const UserAddIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
);


const QrToolsModal: React.FC<QrToolsModalProps> = ({ onClose, language, onStartSelection, onStartReceive }) => {
  const { t } = useTranslations(language);
  const [activeTab, setActiveTab] = useState<Tab>('shareApp');
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = qrCodeCanvasRef.current;
    if (!canvas) return;

    let dataToEncode: string | null = null;
    if (activeTab === 'shareApp') {
      dataToEncode = window.location.href;
    } else if (activeTab === 'shareSetup') {
      dataToEncode = localStorage.getItem('firebaseConfig');
    }

    if (dataToEncode) {
      setQrError(null);
      QRCode.toCanvas(canvas, dataToEncode, { width: 256, errorCorrectionLevel: 'M' }, (err) => {
        if (err) {
            console.error("Failed to generate QR code:", err);
            setQrError("Could not generate the QR code.");
        }
      });
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'shareApp':
        return (
          <div className="text-center">
            <p className="text-sm text-copy-secondary-light dark:text-copy-secondary-dark mb-4">{t('shareAppInstructions')}</p>
            <div className="bg-white p-4 rounded-lg inline-block"><canvas ref={qrCodeCanvasRef} /></div>
          </div>
        );
      case 'syncReports':
        return (
          <div className="text-center">
            <h3 className="font-bold text-lg text-copy-primary-light dark:text-copy-primary-dark mb-2">{t('syncReportsTitle')}</h3>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-copy-secondary-light dark:text-copy-secondary-dark mb-3">{t('syncReportsShareInstructions')}</p>
                    <button onClick={onStartSelection} className="w-full px-5 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">{t('startSelection')}</button>
                </div>
                <div className="flex items-center">
                    <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                    <span className="flex-shrink mx-4 text-copy-secondary-light dark:text-copy-secondary-dark text-sm">OR</span>
                    <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                </div>
                <div>
                    <p className="text-sm text-copy-secondary-light dark:text-copy-secondary-dark mb-3">{t('syncReportsReceiveInstructions')}</p>
                    <button onClick={onStartReceive} className="w-full px-5 py-3 text-base font-medium text-secondary-dark bg-secondary/10 rounded-lg hover:bg-secondary/20">{t('receiveReports')}</button>
                </div>
            </div>
          </div>
        );
      case 'shareSetup':
         return (
          <div className="text-center">
            <h3 className="font-bold text-lg text-copy-primary-light dark:text-copy-primary-dark mb-2">{t('shareSetupTitle')}</h3>
            <p className="text-sm text-copy-secondary-light dark:text-copy-secondary-dark mb-4">{t('shareSetupInstructions')}</p>
            <div className="bg-white p-4 rounded-lg inline-block"><canvas ref={qrCodeCanvasRef} /></div>
             <p className="text-xs text-center text-red-600 dark:text-red-400 mt-4 bg-red-500/10 p-2 rounded-md">{t('configQrWarning')}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-scale-in">
        <div className="flex justify-between items-center p-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('qrToolsTitle')}</h2>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>
        
        <div className="flex" role="tablist">
            <TabButton label={t('tabShareApp')} isActive={activeTab === 'shareApp'} onClick={() => setActiveTab('shareApp')} Icon={ShareAppIcon}/>
            <TabButton label={t('tabSyncReports')} isActive={activeTab === 'syncReports'} onClick={() => setActiveTab('syncReports')} Icon={SyncIcon}/>
            <TabButton label={t('tabShareSetup')} isActive={activeTab === 'shareSetup'} onClick={() => setActiveTab('shareSetup')} Icon={UserAddIcon}/>
        </div>
        
        <div className="p-6">
          {qrError ? <p className="text-red-500 text-center">{qrError}</p> : renderContent()}
        </div>

      </div>
    </div>
  );
};

export default QrToolsModal;