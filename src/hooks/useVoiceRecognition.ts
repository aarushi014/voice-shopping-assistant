import { useState, useEffect, useRef, useCallback } from 'react';
import type { SupportedLanguage } from '../services/i18n/commandKeywords';


type SpeechRecognition = any;
type SpeechRecognitionEvent = any;
type SpeechRecognitionErrorEvent = any;


export interface UseVoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: SupportedLanguage;
}

export interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: (overrideLang?: SupportedLanguage) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const { continuous = false, interimResults = true, lang = 'en-US' } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check browser support
  const isSupported = typeof window !== 'undefined' && !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );

  useEffect(() => {
    if (!isSupported) {
      setError("Browser doesn't support SpeechRecognition. Please use text input fallback below.");
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition: SpeechRecognition = new SpeechRecognitionClass();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalStr += result[0].transcript;
        } else {
          interimStr += result[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript((prev) => (prev ? `${prev} ${finalStr}` : finalStr));
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('[WebSpeech API Error]:', event.error);
      setIsListening(false);

      switch (event.error) {
        case 'not-allowed':
          setError(
            'Microphone permission denied. Enable mic access in browser settings or use the text fallback.'
          );
          break;
        case 'no-speech':
          setError('No speech detected. Tap mic to try speaking again.');
          break;
        case 'audio-capture':
          setError('Microphone hardware not detected. Check mic connection.');
          break;
        case 'network':
          setError('Speech recognition network error. Please check your connection.');
          break;
        case 'aborted':
          // Aborted intentionally by user
          break;
        default:
          setError(`Speech recognition error: ${event.error}. Use text fallback below.`);
          break;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Cleanup ignore
        }
      }
    };
  }, [isSupported, continuous, interimResults, lang]);

  const startListening = useCallback(
    (overrideLang?: SupportedLanguage) => {
      if (!isSupported || !recognitionRef.current) {
        setError("Browser doesn't support SpeechRecognition. Use text fallback.");
        return;
      }

      try {
        setError(null);
        setInterimTranscript('');
        if (overrideLang) {
          recognitionRef.current.lang = overrideLang;
        }
        recognitionRef.current.start();
      } catch (err: any) {
        // Recognition already started
        console.warn('SpeechRecognition start notice:', err.message);
      }
    },
    [isSupported]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
