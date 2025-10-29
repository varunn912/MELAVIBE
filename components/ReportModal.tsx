import React, { useState } from 'react';
import { IssueType, Report, ReportStatus } from '../types';
import { ISSUE_TYPE_DETAILS, PRIORITY_DETAILS, TeamIcon, SummaryIcon } from '../constants';
import VoiceRecorder from './VoiceRecorder';
import { useTranslations } from '../hooks/useTranslations';
import { getAIAssessment } from '../services/ai';

interface ReportModalProps {
  issueType: IssueType;
  onClose: () => void;
  onSubmit: (report: Report) => void;
  language: string;
  userId: string;
  isOnline: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ issueType, onClose, onSubmit, language, userId, isOnline }) => {
  const { t } = useTranslations(language);
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [description, setDescription] = useState('');
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined);
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | undefined>(undefined);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'capturing' | 'captured' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<{ summary: string; priority: 'Low' | 'Medium' | 'High'; suggestedTeam: 'Medical' | 'Security' | 'Sanitation' | 'Facilities' | 'General' } | null>(null);


  const issueDetails = ISSUE_TYPE_DETAILS[issueType];
  const Icon = issueDetails.icon;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('capturing');
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('captured');
      },
      (error) => {
        setLocationStatus('error');
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable it in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("The request to get user location timed out.");
            break;
          default:
            setLocationError("An unknown error occurred while capturing location.");
            break;
        }
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds for a more accurate read
        maximumAge: 0, // Force a fresh location, don't use cache
      }
    );
  };
  
  const handleGoToPreview = async () => {
    if (!description.trim() && !audioDataUrl && !imageDataUrl) {
      alert('Please provide a description, voice note, or photo.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const assessment = await getAIAssessment(description);
      setAiAssessment(assessment);
    } catch (error) {
      console.error("AI pre-analysis failed:", error);
      setAiAssessment({
        summary: "AI analysis could not be completed.",
        priority: 'Medium',
        suggestedTeam: 'General',
      });
    } finally {
      setIsAnalyzing(false);
      setView('preview');
    }
  };
  
  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    // Base report object with all required fields
    const baseReport = {
      id: `rep_${new Date().getTime()}`,
      type: issueType,
      description,
      timestamp: Date.now(),
      status: ReportStatus.New,
      userId: isAnonymous ? `anon_${Date.now()}` : userId,
      isAnonymous,
      aiPriority: aiAssessment?.priority || 'Medium',
    };

    // Firebase cannot store `undefined` values.
    // Conditionally add optional fields to avoid this error.
    const newReport: Report = {
      ...baseReport,
      ...(audioDataUrl && { audioDataUrl }),
      ...(imageDataUrl && { imageDataUrl }),
      ...(location && { location }),
      ...(aiAssessment?.summary && { aiSummary: aiAssessment.summary }),
      ...(aiAssessment?.suggestedTeam && { aiSuggestedTeam: aiAssessment.suggestedTeam }),
    };
    
    onSubmit(newReport);
  };
  
  const renderForm = () => (
    <>
      <div className="mb-4">
        <label htmlFor="description" className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('description')}</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full p-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Provide details..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="photo" className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('addPhoto')}</label>
            <input type="file" accept="image/*" id="photo" onChange={handleFileChange} className="block w-full text-sm text-copy-secondary-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
          </div>
          <div>
              <label className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('captureLocation')}</label>
              <button type="button" onClick={handleCaptureLocation} disabled={locationStatus === 'capturing' || locationStatus === 'captured'} className="w-full flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-lg transition-colors bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                 {locationStatus === 'capturing' ? 'Capturing...' : locationStatus === 'captured' ? t('locationCaptured') : t('captureLocation')}
              </button>
              {locationError && <p className="text-red-500 text-xs mt-1">{locationError}</p>}
          </div>
      </div>

      {imageDataUrl && (
        <div className="mb-4">
           <p className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('photoPreview')}</p>
           <img src={imageDataUrl} alt="Preview" className="w-full rounded-lg max-h-48 object-cover" />
        </div>
      )}

      <VoiceRecorder onRecordingComplete={setAudioDataUrl} language={language} />

      <div className="mt-2 p-3 bg-background-light dark:bg-background-dark rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)} 
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary-dark dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
            />
            <span className="text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('anonymousReport')}</span>
        </label>
        <p className="text-xs text-copy-secondary-light dark:text-copy-secondary-dark mt-1 pl-6">{t('anonymousReportNote')}</p>
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-copy-secondary-light dark:text-copy-primary-dark bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20">
          {t('cancel')}
        </button>
        <button 
          type="button" 
          onClick={handleGoToPreview} 
          disabled={!isOnline || isAnalyzing}
          title={!isOnline ? "You must be online to submit a report" : ""}
          className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:outline-none focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[130px]"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Analyzing...</span>
            </>
          ) : (
            t('reviewReport')
          )}
        </button>
      </div>
    </>
  );

  const PriorityPill: React.FC<{ priority: 'Low' | 'Medium' | 'High' }> = ({ priority }) => {
    const details = PRIORITY_DETAILS[priority];
    return (
      <span className={`px-2 py-1 text-xs font-bold rounded-full ${details.color} text-white`}>
        {t(details.key)}
      </span>
    );
  };
  
  const renderPreview = () => (
    <>
      <div className="space-y-4">
        {imageDataUrl && (
            <div>
              <h3 className="text-sm font-semibold text-copy-secondary-light dark:text-copy-secondary-dark mb-2">{t('yourPhoto')}</h3>
              <img src={imageDataUrl} alt="Preview" className="w-full rounded-lg max-h-48 object-cover" />
            </div>
        )}
        {description && (
            <div>
              <h3 className="text-sm font-semibold text-copy-secondary-light dark:text-copy-secondary-dark mb-1">{t('yourDescription')}</h3>
              <p className="p-3 bg-background-light dark:bg-background-dark rounded-md text-copy-primary-light dark:text-copy-primary-dark text-sm whitespace-pre-wrap">{description}</p>
            </div>
        )}
        {audioDataUrl && (
             <div>
               <h3 className="text-sm font-semibold text-copy-secondary-light dark:text-copy-secondary-dark mb-1">{t('yourVoiceNote')}</h3>
               <audio src={audioDataUrl} controls className="w-full"></audio>
             </div>
        )}
        {location && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/50 rounded-md">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">{t('capturedLocation')}</span>
            </div>
        )}
      </div>

       {aiAssessment && (
        <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
            <h3 className="text-sm font-semibold text-copy-secondary-light dark:text-copy-secondary-dark mb-3">AI Triage Preview</h3>
            <div className="p-3 bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark rounded-lg space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{t('aiPriority')}:</p>
                        <PriorityPill priority={aiAssessment.priority} />
                    </div>
                    <div className="flex items-center gap-1.5 text-copy-secondary-light dark:text-copy-secondary-dark" title={t('aiSuggestedTeam')}>
                        <TeamIcon className="w-4 h-4" />
                        <span className="font-semibold">{t(`team_${aiAssessment.suggestedTeam}`)}</span>
                    </div>
                </div>
                 <div className="flex items-start gap-1.5 text-sm text-copy-secondary-light dark:text-copy-secondary-dark pt-2 border-t border-border-light dark:border-border-dark">
                    <SummaryIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p><span className="font-semibold">{t('aiSummary')}:</span> {aiAssessment.summary}</p>
                 </div>
            </div>
        </div>
      )}

       <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-light dark:border-border-dark">
            <button type="button" onClick={() => setView('form')} className="px-5 py-2.5 text-sm font-medium text-copy-secondary-light dark:text-copy-primary-dark bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20">
              {t('goBackEdit')}
            </button>
            <button 
              type="button" 
              onClick={handleConfirmSubmit} 
              disabled={isSubmitting || !isOnline}
              title={!isOnline ? "You must be online to submit a report" : ""}
              className="px-5 py-2.5 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary-dark focus:ring-4 focus:outline-none focus:ring-secondary/50 disabled:opacity-50 disabled:cursor-wait"
            >
              {isSubmitting ? 'Submitting...' : t('confirmSubmit')}
            </button>
       </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto animate-scale-in">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{view === 'form' ? t(issueDetails.key) : t('reportPreviewTitle')}</h2>
          </div>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>
        {view === 'form' ? renderForm() : renderPreview()}
      </div>
    </div>
  );
};

export default ReportModal;