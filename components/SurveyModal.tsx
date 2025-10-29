import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { SurveySubmission } from '../types';

interface SurveyModalProps {
  onClose: () => void;
  onSubmit: (submission: SurveySubmission) => void;
  language: string;
}

const SurveyModal: React.FC<SurveyModalProps> = ({ onClose, onSubmit, language }) => {
  const { t } = useTranslations(language);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit({ rating, feedback, timestamp: Date.now() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
        <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark mb-2 text-center">Feedback</h2>
        <p className="text-center text-copy-secondary-light dark:text-copy-secondary-dark mb-6">How was your experience reporting the issue?</p>

        <div className="flex justify-center items-center mb-6 space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-4xl transition-transform transform hover:scale-125"
            >
              <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
            </button>
          ))}
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="w-full p-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Any additional feedback? (Optional)"
        />

        <div className="flex justify-center gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-copy-secondary-light dark:text-copy-primary-dark">
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:outline-none focus:ring-primary/50 disabled:opacity-50"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyModal;