import React, { useState, useRef, useCallback } from 'react';
import { useTranslations } from '../hooks/useTranslations';

interface VoiceRecorderProps {
  onRecordingComplete: (audioDataUrl: string) => void;
  language: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, language }) => {
  const { t } = useTranslations(language);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioURL(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener("dataavailable", event => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setAudioURL(base64String);
          onRecordingComplete(base64String);
        };
        stream.getTracks().forEach(track => track.stop()); // Release microphone
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(t('micPermissionDenied'));
    }
  }, [onRecordingComplete, t]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return (
    <div className="my-4 p-4 border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-gray-800">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">{t('recordVoice')}</p>
      <div className="flex items-center justify-between">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v1h6v-1h-2v-2.07z" clipRule="evenodd"></path></svg>
            {t('startRecording')}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg animate-pulse"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5z"></path></svg>
            {t('stopRecording')}
          </button>
        )}
        {isRecording && <p className="text-red-400 font-semibold">{t('recording')}</p>}
      </div>
      {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      {audioURL && (
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">{t('playRecording')}</p>
          <audio src={audioURL} controls className="w-full"></audio>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;