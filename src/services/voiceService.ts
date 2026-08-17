/**
 * CENTRALIZED VOICE RECOGNITION SERVICE (SINGLETON ENGINE)
 *
 * Provides a robust, thread-safe Speech Recognition Engine across Chrona.
 * Enforces proper lifecycle: IDLE -> STARTING -> LISTENING -> PROCESSING -> FINALIZED -> IDLE
 * Prevents word/sentence duplication by maintaining strict separation between:
 *  - baseInitialText (text in input box before recording started)
 *  - sessionFinalText (new final text recognized during current session)
 *  - sessionInterimText (temporary active speech hypothesis, never permanently appended until final)
 */

export interface VoiceSessionOptions {
  fieldId: string;
  lang?: string; // e.g. 'en-US', 'te-IN', 'hi-IN', 'ta-IN', 'kn-IN', 'ml-IN'
  initialText?: string;
  onTranscriptChange: (finalText: string, interimText: string) => void;
  onStatusChange?: (status: VoiceStatus, errorMessage?: string) => void;
}

export type VoiceStatus = 'idle' | 'starting' | 'listening' | 'paused' | 'processing' | 'done' | 'error';

class VoiceService {
  private recognition: any = null;
  private activeFieldId: string | null = null;
  private activeLang: string = 'en-US';
  private status: VoiceStatus = 'idle';
  
  private baseInitialText: string = '';
  private sessionFinalText: string = '';
  private sessionInterimText: string = '';
  private currentStream: MediaStream | null = null;

  private currentOptions: VoiceSessionOptions | null = null;
  private isExplicitlyStopped: boolean = false;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public getStatus(): VoiceStatus {
    return this.status;
  }

  public getActiveFieldId(): string | null {
    return this.activeFieldId;
  }

