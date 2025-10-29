import React, { useEffect, useRef, useState } from 'react';
import { Report } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import QRCode from 'qrcode';

interface ShareQrDisplayModalProps {
  reports: Report[];
  onClose: () => void;
  language: string;
}

const ShareQrDisplayModal: React.FC<ShareQrDisplayModalProps> = ({ reports, onClose, language }) => {
  const { t } = useTranslations(language);
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (qrCodeCanvasRef.current && reports.length > 0) {
      // The robust sharing method: only share the unique IDs.
      const reportIds = reports.map(r => r.id);
      const dataToShare = JSON.stringify(reportIds);

      QRCode.toCanvas(qrCodeCanvasRef.current, dataToShare, { width: 300, errorCorrectionLevel: 'M' }, (err) => {
        if (err) {
            console.error("Failed to generate report share QR code:", err);
            setError("Could not generate the QR code. Please try again.");
        }
      });
    }
  }, [reports]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scale-in">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('shareQrDisplayTitle').replace('{count}', reports.length.toString())}</h2>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>
        
        <p className="text-sm text-center text-copy-secondary-light dark:text-copy-secondary-dark mb-4">
          {t('shareQrDisplayInstructions')}
        </p>

        <div className="flex justify-center items-center bg-white p-4 rounded-lg">
          {reports.length > 0 && !error ? (
            <canvas ref={qrCodeCanvasRef} />
          ) : (
            <div className="h-[300px] flex flex-col justify-center items-center text-center">
              <p className="font-semibold text-red-700">{error || "No reports were selected."}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-copy-secondary-light dark:text-copy-secondary-dark mt-4 bg-background-light dark:bg-background-dark p-2 rounded-md border border-border-light dark:border-border-dark">
          <b>{t('shareQrDisplayNote')}</b>
        </p>

        <div className="mt-6 flex justify-end">
             <button type="button" onClick={onClose} className="w-full px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
              Done
            </button>
        </div>

      </div>
    </div>
  );
};

export default ShareQrDisplayModal;