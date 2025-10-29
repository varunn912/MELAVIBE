import React, { useState, useMemo } from 'react';
import { Report, ReportStatus, LostAndFoundItem, SurveySubmission } from '../types';
import IssueCard from './IssueCard';
import { useTranslations } from '../hooks/useTranslations';
import { STATUS_DETAILS } from '../constants';
import EmptyState from './EmptyState';
import ReceiveModal from './ReceiveModal';
import SmsReportModal from './SmsReportModal'; 
import BroadcastModal from './BroadcastModal';
import QrToolsModal from './QrToolsModal';
import ShareQrDisplayModal from './ShareQrDisplayModal';
import AnalyticsModal from './AnalyticsModal';
import MapView from './MapView';
import AddNoteModal from './AddNoteModal';
import LfOrganizerCard from './LfOrganizerCard';
import WeatherWidget from './WeatherWidget';
import FeedbackView from './FeedbackView';

// --- Reusable Confirmation Modal ---
interface ConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel'
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scale-in" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title">
        <h2 id="confirmation-title" className="text-xl font-bold text-copy-primary-light dark:text-copy-primary-dark mb-3">{title}</h2>
        <p className="text-copy-secondary-light dark:text-copy-secondary-dark mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-copy-secondary-light dark:text-copy-primary-dark bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-500">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Icon Components ---
const NoReportsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const NoFilterResultsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
);
const SmsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const BroadcastIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.3-3.085-3.134-5.585-6.34-5.585m12.68 0c-3.206 0-6.04-2.5-6.34-5.585m0 11.17c.3-3.085 3.134-5.585 6.34-5.585m-6.34 5.585a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm12.68-5.585a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.34 15.84a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm12.68-5.585a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6H6a6 6 0 006 6z" />
    </svg>
);
const QrCodeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013.75 9.375v-4.5zM3.75 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013.75 19.125v-4.5zM13.5 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0113.5 9.375v-4.5zM13.5 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0113.5 19.125v-4.5z" />
    </svg>
);
const AnalyticsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V5.75A2.25 2.25 0 0018 3.5H6A2.25 2.25 0 003.75 5.75v12.5A2.25 2.25 0 006 20.25z" />
    </svg>
);
const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


interface OrganizerViewProps {
  reports: Report[];
  onStatusChange: (id: string, status: ReportStatus) => void;
  onReportsMerge: (newReports: Report[]) => Promise<number>;
  onReportAdd: (report: Report) => void;
  onBroadcast: (message: string) => void;
  onAddNote: (reportId: string, note: string) => void;
  language: string;
  isOnline: boolean;
  lostAndFoundItems: LostAndFoundItem[];
  onLfStatusChange: (itemId: string, isResolved: boolean) => void;
  surveySubmissions: SurveySubmission[];
}

type OrganizerMainView = 'reports' | 'lf' | 'surveys';

