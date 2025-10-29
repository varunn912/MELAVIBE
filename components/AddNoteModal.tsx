import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';

interface AddNoteModalProps {
  reportId: string;
  onClose: () => void;
  onAddNote: (reportId: string, note: string) => void;
  language: string;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ reportId, onClose, onAddNote, language }) => {
  const { t } = useTranslations(language);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (note.trim()) {
      onAddNote(reportId, note.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('organizerNote')}</h2>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="w-full p-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark rounded-lg focus:ring-primary focus:border-primary"
          placeholder={t('addNotePlaceholder')}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-copy-secondary-light dark:text-copy-primary-dark bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20">
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!note.trim()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:outline-none focus:ring-primary/50 disabled:opacity-50"
          >
            {t('submitNote')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNoteModal;