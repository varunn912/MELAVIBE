import React, { useState } from 'react';
import { LostAndFoundItem, LfStatus } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface LfOrganizerCardProps {
  item: LostAndFoundItem;
  onStatusChange: (itemId: string, isResolved: boolean) => void;
  language: string;
  isOnline: boolean;
}

const LfOrganizerCard: React.FC<LfOrganizerCardProps> = ({ item, onStatusChange, language, isOnline }) => {
  const { t } = useTranslations(language);
  const [copied, setCopied] = useState(false);

  const handleCopyCoords = () => {
    if (item.location) {
      const coords = `${item.location.latitude}, ${item.location.longitude}`;
      navigator.clipboard.writeText(coords).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const LocationInfo = () => {
    if (!item.location) return null;
    return (
      <div className="flex gap-2 text-xs">
        <a href={`https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
          {t('viewOnMap')}
        </a>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <button onClick={handleCopyCoords} className="font-semibold text-primary hover:underline">
          {copied ? t('coordinatesCopied') : t('copyCoordinates')}
        </button>
      </div>
    );
  };

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg shadow-md border border-border-light dark:border-border-dark overflow-hidden flex flex-col ${item.isResolved ? 'opacity-60' : ''}`}>
      {item.imageDataUrl && (
        <img src={item.imageDataUrl} alt={item.description} className="w-full h-48 object-cover" />
      )}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status === LfStatus.Found ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
            {item.status === LfStatus.Found ? t('lfStatus_FOUND') : t('lfStatus_LOST')}
          </span>
          <span className="text-xs font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{item.category}</span>
        </div>
        <p className="text-md font-semibold text-copy-primary-light dark:text-copy-primary-dark mt-2">{item.description}</p>
        <p className="text-xs text-copy-secondary-light dark:text-copy-secondary-dark mt-2">Reported: {new Date(item.timestamp).toLocaleString(language)}</p>

        {item.audioDataUrl && (
            <div className="mt-3">
                <audio src={item.audioDataUrl} controls className="w-full h-10" />
            </div>
        )}

        {item.location && (
            <div className="mt-3">
                <LocationInfo />
            </div>
        )}
        
        <div className="flex-grow"></div>

        <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
          {!item.isResolved ? (
            <button 
              onClick={() => onStatusChange(item.id, true)}
              disabled={!isOnline}
              className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 disabled:opacity-50"
            >
              {t('markAsResolved')}
            </button>
          ) : (
             <div className="text-center text-sm font-bold text-green-600 dark:text-green-400 p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                {t('itemClaimed')}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LfOrganizerCard;