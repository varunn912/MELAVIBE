import React from 'react';
import { Report, OrganizerNote, IssueType } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { ISSUE_TYPE_DETAILS, STATUS_DETAILS } from '../constants';

interface MyReportsModalProps {
  reports: Report[];
  onClose: () => void;
  language: string;
}

const OrganizerNotes: React.FC<{ notes: OrganizerNote[], language: string }> = ({ notes, language }) => {
    const { t } = useTranslations(language);
    return (
        <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark">
            <h4 className="text-xs font-bold text-copy-secondary-light dark:text-copy-secondary-dark mb-2">{t('organizerNotes')}</h4>
            <div className="space-y-2 max-h-24 overflow-y-auto">
                {notes.map((note) => (
                    <div key={note.timestamp} className="bg-background-light dark:bg-background-dark p-2 rounded-md">
                        <p className="text-sm text-copy-primary-light dark:text-copy-primary-dark">{note.message}</p>
                        <p className="text-xs text-copy-secondary-light dark:text-copy-secondary-dark text-right">{new Date(note.timestamp).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MyReportCard: React.FC<{ report: Report, language: string }> = ({ report, language }) => {
    const { t } = useTranslations(language);
    // FIX: Replaced non-existent IssueType.General with IssueType.Other as a fallback.
    const issueDetails = ISSUE_TYPE_DETAILS[report.type] || ISSUE_TYPE_DETAILS[IssueType.Other];
    const statusDetails = STATUS_DETAILS[report.status];
    const Icon = issueDetails.icon;

    return (
        <div className={`p-4 bg-surface-light dark:bg-surface-dark rounded-lg border-l-4 ${issueDetails.accentColor} shadow-sm transition-all`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                        <p className="font-bold text-copy-primary-light dark:text-copy-primary-dark">{t(issueDetails.key)}</p>
                        <p className="text-xs text-copy-secondary-light dark:text-copy-secondary-dark">{new Date(report.timestamp).toLocaleString(language)}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusDetails.color} ${statusDetails.textColor}`}>
                    {t(statusDetails.key)}
                </span>
            </div>
            {report.organizerNotes && report.organizerNotes.length > 0 && (
                <OrganizerNotes notes={report.organizerNotes} language={language} />
            )}
        </div>
    );
};

const MyReportsModal: React.FC<MyReportsModalProps> = ({ reports, onClose, language }) => {
  const { t } = useTranslations(language);
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('myReportsTitle')}</h2>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>
        
        {reports.length > 0 ? (
          <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
            {reports.sort((a, b) => b.timestamp - a.timestamp).map(report => (
              <MyReportCard key={report.id} report={report} language={language} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 flex-grow flex flex-col justify-center items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-copy-secondary-light dark:text-copy-secondary-dark mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="font-semibold text-copy-primary-light dark:text-copy-primary-dark">{t('noMyReports')}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyReportsModal;
