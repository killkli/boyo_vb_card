import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeText } from '../utils/textNormalization';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onMatch?: () => void;
  targetWord?: string;
  language?: string;
}

export function useSpeechRecognition({
  onResult,
  onMatch,
  targetWord = '',
  language = 'en-US',
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript.trim();

        setTranscript(transcriptText);
        onResult?.(transcriptText);

        // Check if transcript matches target word using normalized comparison
        if (targetWord) {
          const normalizedTranscript = normalizeText(transcriptText);
          const normalizedTarget = normalizeText(targetWord);

          if (normalizedTranscript === normalizedTarget) {
            // Stop listening first to prevent multiple triggers
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
            setIsListening(false);
            onMatch?.();
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, targetWord, onResult, onMatch]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
  };
}
