import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceService, type VoiceStatus } from '../services/voiceService';

export interface UseVoiceRecognitionProps {
  fieldId: string;
  initialValue?: string;
  lang?: string;
  onFinalTranscript?: (finalTranscript: string) => void;
  onInterimTranscript?: (interimTranscript: string) => void;
  onLiveTranscript?: (liveTranscript: string) => void;
}

export function useVoiceRecognition({
  fieldId,
  initialValue = '',
  lang = 'en-US',
  onFinalTranscript,
  onInterimTranscript,
  onLiveTranscript
}: UseVoiceRecognitionProps) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [finalText, setFinalText] = useState<string>(initialValue);
  const [interimText, setInterimText] = useState<string>('');
  const [speechLang, setSpeechLang] = useState<string>(lang);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onFinalCallbackRef = useRef(onFinalTranscript);
  const onInterimCallbackRef = useRef(onInterimTranscript);
  const onLiveCallbackRef = useRef(onLiveTranscript);

  useEffect(() => {
    onFinalCallbackRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    onInterimCallbackRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  useEffect(() => {
    onLiveCallbackRef.current = onLiveTranscript;
  }, [onLiveTranscript]);

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

  const startListening = useCallback(async (): Promise<boolean> => {
    setErrorMessage(null);
    setInterimText('');

    const success = await voiceService.startSession({
      fieldId,
      lang: speechLang,
      initialText: initialValue || finalText,
      onTranscriptChange: (newFinal, newInterim) => {
        setFinalText(newFinal);
        setInterimText(newInterim);

        const liveText = newInterim
          ? (newFinal ? `${newFinal} ${newInterim}` : newInterim)
          : newFinal;

        // Feed live transcript to callbacks
        if (onFinalCallbackRef.current) {
          onFinalCallbackRef.current(liveText);
        }
        if (onLiveCallbackRef.current) {
          onLiveCallbackRef.current(liveText);
        }
        if (onInterimCallbackRef.current) {
          onInterimCallbackRef.current(newInterim);
        }
      },
      onStatusChange: (newStatus, err) => {
        setStatus(newStatus);
        if (err) {
          setErrorMessage(err);
          setTimeout(() => setErrorMessage(null), 7000);
        }
      }
    });

    if (!success) {
      setStatus('error');
      return false;
    }
    return true;
  }, [fieldId, speechLang, finalText, initialValue]);

  const stopListening = useCallback(async () => {
    if (voiceService.getActiveFieldId() === fieldId) {
      await voiceService.stopSession(true);
    }
    setStatus('idle');
    setInterimText('');
  }, [fieldId]);

  const cancelListening = useCallback(async () => {
    if (voiceService.getActiveFieldId() === fieldId) {
      await voiceService.stopSession(false);
    }
    setStatus('idle');
    setInterimText('');
    setFinalText(initialValue);
    if (onFinalCallbackRef.current) {
      onFinalCallbackRef.current(initialValue);
    }
  }, [fieldId, initialValue]);

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
    isProcessing: status === 'processing',
    isPaused: status === 'paused',
    status,
    interimText,
    finalText,
    errorMessage,
    speechLang,
    setSpeechLang,
    startListening,
    stopListening,
    cancelListening,
    togglePause,
    clearTranscript,
    isSupported: voiceService.isSupported()
  };
}
