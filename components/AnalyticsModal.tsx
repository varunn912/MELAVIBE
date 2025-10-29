import React, { useMemo, useState, useEffect } from 'react';
import { Report, IssueType, ReportStatus } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { ISSUE_TYPE_DETAILS, PRIORITY_DETAILS } from '../constants';

interface AnalyticsModalProps {
  reports: Report[];
  onClose: () => void;
  language: string;
}

// A title component that is only visible when printing, as defined by the print styles.
const PrintTitle: React.FC<{ title: string }> = ({ title }) => (
    <h1 className="hidden print-only-title">{title}</h1>
);

/**
 * A reusable BarChart component for visualizing categorical data.
 * It features animated bars and clear data labels.
 */
const BarChart: React.FC<{ data: { label: string; value: number; color: string }[], title: string }> = ({ data, title }) => {
  // Find the max value to scale the bars correctly. Default to 1 to avoid division by zero.
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const [isMounted, setIsMounted] = useState(false);

  // Use a state to trigger animations after the component has mounted.
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark h-full flex flex-col print-card">
      <h3 className="text-md font-bold text-copy-primary-light dark:text-copy-primary-dark mb-4">{title}</h3>
      {/* 
        Chart Container Layout Explanation:
        - `flex-grow` allows this container to fill the available vertical space.
        - `flex h-48` creates a flexbox context with a fixed height. This is the container against which the bar heights will be calculated.
      */}
      <div className="flex-grow flex h-48 gap-3" aria-label={title}>
        {data.map((item, index) => (
          // Bar Wrapper Layout Explanation:
          // - `flex-1` ensures each bar wrapper takes up an equal amount of horizontal space.
          // - `flex flex-col justify-end` is crucial. It stacks the children vertically and aligns them to the bottom,
          //   which is how a bar chart is structured.
          <div key={item.label} className="flex-1 flex flex-col items-center justify-end text-center">
            <span 
              className="text-sm font-bold text-copy-primary-light dark:text-copy-primary-dark mb-1 transition-opacity duration-500"
              style={{ opacity: isMounted ? 1 : 0, transitionDelay: `${index * 100 + 300}ms` }}
            >
              {item.value}
            </span>
            <div
              className="w-full rounded-t-md chart-bar transition-all duration-700 ease-out"
              style={{
                height: isMounted ? `${(item.value / maxValue) * 100}%` : '0%',
                backgroundColor: item.color,
                transitionDelay: `${index * 100}ms`
              }}
              title={`${item.label}: ${item.value}`}
              role="progressbar"
              aria-valuenow={item.value}
              aria-valuemin={0}
              aria-valuemax={maxValue}
              aria-label={item.label}
            />
            <span className="text-xs text-copy-secondary-light dark:text-copy-secondary-dark mt-1 h-8 flex items-start justify-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


/**
 * The main Analytics Modal component.
 * Displays key metrics and charts, and handles printing.
 */
const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ reports, onClose, language }) => {
  const { t } = useTranslations(language);

  // Memoize the analytics calculation for performance.
  const analyticsData = useMemo(() => {
    if (reports.length === 0) return null;

    const reportsByType = reports.reduce((acc, report) => {
      if (report.type && ISSUE_TYPE_DETAILS[report.type]) {
        acc[report.type] = (acc[report.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<IssueType, number>);

    const reportsByPriority = reports.reduce((acc, report) => {
      const priority = report.aiPriority || 'Medium'; // Default to medium if not set
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<'Low' | 'Medium' | 'High', number>);

    const resolvedReports = reports.filter(r => r.status === ReportStatus.Resolved && r.resolvedTimestamp);
    let avgResolutionTime = null;
    if (resolvedReports.length > 0) {
      const totalTime = resolvedReports.reduce((sum, r) => sum + (r.resolvedTimestamp! - r.timestamp), 0);
      avgResolutionTime = Math.round(totalTime / resolvedReports.length / 60000); // in minutes
    }

    return { reportsByType, reportsByPriority, avgResolutionTime, total: reports.length };
  }, [reports]);

  // Triggers the browser's native print dialog.
  // The visual formatting is handled by the @media print CSS rules.
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      {/* 'print-area' class is targeted by print styles to format this specific section */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in print-area">
        
        {/* Modal Header: Hidden during printing via the 'no-print' class */}
        <div className="flex justify-between items-center p-4 border-b border-border-light dark:border-border-dark no-print">
          <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{t('analyticsReport')}</h2>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>

        {analyticsData ? (
          <div className="p-6 flex-grow overflow-y-auto">
            <PrintTitle title={t('analyticsReport')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-center">
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg print-card">
                <p className="text-3xl font-bold text-primary">{analyticsData.total}</p>
                <p className="text-sm font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{t('totalReports')}</p>
              </div>
              <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg print-card">
                <p className="text-3xl font-bold text-primary">{analyticsData.avgResolutionTime !== null ? `${analyticsData.avgResolutionTime}` : t('notApplicable')}</p>
                <p className="text-sm font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{t('avgResolutionTime')}{analyticsData.avgResolutionTime !== null ? ` (${t('minutes')})` : ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChart
                title={t('reportsByType')}
                data={(Object.keys(analyticsData.reportsByType) as IssueType[]).map(type => ({
                  label: t(ISSUE_TYPE_DETAILS[type].key),
                  value: analyticsData.reportsByType[type],
                  color: '#8B5CF6' // Tailwind's primary color
                }))}
              />
              <BarChart
                title={t('reportsByPriority')}
                data={(Object.keys(analyticsData.reportsByPriority) as ('Low' | 'Medium' | 'High')[]).map(priority => ({
                  label: t(PRIORITY_DETAILS[priority].key),
                  value: analyticsData.reportsByPriority[priority],
                  color: { Low: '#22C55E', Medium: '#F59E0B', High: '#EF4444' }[priority] // Specific colors for priority
                }))}
              />
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p className="p-8 text-center text-copy-secondary-light dark:text-copy-secondary-dark">{t('noReportsForAnalytics')}</p>
          </div>
        )}
        
        {/* Modal Footer: Hidden during printing via the 'no-print' class */}
        <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-end no-print">
          <button onClick={handlePrint} disabled={!analyticsData} className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50">
            {t('printReport')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;