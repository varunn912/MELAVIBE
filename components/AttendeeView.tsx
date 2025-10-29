import React, { useState } from 'react';
import { IssueType, Report, Announcement, LostAndFoundItem } from '../types';
import { ISSUE_TYPE_DETAILS, EMERGENCY_SMS_NUMBER, LostAndFoundIcon, SafetyIcon } from '../constants';
import ReportModal from './ReportModal';
import MyReportsModal from './MyReportsModal';
import AnnouncementBanner from './AnnouncementBanner';
import { useTranslations } from '../hooks/useTranslations';
import LostAndFoundView from './LostAndFoundView';

interface AttendeeViewProps {
  onReportSubmit: (report: Report) => void;
  language: string;
  userId: string;
  reports: Report[];
  announcement?: Announcement;
  onDismissAnnouncement: (id: number) => void;
  isOnline: boolean;
  lostAndFoundItems: LostAndFoundItem[];
  onLfSubmit: (item: LostAndFoundItem) => void;
}

const IssueTypeButton: React.FC<{ issueType: IssueType; onClick: () => void; language: string }> = ({ issueType, onClick, language }) => {
  const { t } = useTranslations(language);
  const details = ISSUE_TYPE_DETAILS[issueType];
  const Icon = details.icon;
  return (
    <button
      onClick={onClick}
      className="bg-surface-light dark:bg-surface-dark group hover:bg-violet-500/10 dark:hover:bg-primary/20 border border-border-light dark:border-border-dark rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-primary/20 aspect-square w-full h-full"
    >
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-br from-primary to-secondary rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
        <Icon className="w-16 h-16 mb-4 text-primary transition-colors" />
      </div>
      <span className="text-lg font-semibold text-copy-primary-light dark:text-copy-primary-dark">{t(details.key)}</span>
    </button>
  );
};

const AttendeeView: React.FC<AttendeeViewProps> = (props) => {
  const { onReportSubmit, language, userId, reports, announcement, onDismissAnnouncement, isOnline, lostAndFoundItems, onLfSubmit } = props;
  const { t } = useTranslations(language);
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMyReports, setShowMyReports] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState(t('copyNumber'));
  const [attendeeView, setAttendeeView] = useState<'main' | 'report' | 'lf'>('main');

  const myReports = reports.filter(r => r.userId === userId && !r.isAnonymous);
  
  const handleReportSubmit = (report: Report) => {
    onReportSubmit(report);
    setSelectedIssue(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(EMERGENCY_SMS_NUMBER).then(() => {
        setCopyButtonText(t('numberCopied'));
        setTimeout(() => setCopyButtonText(t('copyNumber')), 2000);
    }).catch(err => {
        console.error('Failed to copy number: ', err);
        alert('Failed to copy number.');
    });
  };
  
  const renderMainView = () => (
    <>
        <div className="bg-gradient-to-r from-primary to-violet-600 dark:from-indigo-800 dark:to-primary border border-border-light dark:border-border-dark rounded-xl p-5 my-8 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-lg">
            <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <div>
                <h2 className="font-bold text-lg text-white">{t('reportViaSms')}</h2>
                <p className="text-sm text-violet-200">{t('smsInstructions')}</p>
            </div>
            </div>
            <button
            onClick={handleCopyNumber}
            className="px-5 py-2.5 text-sm font-semibold text-primary bg-white hover:bg-violet-100 rounded-lg shadow-sm hover:shadow-lg transition-all transform hover:scale-105 active:scale-100 w-full sm:w-auto flex-shrink-0"
            >
            {copyButtonText}
            </button>
        </div>

        <div className="flex justify-end items-center mb-6">
            <button
            onClick={() => setShowMyReports(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2-2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>
            {t('myReports')} ({myReports.length})
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <button onClick={() => setAttendeeView('report')} className="group text-center p-8 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg hover:shadow-primary/20 border border-border-light dark:border-border-dark transform hover:-translate-y-2 transition-all duration-300">
                <SafetyIcon className="w-24 h-24 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                <h2 className="text-3xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('reportIssue')}</h2>
                <p className="text-copy-secondary-light dark:text-copy-secondary-dark mt-2">Report safety, medical, and other incidents.</p>
            </button>
            <button onClick={() => setAttendeeView('lf')} className="group text-center p-8 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg hover:shadow-primary/20 border border-border-light dark:border-border-dark transform hover:-translate-y-2 transition-all duration-300">
                <LostAndFoundIcon className="w-24 h-24 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                <h2 className="text-3xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('lostAndFound')}</h2>
                <p className="text-copy-secondary-light dark:text-copy-secondary-dark mt-2">Report or find lost and found items.</p>
            </button>
        </div>
    </>
  );

  const renderReportView = () => (
    <>
        <button onClick={() => setAttendeeView('main')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Main Menu
        </button>
        <h1 className="text-3xl md:text-5xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('reportIssue')}</h1>
        <p className="text-center text-copy-secondary-light dark:text-copy-secondary-dark my-8 max-w-2xl mx-auto">Select the type of issue you want to report. You can add a description, photo, and voice note.</p>
      
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6 max-w-6xl mx-auto">
            {(Object.keys(ISSUE_TYPE_DETAILS) as IssueType[]).map((type, index) => (
            <div key={type} className="animate-slide-in-bottom" style={{ animationDelay: `${index * 100}ms`}}>
                <IssueTypeButton issueType={type} onClick={() => setSelectedIssue(type)} language={language} />
            </div>
            ))}
        </div>
    </>
  );

  return (
    <div className="p-4 md:p-8 relative">
      {announcement && <AnnouncementBanner announcement={announcement} onDismiss={onDismissAnnouncement} />}

      {attendeeView === 'main' && renderMainView()}
      {attendeeView === 'report' && renderReportView()}
      {attendeeView === 'lf' && <LostAndFoundView {...props} onBack={() => setAttendeeView('main')} />}
      
      {selectedIssue && (
        <ReportModal
          issueType={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onSubmit={handleReportSubmit}
          language={language}
          userId={userId}
          isOnline={isOnline}
        />
      )}

      {showMyReports && (
        <MyReportsModal
          reports={myReports}
          onClose={() => setShowMyReports(false)}
          language={language}
        />
      )}

      {showSuccess && (
         <div className="fixed bottom-5 right-5 bg-secondary text-white py-3 px-6 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-bottom">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <span>{t('reportSuccess')}</span>
         </div>
      )}
    </div>
  );
};

export default AttendeeView;