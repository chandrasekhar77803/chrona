/**
 * CENTRALIZED VOICE RECOGNITION SERVICE (SINGLETON ENGINE)
 *
 * Provides a robust, thread-safe Speech Recognition Engine across Chrona.
 * Enforces strict lifecycle: IDLE -> STARTING -> LISTENING -> PROCESSING -> IDLE
 * Solves:
 * 1. Word/sentence duplication via chunk deduplication & index tracking
 * 2. Natural pauses & continuous speech via auto-restart without losing previous text
 * 3. Safe fallback with Gemini Multimodal Audio Transcriber for university/network firewalls
 * 4. Distinct Stop vs Cancel semantics
 */

export interface VoiceSessionOptions {
  fieldId: string;
  lang?: string; // e.g. 'en-US', 'te-IN', 'hi-IN', 'ta-IN', 'kn-IN', 'ml-IN', etc.
  initialText?: string;
  onTranscriptChange: (finalText: string, interimText: string) => void;
  onStatusChange?: (status: VoiceStatus, errorMessage?: string) => void;
}

export type VoiceStatus = 'idle' | 'starting' | 'listening' | 'paused' | 'processing' | 'error';

/**
 * Cleanly deduplicate overlapping words or phrases between consecutive speech chunks
 */
export function deduplicatePhrases(chunks: string[]): string[] {
  const result: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = (chunks[i] || '').trim();
    if (!chunk) continue;

    if (result.length === 0) {
      result.push(chunk);
      continue;
    }

    const prevChunk = result[result.length - 1];

    // If exact duplicate of preceding chunk, skip
    if (chunk.toLowerCase() === prevChunk.toLowerCase()) {
      continue;
    }

    // If the chunk is fully contained at the end of prevChunk, skip
    if (prevChunk.toLowerCase().endsWith(chunk.toLowerCase())) {
      continue;
    }

    // If prevChunk is fully contained at the beginning of chunk, replace prevChunk
    if (chunk.toLowerCase().startsWith(prevChunk.toLowerCase())) {
      result[result.length - 1] = chunk;
      continue;
    }

    // Word-level suffix/prefix overlap removal
    const prevWords = prevChunk.split(/\s+/);
    const currWords = chunk.split(/\s+/);

    let overlapSize = 0;
    const maxOverlap = Math.min(prevWords.length, currWords.length);

    for (let k = maxOverlap; k > 0; k--) {
      const prevSuffix = prevWords.slice(-k).join(' ').toLowerCase();
      const currPrefix = currWords.slice(0, k).join(' ').toLowerCase();
      if (prevSuffix === currPrefix) {
        overlapSize = k;
        break;
      }
    }

    if (overlapSize > 0) {
      const remainingWords = currWords.slice(overlapSize);
      if (remainingWords.length > 0) {
        result.push(remainingWords.join(' '));
      }
    } else {
      result.push(chunk);
    }
  }

  return result;
}

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
      : targetLang.startsWith('gu')
      ? 'Gujarati (ગુજરાતી)'
      : targetLang.startsWith('pa')
      ? 'Punjabi (ਪੰਜਾਬੀ)'
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
    console.warn('[VoiceService] Gemini audio transcription notice:', err);
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
  private accumulatedFinalChunks: string[] = [];
  private currentSessionFinals: string[] = [];
  private sessionInterimText: string = '';

  private currentOptions: VoiceSessionOptions | null = null;
  private useAiFallback: boolean = false;
  private isExplicitlyStopped: boolean = true;
  private restartTimeout: any = null;

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
      console.warn('[VoiceService] Microphone permission check notice:', err);
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
   * Emit updated live text to current subscriber
   */
  private emitTranscriptUpdate(): void {
    if (!this.currentOptions) return;

    const allFinals = deduplicatePhrases([...this.accumulatedFinalChunks, ...this.currentSessionFinals]);
    const finalJoined = allFinals.join(' ').trim();

    let fullCommitted = '';
    if (this.baseInitialText && finalJoined) {
      // Avoid duplicate prefix if finalJoined already starts with baseInitialText
      if (finalJoined.toLowerCase().startsWith(this.baseInitialText.toLowerCase())) {
        fullCommitted = finalJoined;
      } else {
        fullCommitted = `${this.baseInitialText} ${finalJoined}`;
      }
    } else {
      fullCommitted = finalJoined || this.baseInitialText;
    }

    this.currentOptions.onTranscriptChange(fullCommitted, this.sessionInterimText);
  }

  /**
   * Start or restart the underlying WebSpeech SpeechRecognition instance
   */
  private startRecognitionEngine(): boolean {
    if (this.isExplicitlyStopped) return false;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.useAiFallback = true;
      return false;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.onstart = null;
          this.recognition.onresult = null;
          this.recognition.onerror = null;
          this.recognition.onend = null;
          this.recognition.stop();
        } catch (e) {}
        this.recognition = null;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = this.activeLang;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        if (!this.isExplicitlyStopped) {
          this.status = 'listening';
          if (this.currentOptions?.onStatusChange) {
            this.currentOptions.onStatusChange('listening');
          }
        }
      };

      rec.onresult = (event: any) => {
        const finals: string[] = [];
        let interim = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = (result[0]?.transcript || '').trim();

          if (result.isFinal) {
            if (transcript) {
              finals.push(transcript);
            }
          } else {
            if (transcript) {
              interim = interim ? `${interim} ${transcript}` : transcript;
            }
          }
        }

        this.currentSessionFinals = finals;
        this.sessionInterimText = interim;
        this.emitTranscriptUpdate();
      };

      rec.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        if (event.error === 'network') {
          // If browser speech engine hits network block (e.g. university / firewall), fallback to Gemini AI Transcriber
          this.useAiFallback = true;
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          this.status = 'error';
          this.isExplicitlyStopped = true;
          if (this.currentOptions?.onStatusChange) {
            this.currentOptions.onStatusChange(
              'error',
              'Microphone access is required for voice input. Please allow microphone access in your browser settings.'
            );
          }
        }
      };

      rec.onend = () => {
        // Commit current recognition cycle results into accumulated finals
        if (this.currentSessionFinals.length > 0) {
          this.accumulatedFinalChunks.push(...this.currentSessionFinals);
          this.currentSessionFinals = [];
        }
        this.sessionInterimText = '';

        // If user is still actively listening, gracefully auto-restart for continuous speech & pauses
        if (!this.isExplicitlyStopped && this.status === 'listening') {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (!this.isExplicitlyStopped && this.status === 'listening') {
              this.startRecognitionEngine();
            }
          }, 150);
        }
      };

      this.recognition = rec;
      rec.start();
      return true;
    } catch (err: any) {
      console.warn('[VoiceService] SpeechRecognition start notice:', err);
      this.useAiFallback = true;
      return false;
    }
  }

  /**
   * Start a new voice recognition session.
   * Ensures exactly ONE active recognition session is running at a time.
   */
  public async startSession(options: VoiceSessionOptions): Promise<boolean> {
    if (!this.isSupported()) {
      this.status = 'error';
      if (options.onStatusChange) {
        options.onStatusChange(
          'error',
          'Voice recognition is not supported in this browser. Please use a supported browser (e.g. Chrome, Edge) or type your message.'
        );
      }
      return false;
    }

    // Cancel any previous running session cleanly
    await this.stopSession(false);

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    this.currentOptions = options;
    this.activeFieldId = options.fieldId;
    this.activeLang = options.lang || 'en-US';
    this.baseInitialText = (options.initialText || '').trim();
    this.accumulatedFinalChunks = [];
    this.currentSessionFinals = [];
    this.sessionInterimText = '';
    this.useAiFallback = false;
    this.recordedChunks = [];
    this.isExplicitlyStopped = false;

    this.status = 'starting';
    if (this.currentOptions?.onStatusChange) {
      this.currentOptions.onStatusChange('starting');
    }

    // Acquire microphone audio stream
    const stream = await this.requestMicrophonePermission();
    if (!stream) {
      this.status = 'error';
      this.isExplicitlyStopped = true;
      if (this.currentOptions?.onStatusChange) {
        this.currentOptions.onStatusChange(
          'error',
          'Microphone access is required for voice input. Please allow microphone access in your browser settings.'
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
        recorder.start(250);
        this.mediaRecorder = recorder;
      }
    } catch (recorderErr) {
      console.warn('[VoiceService] MediaRecorder initialization notice:', recorderErr);
    }

    this.startRecognitionEngine();

    this.status = 'listening';
    if (this.currentOptions?.onStatusChange) {
      this.currentOptions.onStatusChange('listening');
    }
    return true;
  }

  /**
   * Stop active session cleanly and finalize transcript.
   * If finalize === true: commits final speech text.
   * If finalize === false: cancels and discards current speech session.
   */
  public async stopSession(finalize: boolean = true): Promise<void> {
    this.isExplicitlyStopped = true;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    // Stop WebSpeech Recognition
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch (e) {}
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
      } catch (e) {}

      if (this.recordedChunks.length > 0) {
        audioBlob = new Blob(this.recordedChunks, { type: this.recordedChunks[0]?.type || 'audio/webm' });
      }
    }
    this.mediaRecorder = null;
    this.releaseMicrophoneStream();

    if (!finalize) {
      // CANCEL: Discard current session recordings, restore base initial text
      this.status = 'idle';
      this.accumulatedFinalChunks = [];
      this.currentSessionFinals = [];
      this.sessionInterimText = '';
      this.recordedChunks = [];
      if (this.currentOptions) {
        this.currentOptions.onTranscriptChange(this.baseInitialText, '');
        if (this.currentOptions.onStatusChange) {
          this.currentOptions.onStatusChange('idle');
        }
      }
      return;
    }

    // Finalize speech
    if (this.currentSessionFinals.length > 0) {
      this.accumulatedFinalChunks.push(...this.currentSessionFinals);
      this.currentSessionFinals = [];
    }

    const allFinals = deduplicatePhrases(this.accumulatedFinalChunks);
    let sessionFinalJoined = allFinals.join(' ').trim();

    // Fallback: If WebSpeech produced no text or AI fallback was activated
    if ((!sessionFinalJoined || this.useAiFallback) && audioBlob && audioBlob.size > 500) {
      this.status = 'processing';
      if (this.currentOptions?.onStatusChange) {
        this.currentOptions.onStatusChange('processing');
      }

      const aiTranscript = await transcribeAudioWithGemini(audioBlob, this.activeLang);
      if (aiTranscript) {
        sessionFinalJoined = aiTranscript;
      }
    }

    this.status = 'idle';
    this.sessionInterimText = '';

    let fullCommitted = '';
    if (this.baseInitialText && sessionFinalJoined) {
      if (sessionFinalJoined.toLowerCase().startsWith(this.baseInitialText.toLowerCase())) {
        fullCommitted = sessionFinalJoined;
      } else {
        fullCommitted = `${this.baseInitialText} ${sessionFinalJoined}`;
      }
    } else {
      fullCommitted = sessionFinalJoined || this.baseInitialText;
    }

    if (this.currentOptions) {
      this.currentOptions.onTranscriptChange(fullCommitted, '');
      if (this.currentOptions.onStatusChange) {
        this.currentOptions.onStatusChange('idle');
      }
    }
  }

  /**
   * Cancel and discard the current session without saving speech
   */
  public async cancelSession(): Promise<void> {
    await this.stopSession(false);
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
    this.accumulatedFinalChunks = [];
    this.currentSessionFinals = [];
    this.sessionInterimText = '';
    this.recordedChunks = [];
    this.baseInitialText = '';
    if (this.currentOptions) {
      this.currentOptions.onTranscriptChange('', '');
    }
  }

  public reset(): void {
    this.stopSession(false);
    this.activeFieldId = null;
    this.currentOptions = null;
    this.baseInitialText = '';
    this.accumulatedFinalChunks = [];
    this.currentSessionFinals = [];
    this.sessionInterimText = '';
    this.recordedChunks = [];
    this.status = 'idle';
  }
}

// Global Singleton Instance
export const voiceService = new VoiceService();