  /**
   * Request microphone permission explicitly via MediaDevices API
   */
  public async requestMicrophonePermission(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return true; // Fallback to browser standard prompt
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.currentStream = stream;
      return true;
    } catch (err: any) {
      console.warn('[VoiceService] Microphone permission check failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return false;
      }
      return false;
    }
  }

  /**
   * Release any held microphone media tracks
   */
  private releaseMicrophoneStream(): void {
    if (this.currentStream) {
      try {
        this.currentStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        // Ignore track stop errors
      }
      this.currentStream = null;
    }
  }

  /**
   * Start a new voice recognition session.
   * Ensures exactly ONE active recognition session is running.
   */
  public async startSession(options: VoiceSessionOptions): Promise<boolean> {
    if (!this.isSupported()) {
      this.status = 'error';
      if (options.onStatusChange) {
        options.onStatusChange(
          'error',
          'Voice recognition is not supported in this browser. Please use a supported browser (e.g. Chrome / Edge) or type your message.'
        );
      }
      return false;
    }

    // Stop any existing session cleanly
    this.stopSession(false);

    this.currentOptions = options;
    this.activeFieldId = options.fieldId;
    this.activeLang = options.lang || 'en-US';
    this.baseInitialText = (options.initialText || '').trim();
    this.sessionFinalText = '';
    this.sessionInterimText = '';
    this.isExplicitlyStopped = false;

    this.status = 'starting';
    if (this.currentOptions?.onStatusChange) {
      this.currentOptions.onStatusChange('starting');
    }

    // Verify microphone access
    const hasPermission = await this.requestMicrophonePermission();
    if (!hasPermission) {
      this.status = 'error';
      if (this.currentOptions?.onStatusChange) {
        this.currentOptions.onStatusChange(
          'error',
          'Microphone access is blocked. Please allow microphone access in your browser settings and try again.'
        );
      }
      return false;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = this.activeLang;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        this.status = 'listening';
        if (this.currentOptions?.onStatusChange) {
          this.currentOptions.onStatusChange('listening');
        }
      };

      rec.onresult = (event: any) => {
        let finalTranscriptsArray: string[] = [];
        let currentInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = (result[0]?.transcript || '').trim();

          if (result.isFinal) {
            if (transcript) {
              finalTranscriptsArray.push(transcript);
            }
          } else {
            if (transcript) {
              currentInterim = currentInterim ? `${currentInterim} ${transcript}` : transcript;
            }
          }
        }

        this.sessionFinalText = finalTranscriptsArray.join(' ');
        this.sessionInterimText = currentInterim;

        // Calculate combined output without word duplication
        const fullCommitted = this.baseInitialText
          ? (this.sessionFinalText ? `${this.baseInitialText} ${this.sessionFinalText}` : this.baseInitialText)
          : this.sessionFinalText;

        if (this.currentOptions) {
          this.currentOptions.onTranscriptChange(fullCommitted, this.sessionInterimText);
        }
      };

      rec.onerror = (event: any) => {
        console.warn(`[VoiceService] Recognition error on field "${this.activeFieldId}":`, event.error);
        
        if (event.error === 'no-speech') {
          // Soft notice; don't break session unless closed
          if (this.currentOptions?.onStatusChange) {
            this.currentOptions.onStatusChange('listening', 'No speech detected. Please speak into your microphone.');
          }
          return;
        }

        if (event.error === 'aborted') {
          // User or programmatic stop, don't display error
          return;
        }

        let userMsg = "Voice recognition encountered an issue. Please try again or type your message.";
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          userMsg = "Microphone access is blocked. Please allow microphone access in your browser and try again.";
        } else if (event.error === 'network') {
          userMsg = "Network connection issue during speech recognition. Please check your internet connection.";
        } else if (event.error === 'audio-capture') {
          userMsg = "No microphone found. Please connect an audio input device and try again.";
        } else if (event.error === 'language-not-supported') {
          userMsg = `Selected language (${this.activeLang}) is not supported by the browser speech engine.`;
        }

        this.status = 'error';
        if (this.currentOptions?.onStatusChange) {
          this.currentOptions.onStatusChange('error', userMsg);
        }
      };

      rec.onend = () => {
        this.releaseMicrophoneStream();

        if (this.isExplicitlyStopped || this.status === 'error') {
          this.status = 'idle';
          this.sessionInterimText = '';

          const fullCommitted = this.baseInitialText
            ? (this.sessionFinalText ? `${this.baseInitialText} ${this.sessionFinalText}` : this.baseInitialText)
            : this.sessionFinalText;

          if (this.currentOptions) {
            this.currentOptions.onTranscriptChange(fullCommitted, '');
            if (this.currentOptions.onStatusChange) {
              this.currentOptions.onStatusChange('idle');
            }
          }
          return;
        }

        // Clean natural completion when speech ends
        this.status = 'done';
        this.sessionInterimText = '';

        const fullCommitted = this.baseInitialText
          ? (this.sessionFinalText ? `${this.baseInitialText} ${this.sessionFinalText}` : this.baseInitialText)
          : this.sessionFinalText;

        if (this.currentOptions) {
          this.currentOptions.onTranscriptChange(fullCommitted, '');
          if (this.currentOptions.onStatusChange) {
            this.currentOptions.onStatusChange('done');
          }
        }
      };

      this.recognition = rec;
      rec.start();
      return true;
    } catch (err) {
      console.error('[VoiceService] Failed to initialize SpeechRecognition:', err);
      this.status = 'error';
      this.releaseMicrophoneStream();
      if (this.currentOptions?.onStatusChange) {
        this.currentOptions.onStatusChange('error', 'Voice recognition is unavailable in this browser.');
      }
      return false;
    }
  }

  /**
   * Stop current voice recognition session cleanly and release microphone.
   */
  public stopSession(notifyDone: boolean = true): void {
    this.isExplicitlyStopped = true;

    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch (err) {
        try {
          this.recognition.abort();
        } catch (e) {}
      }
      this.recognition = null;
    }

    this.releaseMicrophoneStream();
    this.status = 'idle';
    this.activeFieldId = null;

    const fullCommitted = this.baseInitialText
      ? (this.sessionFinalText ? `${this.baseInitialText} ${this.sessionFinalText}` : this.baseInitialText)
      : this.sessionFinalText;

    if (notifyDone && this.currentOptions) {
      this.currentOptions.onTranscriptChange(fullCommitted, '');
      if (this.currentOptions.onStatusChange) {
        this.currentOptions.onStatusChange('idle');
      }
    }

    this.currentOptions = null;
  }

  public pauseSession(): void {
    if (this.recognition && this.status === 'listening') {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.status = 'paused';
      if (this.currentOptions?.onStatusChange) {
        this.currentOptions.onStatusChange('paused');
      }
    }
  }

  public resumeSession(): void {
    if (this.currentOptions && this.status === 'paused') {
      this.startSession(this.currentOptions);
    }
  }

  public clearSession(): void {
    this.sessionFinalText = '';
    this.sessionInterimText = '';
    if (this.currentOptions) {
      this.currentOptions.onTranscriptChange('', '');
    }
  }
}

// Singleton Instance
export const voiceService = new VoiceService();

