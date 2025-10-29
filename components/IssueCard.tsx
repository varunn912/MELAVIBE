import React, { useState } from 'react';
import { Report, ReportStatus, IssueType } from '../types';
import { ISSUE_TYPE_DETAILS, STATUS_DETAILS, PRIORITY_DETAILS, TeamIcon, SummaryIcon, AnonymousIcon } from '../constants';
import { useTranslations } from '../hooks/useTranslations';

interface IssueCardProps {
  report: Report;
  onStatusChangeRequest: (id: string, status: ReportStatus) => void;
  language: string;
  isOnline: boolean;
  onImageClick: (imageDataUrl: string) => void;
  onAddNoteClick: (reportId: string) => void; // New prop for adding notes
  isInSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

const SmsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const CommentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
    </svg>
);


const IssueCard: React.FC<IssueCardProps> = ({ report, onStatusChangeRequest, language, isOnline, onImageClick, onAddNoteClick, isInSelectionMode, isSelected, onToggleSelection }) => {
  const { t } = useTranslations(language);
  const [copied, setCopied] = useState(false);
  // FIX: Replaced non-existent IssueType.General with IssueType.Other as a fallback.
  const issueDetails = ISSUE_TYPE_DETAILS[report.type] || ISSUE_TYPE_DETAILS[IssueType.Other];
  const Icon = issueDetails.icon;

  const StatusPill: React.FC<{ status: ReportStatus }> = ({ status }) => {
    const details = STATUS_DETAILS[status];
    return (
      <span className={`px-2 py-1 text-xs font-bold rounded-full ${details.color} ${details.textColor}`}>
        {t(details.key)}
      </span>
    );
  };
  
  const PriorityPill: React.FC<{ priority: 'Low' | 'Medium' | 'High' }> = ({ priority }) => {
    const details = PRIORITY_DETAILS[priority];
    return (
      <span className={`px-2 py-1 text-xs font-bold rounded-full ${details.color} text-white`}>
        {t(details.key)}
      </span>
    );
  };

  const handleCopyCoords = () => {
    if (report.location) {
      const coords = `${report.location.latitude}, ${report.location.longitude}`;
      navigator.clipboard.writeText(coords).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const LocationInfo = () => {
    if (!report.location) return <div className="h-5"/>; // Keep layout consistent

    return (
        <div className="flex gap-2">
            <a href={`https://www.google.com/maps?q=${report.location.latitude},${report.location.longitude}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
            {t('viewOnMap')}
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button onClick={handleCopyCoords} className="text-sm font-semibold text-primary hover:underline">
            {copied ? t('coordinatesCopied') : t('copyCoordinates')}
            </button>
        </div>
    );
  };

  return (
    <div 
      onClick={() => isInSelectionMode && onToggleSelection(report.id)}
      className={`relative bg-surface-light dark:bg-surface-dark border-l-4 ${issueDetails.accentColor} border-t border-r border-b border-border-light dark:border-border-dark rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col gap-4 ${isInSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-4 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark' : ''}`}
    >
      {isInSelectionMode && (
          <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary-dark' : 'bg-surface-light/50 border-primary/50'}`}>
              {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
              )}
          </div>
      )}

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg text-copy-primary-light dark:text-copy-primary-dark">{t(issueDetails.key)}</h3>
            <p className="text-xs text-copy-secondary-light dark:text-copy-secondary-dark">
              {new Date(report.timestamp).toLocaleString(language)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {report.isAnonymous && (
                <div title="Submitted Anonymously">
                    <AnonymousIcon className="w-5 h-5 text-gray-400" />
                </div>
            )}
            {report.source === 'sms' && (
                <div title="Reported via SMS">
                    <SmsIcon className="w-5 h-5 text-gray-400" />
                </div>
            )}
            <StatusPill status={report.status} />
        </div>
      </div>

      {report.imageDataUrl && (
          <img src={report.imageDataUrl} alt="Report attachment" className="rounded-lg w-full h-40 object-cover cursor-pointer" onClick={(e) => { if (!isInSelectionMode) { e.stopPropagation(); onImageClick(report.imageDataUrl!); }}}/>
      )}
      
      {report.description && <p className="text-copy-secondary-light dark:text-copy-secondary-dark text-sm whitespace-pre-wrap">{report.description}</p>}
      
      {report.audioDataUrl && (
        <div>
          <audio src={report.audioDataUrl} controls className="w-full h-10" />
        </div>
      )}

      {(report.aiSummary || report.aiSuggestedTeam || report.aiPriority) && (
        <div className="mt-2 p-3 bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark rounded-lg space-y-2">
            <h4 className="font-bold text-sm text-copy-primary-light dark:text-copy-primary-dark">{t('aiAssessment')}</h4>
            <div className="flex justify-between items-center text-xs">
                {report.aiPriority && (
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{t('aiPriority')}:</p>
                        <PriorityPill priority={report.aiPriority} />
                    </div>
                )}
                {report.aiSuggestedTeam && (
                    <div className="flex items-center gap-1.5 text-copy-secondary-light dark:text-copy-secondary-dark" title={t('aiSuggestedTeam')}>
                        <TeamIcon className="w-4 h-4" />
                        <span className="font-semibold">{t(`team_${report.aiSuggestedTeam}`)}</span>
                    </div>
                )}
            </div>
            {report.aiSummary && (
                 <div className="flex items-start gap-1.5 text-xs text-copy-secondary-light dark:text-copy-secondary-dark pt-1 border-t border-border-light dark:border-border-dark">
                    <SummaryIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p><span className="font-semibold">{t('aiSummary')}:</span> {report.aiSummary}</p>
                 </div>
            )}
        </div>
      )}

      <div className="flex justify-between items-center mt-auto pt-3 border-t border-border-light dark:border-border-dark">
         <LocationInfo />
         <button 
            onClick={() => onAddNoteClick(report.id)}
            disabled={!isOnline}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-md hover:bg-primary/20 disabled:opacity-50"
            title={!isOnline ? "You must be online to add a comment" : t('addComment')}>
            <CommentIcon className="w-4 h-4"/>
            {t('addComment')}
         </button>
      </div>

      <div className="pt-3 border-t border-border-light dark:border-border-dark flex flex-wrap gap-2 justify-end">
        {(Object.values(ReportStatus) as ReportStatus[]).map(status => (
          <button
            key={status}
            onClick={() => onStatusChangeRequest(report.id, status)}
            disabled={report.status === status || !isOnline}
            title={!isOnline ? "You must be online to change status" : ""}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              report.status === status
                ? `${STATUS_DETAILS[status].color} ${STATUS_DETAILS[status].textColor} cursor-not-allowed opacity-80`
                : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-copy-primary-light dark:text-copy-primary-dark disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {t(STATUS_DETAILS[status].key)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IssueCard;
