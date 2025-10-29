import { useState, useEffect, useCallback, useRef } from 'react';

// This is a placeholder implementation. The actual SpeechRecognition API can be complex
// and requires careful handling of browser compatibility and permissions.

// FIX: Add type definitions for the Web Speech API to resolve 'SpeechRecognition' not found errors.
// These interfaces describe the shape of the browser's SpeechRecognition API.
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  [key: number]: SpeechRecognitionAlternative;
  length: number;
}
interface SpeechRecognitionResultList {
  [key: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}
interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
    interface Window {
      SpeechRecognition: SpeechRecognitionStatic;
      webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

interface SpeechRecognitionHook {
  text: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
}

const useSpeechRecognition = (language = 'en-US'): SpeechRecognitionHook => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Using a ref to hold the recognition instance
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window))) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setText(finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
    }

    recognitionRef.current = recognition;
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition could not start.", err);
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    text,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!recognitionRef.current,
  };
};

export default useSpeechRecognition;