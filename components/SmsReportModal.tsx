import React, { useState } from 'react';
import { IssueType, Report, ReportStatus } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { ISSUE_TYPE_DETAILS } from '../constants';

// This simple keyword-based analysis can be run offline for quick triaging.
async function analyzeReportPriority(description: string): Promise<'Low' | 'Medium' | 'High'> {
    const lowerCaseDescription = description.toLowerCase();
    const highPriorityKeywords = ['fire', 'emergency', 'unconscious', 'violence', 'weapon', 'assault', 'fight', 'heart attack', 'stroke', 'bleeding', 'not breathing', 'severe injury'];
    if (highPriorityKeywords.some(keyword => lowerCaseDescription.includes(keyword))) return 'High';
    const mediumPriorityKeywords = ['theft', 'harassment', 'stolen', 'lost child', 'missing person', 'broken', 'leak', 'power outage', 'major disruption', 'aggressive'];
    if (mediumPriorityKeywords.some(keyword => lowerCaseDescription.includes(keyword))) return 'Medium';
    return 'Low';
}

interface SmsReportModalProps {
  onClose: () => void;
  onSubmit: (report: Report) => void;
  language: string;
}

const IssueTypeButton: React.FC<{
  details: { icon: React.FC<{className?: string}>; key: string };
  onClick: () => void;
  isSelected: boolean;
  language: string;
}> = ({ details, onClick, isSelected, language }) => {
  const { t } = useTranslations(language);
  const Icon = details.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 flex flex-col items-center justify-center text-center rounded-lg transition-all duration-200 border-2 ${
        isSelected ? 'border-primary bg-primary/10' : 'border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark hover:border-primary/50'
      }`}
    >
      <Icon className={`w-10 h-10 mb-2 ${isSelected ? 'text-primary' : 'text-copy-secondary-light dark:text-copy-secondary-dark'}`} />
      <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-copy-primary-light dark:text-copy-primary-dark'}`}>{t(details.key)}</span>
    </button>
  );
};


const SmsReportModal: React.FC<SmsReportModalProps> = ({ onClose, onSubmit, language }) => {
  const { t } = useTranslations(language);
  const [selectedType, setSelectedType] = useState<IssueType | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      alert('Please select an issue type.');
      return;
    }
    if (!message.trim()) {
      alert('Please enter the message content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const priority = await analyzeReportPriority(message);
      
      const newReport: Report = {
        id: `rep_${new Date().getTime()}`,
        type: selectedType!,
        description: message,
        timestamp: Date.now(),
        status: ReportStatus.New,
        aiPriority: priority,
        source: 'sms',
        userId: 'sms_submission',
      };
      onSubmit(newReport);
    } catch (error) {
      console.error("Failed during SMS report submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto animate-scale-in">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('logSmsModalTitle')}</h2>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>
        
        <p className="text-sm text-copy-secondary-light dark:text-copy-secondary-dark mb-4">{t('logSmsModalInstructions')}</p>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {(Object.keys(ISSUE_TYPE_DETAILS) as IssueType[]).map(type => (
                <IssueTypeButton
                    key={type}
                    details={ISSUE_TYPE_DETAILS[type]}
                    onClick={() => setSelectedType(type)}
                    isSelected={selectedType === type}
                    language={language}
                />
            ))}
        </div>

        <div>
            <label htmlFor="sms-message" className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('fullMessageContent')}</label>
            <textarea
                id="sms-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark rounded-lg focus:ring-primary focus:border-primary"
                placeholder="Transcribe the full SMS message here..."
            />
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-light dark:border-border-dark">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-copy-secondary-light dark:text-copy-primary-dark bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20">
              {t('cancel')}
            </button>
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isSubmitting || !selectedType || !message.trim()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary-dark focus:ring-4 focus:outline-none focus:ring-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : t('createReport')}
            </button>
       </div>
      </div>
    </div>
  );
};

export default SmsReportModal;