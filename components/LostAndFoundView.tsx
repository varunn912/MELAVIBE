import React, { useState, useMemo } from 'react';
import { LostAndFoundItem, LfStatus } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import AddLfItemModal from './AddLfItemModal';
import EmptyState from './EmptyState';
import { LostAndFoundIcon } from '../constants';

interface LostAndFoundViewProps {
  lostAndFoundItems: LostAndFoundItem[];
  userId: string;
  onLfSubmit: (item: LostAndFoundItem) => void;
  onBack: () => void;
  language: string;
  isOnline: boolean;
}

const LfCard: React.FC<{ item: LostAndFoundItem, language: string }> = ({ item, language }) => {
    const { t } = useTranslations(language);
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-md border border-border-light dark:border-border-dark overflow-hidden">
            {item.imageDataUrl && (
                <img src={item.imageDataUrl} alt={item.description} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status === LfStatus.Found ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                        {item.status === LfStatus.Found ? t('lfStatus_FOUND') : t('lfStatus_LOST')}
                    </span>
                    <span className="text-xs font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{item.category}</span>
                </div>
                <p className="text-md font-semibold text-copy-primary-light dark:text-copy-primary-dark mt-2">{item.description}</p>
                <p className="text-xs text-copy-secondary-light dark:text-copy-secondary-dark mt-2">{new Date(item.timestamp).toLocaleString(language)}</p>
            </div>
        </div>
    );
};

const LostAndFoundView: React.FC<LostAndFoundViewProps> = ({ lostAndFoundItems, userId, onLfSubmit, onBack, language, isOnline }) => {
  const { t } = useTranslations(language);
  const [view, setView] = useState<LfStatus>(LfStatus.Found);
  const [showAddModal, setShowAddModal] = useState<LfStatus | null>(null);

  const filteredItems = useMemo(() => {
    return lostAndFoundItems.filter(item => item.status === view && !item.isResolved);
  }, [lostAndFoundItems, view]);

  const handleItemSubmit = (item: LostAndFoundItem) => {
    onLfSubmit(item);
    setShowAddModal(null);
  };

  return (
    <div className="animate-fade-in">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Main Menu
        </button>
      <h1 className="text-3xl md:text-5xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('lostAndFoundHub')}</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 my-8 justify-between items-center">
        <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg">
            <button onClick={() => setView(LfStatus.Found)} className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors ${ view === LfStatus.Found ? 'bg-primary text-white shadow' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t('viewFoundItems')}</button>
            <button onClick={() => setView(LfStatus.Lost)} className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors ${ view === LfStatus.Lost ? 'bg-primary text-white shadow' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t('viewLostItems')}</button>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowAddModal(LfStatus.Found)} disabled={!isOnline} className="px-4 py-2 text-sm font-semibold rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 disabled:opacity-50">{t('iFoundSomething')}</button>
            <button onClick={() => setShowAddModal(LfStatus.Lost)} disabled={!isOnline} className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900 disabled:opacity-50">{t('iLostSomething')}</button>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <LfCard key={item.id} item={item} language={language} />
          ))}
        </div>
      ) : (
        <EmptyState Icon={LostAndFoundIcon} title={t('noLfItems')} message="" />
      )}

      {showAddModal && (
        <AddLfItemModal 
            mode={showAddModal}
            onClose={() => setShowAddModal(null)}
            onSubmit={handleItemSubmit}
            language={language}
            userId={userId}
        />
      )}
    </div>
  );
};

export default LostAndFoundView;