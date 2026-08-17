import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceService, type VoiceStatus } from '../services/voiceService';

export interface UseVoiceRecognitionProps {
  fieldId: string;
  initialValue?: string;
  lang?: string;
  onFinalTranscript?: (finalTranscript: string) => void;
  onInterimTranscript?: (interimTranscript: string) => void;
}

export function useVoiceRecognition({
  fieldId,
  initialValue = '',
  lang = 'en-US',
  onFinalTranscript,
  onInterimTranscript
}: UseVoiceRecognitionProps) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [finalText, setFinalText] = useState<string>(initialValue);
  const [interimText, setInterimText] = useState<string>('');
  const [speechLang, setSpeechLang] = useState<string>(lang);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onFinalCallbackRef = useRef(onFinalTranscript);
  const onInterimCallbackRef = useRef(onInterimTranscript);

  useEffect(() => {
    onFinalCallbackRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    onInterimCallbackRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  useEffect(() => {
    setSpeechLang(lang);
  }, [lang]);

  // Keep finalText in sync with external initialValue when idle
  useEffect(() => {
    if (status === 'idle') {
      setFinalText(initialValue);
    }
  }, [initialValue, status]);

  // Cleanup on unmount or fieldId change
  useEffect(() => {
    return () => {
      if (voiceService.getActiveFieldId() === fieldId) {
        voiceService.stopSession(false);
      }
    };
  }, [fieldId]);

  const startListening = useCallback(async () => {
    setErrorMessage(null);
    setInterimText('');

    const success = await voiceService.startSession({
      fieldId,
      lang: speechLang,
      initialText: finalText,
      onTranscriptChange: (newFinal, newInterim) => {
        setFinalText(newFinal);
        setInterimText(newInterim);

        // Notify final committed text strictly without polluting with temporary interim
        if (newFinal && onFinalCallbackRef.current) {
          onFinalCallbackRef.current(newFinal);
        }
        if (onInterimCallbackRef.current) {
          onInterimCallbackRef.current(newInterim);
        }
      },
      onStatusChange: (newStatus, err) => {
        setStatus(newStatus);
        if (err) {
          setErrorMessage(err);
          setTimeout(() => setErrorMessage(null), 6000);
        }
      }
    });

    if (!success) {
      setStatus('error');
    }
  }, [fieldId, speechLang, finalText]);

  const stopListening = useCallback(() => {
    if (voiceService.getActiveFieldId() === fieldId) {
      voiceService.stopSession(true);
    }
    setStatus('idle');
    setInterimText('');
  }, [fieldId]);

  const togglePause = useCallback(() => {
    if (status === 'listening') {
      voiceService.pauseSession();
    } else if (status === 'paused') {
      voiceService.resumeSession();
    }
  }, [status]);

  const clearTranscript = useCallback(() => {
    setFinalText('');
    setInterimText('');
    if (voiceService.getActiveFieldId() === fieldId) {
      voiceService.clearSession();
    }
    if (onFinalCallbackRef.current) {
      onFinalCallbackRef.current('');
    }
  }, [fieldId]);

  return {
    isListening: status === 'listening' || status === 'starting',
    isStarting: status === 'starting',
    isPaused: status === 'paused',
    status,
    interimText,
    finalText,
    errorMessage,
    speechLang,
    setSpeechLang,
    startListening,
    stopListening,
    togglePause,
    clearTranscript,
    isSupported: voiceService.isSupported()
  };
}

