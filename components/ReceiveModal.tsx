import React, { useEffect, useState, useRef } from 'react';
import { Report } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';

interface ReceiveModalProps {
  onClose: () => void;
  onScanComplete: (reports: Report[]) => Promise<number>;
  language: string;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({ onClose, onScanComplete, language }) => {
  const { t } = useTranslations(language);
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error' | 'invalid'; message: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (scannerRef.current) return;
    
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scannerRef.current = scanner;

    const onScanSuccess = async (decodedText: string) => {
      // Prevent multiple scans
      if (isProcessing) return;
      setIsProcessing(true);

      // Stop scanning
      scanner.clear();
      
      try {
        const parsedData = JSON.parse(decodedText);

        // Check if data is an array of strings (the new robust report ID format)
        if (Array.isArray(parsedData) && (parsedData.length === 0 || typeof parsedData[0] === 'string')) {
          const reportIds = parsedData as string[];
          
          if (!database) {
            throw new Error("Database connection is not available.");
          }

          // Fetch each report from Firebase using the IDs
          const fetchPromises = reportIds.map(id => {
            const reportRef = ref(database, `reports/${id}`);
            return get(reportRef);
          });
          
          const snapshots = await Promise.all(fetchPromises);
          const fetchedReports: Report[] = snapshots.map(snapshot => snapshot.val()).filter(Boolean);

          const importedCount = await onScanComplete(fetchedReports);
          
          let message = `${t('scanSuccess')} `;
          if (importedCount > 0) {
            message += `${importedCount} ${t('reportsImported')}.`;
          } else {
            message += `No new reports were imported as they already exist.`;
          }
          setScanResult({ status: 'success', message });

        } else {
          // Fallback for old format or invalid data
          setScanResult({ status: 'invalid', message: t('invalidQRCode') });
        }
      } catch (error) {
        setScanResult({ status: 'error', message: t('scanError') });
        console.error("Error parsing or fetching QR code data:", error);
      }
    };

    const onScanFailure = (error: string) => {
        if (error.includes('permission')) {
             setScanResult({ status: 'error', message: t('cameraPermissionError') });
             scanner.clear();
        }
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear QR scanner on cleanup.", err));
        scannerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep dependencies empty to prevent re-renders from re-initializing the scanner

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('receiveReports')}</h2>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>

        {!scanResult && !isProcessing ? (
          <div>
            <p className="text-sm text-center text-copy-secondary-light dark:text-copy-secondary-dark mb-4">{t('syncReportsReceiveInstructions')}</p>
            <div id="qr-reader" className="w-full border-2 border-dashed border-border-light dark:border-border-dark rounded-lg qr-scanner-container"></div>
          </div>
        ) : (
          <div className="text-center py-8 h-[318px] flex flex-col justify-center">
            {isProcessing && !scanResult && (
              <>
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
                <p className="mt-4 font-semibold text-copy-primary-light dark:text-copy-primary-dark">Processing Scan...</p>
              </>
            )}
            {scanResult && (
              <>
                {scanResult.status === 'success' && <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {(scanResult.status === 'error' || scanResult.status === 'invalid') && <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                <p className={`mt-4 text-md font-semibold ${scanResult.status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {scanResult.message}
                </p>
                <button onClick={onClose} className="mt-6 px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
                  Close
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiveModal;