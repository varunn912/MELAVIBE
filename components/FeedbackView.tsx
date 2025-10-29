import React, { useMemo } from 'react';
import { SurveySubmission } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import EmptyState from './EmptyState';

// A simple star icon for rating display
const StarIcon: React.FC<{ className?: string, filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const FeedbackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);


interface FeedbackViewProps {
  submissions: SurveySubmission[];
  language: string;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ submissions, language }) => {
  const { t } = useTranslations(language);

  const stats = useMemo(() => {
    if (submissions.length === 0) {
      return {
        averageRating: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
        comments: [],
      };
    }

    const totalRating = submissions.reduce((sum, s) => sum + s.rating, 0);
    const averageRating = totalRating / submissions.length;

    const ratingDistribution = submissions.reduce((dist, s) => {
      dist[s.rating - 1]++;
      return dist;
    }, [0, 0, 0, 0, 0]);

    const comments = submissions
        .filter(s => s.feedback && s.feedback.trim() !== "")
        .sort((a, b) => b.timestamp - a.timestamp);

    return { averageRating, ratingDistribution, comments };
  }, [submissions]);

  if (submissions.length === 0) {
    return <EmptyState Icon={FeedbackIcon} title={t('noFeedbackYetTitle')} message={t('noFeedbackYetMessage')} />;
  }

  const maxRatingCount = Math.max(...stats.ratingDistribution, 1);

  return (
    <div className="animate-fade-in space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating Card */}
            <div className="md:col-span-1 bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-bold text-copy-primary-light dark:text-copy-primary-dark mb-2">{t('averageRating')}</h3>
                <p className="text-6xl font-extrabold text-primary">{stats.averageRating.toFixed(2)}</p>
                <p className="text-copy-secondary-light dark:text-copy-secondary-dark font-semibold">{t('outOfFive')}</p>
                 <div className="flex mt-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <StarIcon key={i} className="w-6 h-6" filled={i <= stats.averageRating} />
                    ))}
                </div>
            </div>
            
            {/* Rating Distribution Chart */}
            <div className="md:col-span-2 bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark">
                <h3 className="text-lg font-bold text-copy-primary-light dark:text-copy-primary-dark mb-4">{t('ratingDistribution')}</h3>
                <div className="flex h-48 gap-4 justify-around">
                    {stats.ratingDistribution.map((count, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end text-center">
                            <span className="text-sm font-bold text-copy-primary-light dark:text-copy-primary-dark mb-1">{count}</span>
                            <div
                                className="w-full bg-primary/20 dark:bg-primary/30 rounded-t-md transition-all duration-700 ease-out"
                                style={{ height: `${(count / maxRatingCount) * 100}%` }}
                                title={`${index + 1} Star: ${count}`}
                            />
                            <div className="flex items-center text-xs text-copy-secondary-light dark:text-copy-secondary-dark mt-1">
                                <span>{index + 1}</span>
                                <StarIcon className="w-3 h-3 ml-0.5" filled={true} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Feedback Comments List */}
        {stats.comments.length > 0 && (
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark">
                 <h3 className="text-lg font-bold text-copy-primary-light dark:text-copy-primary-dark mb-4">{t('feedbackComments')}</h3>
                 <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {stats.comments.map(comment => (
                        <div key={comment.timestamp} className="p-4 bg-background-light dark:bg-background-dark border-l-4 border-primary/50 rounded">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <StarIcon key={i} className="w-5 h-5" filled={i <= comment.rating} />
                                    ))}
                                </div>
                                <span className="text-xs text-copy-secondary-light dark:text-copy-secondary-dark">{new Date(comment.timestamp).toLocaleString(language)}</span>
                            </div>
                            <p className="text-copy-primary-light dark:text-copy-primary-dark whitespace-pre-wrap">{comment.feedback}</p>
                        </div>
                    ))}
                 </div>
            </div>
        )}
    </div>
  );
};

export default FeedbackView;
