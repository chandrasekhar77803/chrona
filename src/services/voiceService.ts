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

/**
 * Transcribe recorded audio blob using Gemini Multimodal Audio API
 */
async function transcribeAudioWithGemini(
  audioBlob: Blob,
  targetLang: string = 'en-US'
): Promise<string> {
  const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
  const apiKey = env.VITE_GEMINI_API_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('chrona_gemini_api_key') : '') || '';

  if (!apiKey || !audioBlob || audioBlob.size === 0) {
    return '';
  }

  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);

    const langName = targetLang.startsWith('te')
      ? 'Telugu (తెలుగు)'
      : targetLang.startsWith('hi')
      ? 'Hindi (हिंदी)'
      : targetLang.startsWith('ta')
      ? 'Tamil (தமிழ்)'
      : targetLang.startsWith('kn')
      ? 'Kannada (ಕನ್ನಡ)'
      : targetLang.startsWith('ml')
      ? 'Malayalam (മലയാളം)'
      : targetLang.startsWith('mr')
      ? 'Marathi (मराठी)'
      : targetLang.startsWith('bn')
      ? 'Bengali (বাংলা)'
      : 'English';

    const promptText = `Listen to this user audio recording and transcribe the speech into text accurately in ${langName}.
Return ONLY the verbatim transcribed text. Do NOT add any markdown formatting, prefixes, commentary, quotes, or timestamps. If no speech is heard, return an empty string.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: audioBlob.type || 'audio/webm',
                    data: base64Audio
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      return text;
    }
  } catch (err) {
    console.warn('[VoiceService] Gemini audio transcription fallback warning:', err);
  }
  return '';
}

class VoiceService {
  private recognition: any = null;
  private mediaRecorder: any = null;
  private recordedChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;

  private activeFieldId: string | null = null;
  private activeLang: string = 'en-US';
  private status: VoiceStatus = 'idle';

  private baseInitialText: string = '';
  private sessionFinalText: string = '';
  private sessionInterimText: string = '';

  private currentOptions: VoiceSessionOptions | null = null;
  private useAiFallback: boolean = false;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const hasWebSpeech = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    const hasMediaRecorder = !!(navigator.mediaDevices && typeof MediaRecorder !== 'undefined');
    return hasWebSpeech || hasMediaRecorder;
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
  public async requestMicrophonePermission(): Promise<MediaStream | null> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (err: any) {
      console.warn('[VoiceService] Microphone permission check failed:', err);
      return null;
    }
  }

  /**
   * Release any held microphone media tracks
   */
  private releaseMicrophoneStream(): void {
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        // Ignore track stop errors
      }
      this.mediaStream = null;
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
          'Voice recognition is not supported in this browser. Please use a modern browser (e.g. Chrome, Edge, Firefox) or type your message.'
        );
      }
      return false;
    }

    // Stop any existing session cleanly
    await this.stopSession(false);

    this.currentOptions = options;
    this.activeFieldId = options.fieldId;
    this.activeLang = options.lang || 'en-US';
    this.baseInitialText = (options.initialText || '').trim();
    this.sessionFinalText = '';
    this.sessionInterimText = '';
    this.isExplicitlyStopped = false;
    this.useAiFallback = false;
    this.recordedChunks = [];

    this.status = 'starting';
    if (this.currentOptions?.onStatusChange) {
      this.currentOptions.onStatusChange('starting');
    }

    // Acquire microphone audio stream
    const stream = await this.requestMicrophonePermission();
    if (!stream) {
      this.status = 'error';
      if (this.currentOptions?.onStatusChange) {
        this.currentOptions.onStatusChange(
          'error',
          'Microphone access is blocked. Please click the camera/mic icon in your browser URL bar to allow microphone access and try again.'
        );
      }
      return false;
    }

    this.mediaStream = stream;

    // Start local MediaRecorder as fail-safe backup for network/speech-service blocks
    try {
      if (typeof MediaRecorder !== 'undefined') {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

        recorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };
        recorder.start(250); // Collect in 250ms chunks
        this.mediaRecorder = recorder;
      }
    } catch (recorderErr) {
      console.warn('[VoiceService] MediaRecorder initialization notice:', recorderErr);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
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

          if (finalTranscriptsArray.length > 0) {
            this.sessionFinalText = finalTranscriptsArray.join(' ');
          }
          this.sessionInterimText = currentInterim;

          const fullCommitted = this.baseInitialText
            ? (this.sessionFinalText ? `${this.baseInitialText} ${this.sessionFinalText}` : this.baseInitialText)
            : this.sessionFinalText;

          if (this.currentOptions) {
            this.currentOptions.onTranscriptChange(fullCommitted, this.sessionInterimText);
          }
        };

        rec.onerror = (event: any) => {
          console.warn(`[VoiceService] WebSpeech notice on field "${this.activeFieldId}":`, event.error);

          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }

          // If browser speech engine hits network block (e.g. Google speech server blocked on university/company Wi-Fi)
          if (event.error === 'network') {
            console.log('[VoiceService] Switching to Chrona AI Audio Transcriber for network resilience.');
            this.useAiFallback = true;
            // Keep status listening so user can speak naturally and have it transcribed by Gemini upon stop
            if (this.currentOptions?.onStatusChange) {
              this.currentOptions.onStatusChange('listening');
            }
            return;
          }

          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            this.status = 'error';
            if (this.currentOptions?.onStatusChange) {
              this.currentOptions.onStatusChange('error', 'Microphone access is blocked. Please allow microphone access in your browser settings.');
            }
          }
        };

        rec.onend = () => {
          // Handled in stopSession
        };

        this.recognition = rec;
        rec.start();
        return true;
      } catch (err: any) {
        console.warn('[VoiceService] WebSpeech start error, using AI Audio Transcriber:', err);
        this.useAiFallback = true;
      }
    } else {
      this.useAiFallback = true;
    }

    this.status = 'listening';
    if (this.currentOptions?.onStatusChange) {
      this.currentOptions.onStatusChange('listening');
    }
    return true;
  }

  /**
   * Stop active session cleanly and finalize transcript (with Gemini AI Transcriber if needed)
   */
  public async stopSession(finalize: boolean = true): Promise<void> {
    this.isExplicitlyStopped = true;

    // Stop WebSpeech Recognition
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch (e) {
        // Ignore stop error
      }
      this.recognition = null;
    }

    // Stop MediaRecorder
    let audioBlob: Blob | null = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        await new Promise<void>((resolve) => {
          if (!this.mediaRecorder) return resolve();
          this.mediaRecorder.onstop = () => resolve();
          this.mediaRecorder.stop();
        });
      } catch (e) {
        // Ignore recorder stop error
      }

      if (this.recordedChunks.length > 0) {
        audioBlob = new Blob(this.recordedChunks, { type: this.recordedChunks[0]?.type || 'audio/webm' });
      }
    }
    this.mediaRecorder = null;
    this.releaseMicrophoneStream();

    if (!finalize) {
      this.status = 'idle';
      this.sessionInterimText = '';
      if (this.currentOptions?.onStatusChange) {
        this.currentOptions.onStatusChange('idle');
      }
      return;
    }

    // If WebSpeech did not produce final text or AI fallback was engaged, transcribe with Gemini AI
    if ((!this.sessionFinalText || this.useAiFallback) && audioBlob && audioBlob.size > 500) {
      this.status = 'processing';
      if (this.currentOptions?.onStatusChange) {
        this.currentOptions.onStatusChange('processing');
      }

      const aiTranscript = await transcribeAudioWithGemini(audioBlob, this.activeLang);
      if (aiTranscript) {
        this.sessionFinalText = aiTranscript;
      }
    }

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
    this.recordedChunks = [];
    if (this.currentOptions) {
      this.currentOptions.onTranscriptChange('', '');
    }
  }

  /**
   * Reset engine completely
   */
  public reset(): void {
    this.stopSession(false);
    this.activeFieldId = null;
    this.currentOptions = null;
    this.baseInitialText = '';
    this.sessionFinalText = '';
    this.sessionInterimText = '';
    this.recordedChunks = [];
    this.status = 'idle';
  }
}

// Global Singleton Instance
export const voiceService = new VoiceService();