const OrganizerView: React.FC<OrganizerViewProps> = (props) => {
  const { reports, onStatusChange, onReportsMerge, onReportAdd, onBroadcast, onAddNote, language, isOnline, lostAndFoundItems, onLfStatusChange, surveySubmissions } = props;
  const { t } = useTranslations(language);
  const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority'>('timestamp');
  const [dashboardView, setDashboardView] = useState<'grid' | 'map'>('grid');
  const [mapMode, setMapMode] = useState<'pins' | 'density'>('pins');
  const [organizerMainView, setOrganizerMainView] = useState<OrganizerMainView>('reports');
  const [showQrToolsModal, setShowQrToolsModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showShareQrModal, setShowShareQrModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [confirmationState, setConfirmationState] = useState<{ isOpen: boolean; reportId?: string; targetStatus?: ReportStatus; } | null>(null);
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);
  const [lfFilter, setLfFilter] = useState<'unresolved' | 'resolved'>('unresolved');

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());

  const priorityOrder = { High: 3, Medium: 2, Low: 1 };

  const { filteredReports, stats } = useMemo(() => {
    const calculatedStats = reports.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
    }, {} as Record<ReportStatus, number>);

    let sorted = [...reports];
    if (sortBy === 'timestamp') {
        sorted.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'priority') {
        sorted.sort((a, b) => {
            const priorityA = a.aiPriority ? priorityOrder[a.aiPriority] : 0;
            const priorityB = b.aiPriority ? priorityOrder[b.aiPriority] : 0;
            if (priorityB !== priorityA) return priorityB - priorityA;
            return b.timestamp - a.timestamp; 
        });
    }

    const filtered = filter === 'ALL' ? sorted : sorted.filter(report => report.status === filter);
    return { filteredReports: filtered, stats: calculatedStats };
  }, [reports, filter, sortBy]);

  const filteredLfItems = useMemo(() => {
    return lostAndFoundItems.filter(item => {
        if (lfFilter === 'resolved') return item.isResolved;
        return !item.isResolved;
    });
  }, [lostAndFoundItems, lfFilter]);

  const handleStatusChangeRequest = (reportId: string, targetStatus: ReportStatus) => {
    const currentReport = reports.find(r => r.id === reportId);
    if (!currentReport) return;
    
    if (currentReport.status === ReportStatus.New && targetStatus === ReportStatus.InProgress) {
        onStatusChange(reportId, targetStatus);
        return;
    }

    setConfirmationState({ isOpen: true, reportId, targetStatus });
  };

  const handleConfirmStatusChange = () => {
    if (confirmationState?.reportId && confirmationState?.targetStatus) {
        onStatusChange(confirmationState.reportId, confirmationState.targetStatus);
    }
    setConfirmationState(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Status', 'Priority', 'Summary', 'Suggested Team', 'Description', 'Timestamp', 'Latitude', 'Longitude', 'Source'];
    const rows = reports.map(r => [ r.id, r.type, r.status, r.aiPriority || 'N/A', `"${r.aiSummary?.replace(/"/g, '""') || ''}"`, r.aiSuggestedTeam || 'N/A', `"${r.description.replace(/"/g, '""')}"`, new Date(r.timestamp).toISOString(), r.location?.latitude || 'N/A', r.location?.longitude || 'N/A', r.source || 'app' ].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `melavibe_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSmsReportSubmit = (report: Report) => {
    onReportAdd(report);
    setShowSmsModal(false);
  };

  const handleBroadcastSubmit = (message: string) => {
    onBroadcast(message);
    setShowBroadcastModal(false);
  }

  const toggleReportSelection = (reportId: string) => {
    const newSet = new Set(selectedReportIds);
    if (newSet.has(reportId)) {
        newSet.delete(reportId);
    } else {
        newSet.add(reportId);
    }
    setSelectedReportIds(newSet);
  };

  const getSelectedReports = () => {
    return reports.filter(r => selectedReportIds.has(r.id));
  };
  
  const handleGenerateShareQr = () => {
    setSelectionMode(false);
    setShowShareQrModal(true);
  };

  const cancelSelectionMode = () => {
    setSelectionMode(false);
    setSelectedReportIds(new Set());
  };
  
  const handleViewReportFromMap = (reportId: string) => {
    setDashboardView('grid');
    setHighlightedReportId(reportId);
    setTimeout(() => {
        const card = document.getElementById(`report-card-${reportId}`);
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setHighlightedReportId(null), 2000); // Remove highlight after 2s
    }, 100);
  };

  const offlineTitle = "This action is disabled while offline";

  const renderReportsDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-md border border-border-light dark:border-border-dark flex flex-wrap justify-around items-center gap-4 text-center">
            <div><p className="text-2xl font-bold text-primary">{reports.length}</p><p className="text-xs font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{t('totalReports')}</p></div>
            <div><p className="text-2xl font-bold text-blue-500">{stats.NEW || 0}</p><p className="text-xs font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{t('status_NEW')}</p></div>
            <div><p className="text-2xl font-bold text-yellow-500">{stats.IN_PROGRESS || 0}</p><p className="text-xs font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{t('status_IN_PROGRESS')}</p></div>
            <div><p className="text-2xl font-bold text-green-500">{stats.RESOLVED || 0}</p><p className="text-xs font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{t('status_RESOLVED')}</p></div>
        </div>
        <WeatherWidget language={language} />
      </div>


      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl">
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
             <span className="text-xs font-semibold pl-2 pr-1 text-copy-secondary-light dark:text-copy-secondary-dark">{t('sortBy')}:</span>
             <button onClick={() => setSortBy('timestamp')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${ sortBy === 'timestamp' ? 'bg-primary text-white' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t(`sort_timestamp`)}</button>
             <button onClick={() => setSortBy('priority')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${ sortBy === 'priority' ? 'bg-primary text-white' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t(`sort_priority`)}</button>
          </div>
          <div className="flex-grow flex flex-wrap gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button onClick={() => setFilter('ALL')} className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors ${ filter === 'ALL' ? 'bg-primary text-white' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>All</button>
            {(Object.values(ReportStatus) as ReportStatus[]).map(status => ( <button key={status} onClick={() => setFilter(status)} className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors ${ filter === status ? 'bg-primary text-white' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t(STATUS_DETAILS[status].key)}</button>))}
          </div>
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
             <button onClick={() => setDashboardView('grid')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${ dashboardView === 'grid' ? 'bg-primary text-white' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t('gridView')}</button>
             <button onClick={() => setDashboardView('map')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${ dashboardView === 'map' ? 'bg-primary text-white' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t('mapView')}</button>
             {dashboardView === 'map' && (
                <button 
                  onClick={() => setMapMode(mapMode === 'pins' ? 'density' : 'pins')} 
                  className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-primary/20 text-primary"
                  title={`Switch to ${mapMode === 'pins' ? 'Crowd Density' : 'Reports'} View`}
                >
                  {mapMode === 'pins' ? t('crowdDensityView') : t('reportsView')}
                </button>
            )}
          </div>
      </div>
      
      {dashboardView === 'grid' && (
        <>
            {filteredReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report, index) => (
                    <div id={`report-card-${report.id}`} key={report.id} className={`transition-all duration-1000 ${highlightedReportId === report.id ? 'scale-105 shadow-2xl shadow-primary/50' : ''} animate-slide-in-bottom`} style={{ animationDelay: `${Math.min(index * 50, 500)}ms`}}>
                        <IssueCard 
                            report={report} 
                            onStatusChangeRequest={handleStatusChangeRequest} 
                            language={language} 
                            isOnline={isOnline} 
                            onImageClick={setViewingImage}
                            onAddNoteClick={() => setShowAddNoteModal(report.id)}
                            isInSelectionMode={selectionMode}
                            isSelected={selectedReportIds.has(report.id)}
                            onToggleSelection={toggleReportSelection}
                        />
                    </div>
                ))}
                </div>
            ) : ( reports.length === 0 ? ( <EmptyState Icon={NoReportsIcon} title={t('emptyDashboardTitle')} message={t('emptyDashboardMessage')} /> ) : ( <EmptyState Icon={NoFilterResultsIcon} title={t('emptyFilterTitle')} message={t('emptyFilterMessage')} /> )
            )}
        </>
      )}
      {dashboardView === 'map' && <MapView reports={filteredReports} language={language} onViewReport={handleViewReportFromMap} mode={mapMode} />}
    </>
  );

  const renderLfDashboard = () => (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl">
        <div className="flex-grow flex flex-wrap gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
          <button onClick={() => setLfFilter('unresolved')} className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors ${ lfFilter === 'unresolved' ? 'bg-primary text-white' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t('unresolvedItems')}</button>
          <button onClick={() => setLfFilter('resolved')} className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors ${ lfFilter === 'resolved' ? 'bg-primary text-white' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t('resolvedItems')}</button>
        </div>
      </div>
      {filteredLfItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLfItems.map((item) => (
            <LfOrganizerCard key={item.id} item={item} onStatusChange={onLfStatusChange} language={language} isOnline={isOnline} />
          ))}
        </div>
      ) : (
        <EmptyState Icon={NoReportsIcon} title={t('noLfItems')} message="" />
      )}
    </>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('dashboard')}</h1>
        {!selectionMode ? (
          <div className="flex items-center gap-2 flex-wrap justify-center">
              <button onClick={() => setShowAnalyticsModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900"> <AnalyticsIcon className="w-4 h-4" /> {t('analytics')} </button>
              <button onClick={() => setShowQrToolsModal(true)} disabled={!isOnline} title={!isOnline ? offlineTitle : ""} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"> <QrCodeIcon className="w-4 h-4" /> {t('qrTools')} </button>
              <button onClick={() => setShowSmsModal(true)} disabled={!isOnline} title={!isOnline ? offlineTitle : ""} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900 disabled:opacity-50 disabled:cursor-not-allowed"> <SmsIcon className="w-4 h-4" /> {t('logSmsReport')} </button>
              <button onClick={() => setShowBroadcastModal(true)} disabled={!isOnline} title={!isOnline ? offlineTitle : ""} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900 disabled:opacity-50 disabled:cursor-not-allowed"> <BroadcastIcon className="w-4 h-4" /> {t('sendBroadcast')} </button>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900"> <ExportIcon className="w-4 h-4" /> {t('exportCSV')} </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap justify-center bg-surface-light dark:bg-surface-dark p-2 rounded-lg shadow-md">
              <button onClick={cancelSelectionMode} className="px-4 py-2 text-sm font-medium rounded-lg bg-black/10 text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/20">{t('cancelSelection')}</button>
              <button onClick={handleGenerateShareQr} disabled={selectedReportIds.size === 0} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed">{t('generateShareQR').replace('{count}', selectedReportIds.size.toString())}</button>
          </div>
        )}
      </div>

      <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg mb-6 max-w-lg">
        <button onClick={() => setOrganizerMainView('reports')} className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors ${ organizerMainView === 'reports' ? 'bg-primary text-white shadow' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t('incidentReports')}</button>
        <button onClick={() => setOrganizerMainView('lf')} className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors ${ organizerMainView === 'lf' ? 'bg-primary text-white shadow' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t('lfOrganizerView')}</button>
        <button onClick={() => setOrganizerMainView('surveys')} className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors ${ organizerMainView === 'surveys' ? 'bg-primary text-white shadow' : 'text-copy-primary-light dark:text-copy-primary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}>{t('feedbackView')}</button>
      </div>

      {organizerMainView === 'reports' && renderReportsDashboard()}
      {organizerMainView === 'lf' && renderLfDashboard()}
      {organizerMainView === 'surveys' && <FeedbackView submissions={surveySubmissions} language={language} />}

      {showQrToolsModal && <QrToolsModal 
        onClose={() => setShowQrToolsModal(false)} 
        language={language} 
        onStartSelection={() => { setSelectionMode(true); setShowQrToolsModal(false); }}
        onStartReceive={() => { setShowReceiveModal(true); setShowQrToolsModal(false); }}
      />}
      {showShareQrModal && <ShareQrDisplayModal reports={getSelectedReports()} onClose={() => { setShowShareQrModal(false); setSelectedReportIds(new Set()); }} language={language} />}
      {showReceiveModal && <ReceiveModal onScanComplete={onReportsMerge} onClose={() => setShowReceiveModal(false)} language={language} />}
      {showSmsModal && <SmsReportModal onSubmit={handleSmsReportSubmit} onClose={() => setShowSmsModal(false)} language={language} />}
      {showBroadcastModal && <BroadcastModal onSubmit={handleBroadcastSubmit} onClose={() => setShowBroadcastModal(false)} language={language} />}
      {showAnalyticsModal && <AnalyticsModal reports={reports} onClose={() => setShowAnalyticsModal(false)} language={language} />}
      {showAddNoteModal && <AddNoteModal reportId={showAddNoteModal} onAddNote={onAddNote} onClose={() => setShowAddNoteModal(null)} language={language} />}

      {confirmationState?.isOpen && confirmationState.targetStatus && (
        <ConfirmationModal
          onClose={() => setConfirmationState(null)}
          onConfirm={handleConfirmStatusChange}
          title={t('confirmStatusChangeTitle')}
          message={t('confirmStatusChangeMessage').replace('{status}', t(`status_${confirmationState.targetStatus}`))}
          confirmText={t('confirmStatusChangeButton')}
          cancelText={t('cancel')}
        />
      )}

      {viewingImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={() => setViewingImage(null)}>
          <img src={viewingImage} alt="Report attachment closeup" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default OrganizerView;