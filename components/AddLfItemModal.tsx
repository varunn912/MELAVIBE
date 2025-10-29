import React, { useState } from 'react';
import { LostAndFoundItem, LfStatus } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import VoiceRecorder from './VoiceRecorder';

interface AddLfItemModalProps {
  mode: LfStatus;
  onClose: () => void;
  onSubmit: (item: LostAndFoundItem) => void;
  language: string;
  userId: string;
}

const AddLfItemModal: React.FC<AddLfItemModalProps> = ({ mode, onClose, onSubmit, language, userId }) => {
  const { t } = useTranslations(language);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | undefined>(undefined);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'capturing' | 'captured' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = () => {
    setError(null);
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    if (mode === LfStatus.Found && !imageDataUrl) {
      setError('A photo is required for found items.');
      return;
    }

    const newItem: LostAndFoundItem = {
      id: `lf_${new Date().getTime()}`,
      status: mode,
      category,
      description,
      timestamp: Date.now(),
      userId,
      isResolved: false,
      ...(imageDataUrl && { imageDataUrl }),
      ...(location && { location }),
      ...(audioDataUrl && { audioDataUrl }),
    };
    onSubmit(newItem);
  };

  const title = mode === LfStatus.Found ? t('iFoundSomething') : t('iLostSomething');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto animate-scale-in">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-2xl font-bold text-copy-primary-light dark:text-copy-primary-dark">{title}</h2>
          <button onClick={onClose} className="text-copy-secondary-light dark:text-copy-secondary-dark hover:text-copy-primary-light dark:hover:text-copy-primary-dark text-3xl font-light">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('itemCategory')}</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark rounded-lg focus:ring-primary focus:border-primary"
            >
              <option value="">{t('selectCategory')}</option>
              <option value="Phone">{t('category_Phone')}</option>
              <option value="Wallet / Cards">{t('category_Wallet')}</option>
              <option value="Keys">{t('category_Keys')}</option>
              <option value="Bag / Backpack">{t('category_Bag')}</option>
              <option value="Clothing">{t('category_Clothing')}</option>
              <option value="Other">{t('category_Other')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('itemDescription')}</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-copy-primary-light dark:text-copy-primary-dark rounded-lg focus:ring-primary focus:border-primary"
              placeholder="e.g., Black iPhone 13 with a cracked screen"
            />
          </div>
          
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="photo" className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('addAPhoto')}</label>
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
            <div>
              <p className="block mb-2 text-sm font-medium text-copy-secondary-light dark:text-copy-secondary-dark">{t('photoPreview')}</p>
              <img src={imageDataUrl} alt="Preview" className="w-full rounded-lg max-h-48 object-cover" />
            </div>
          )}

          <VoiceRecorder onRecordingComplete={setAudioDataUrl} language={language} />
        </div>

        {error && <p className="text-red-500 text-sm mt-4 text-center bg-red-500/10 p-3 rounded-lg">{error}</p>}

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-light dark:border-border-dark">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-copy-secondary-light dark:text-copy-primary-dark bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20">
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:outline-none focus:ring-primary/50"
          >
            {t('submitItem')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLfItemModal;