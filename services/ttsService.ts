class TtsService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedEnglishVoice: SpeechSynthesisVoice | null = null;
  private selectedRussianVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // The 'voiceschanged' event is crucial because voices are often loaded asynchronously.
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = this.loadVoices;
      }
      this.loadVoices(); // Initial attempt to load voices.
    } else {
      console.warn("Text-to-speech not supported in this browser.");
    }
  }

  private loadVoices = () => {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.voices.length > 0 && !this.isInitialized) {
      
      // --- Russian Voice Selection ---
      const preferredRussianVoices = [
        'Milena', // Prioritizing high-quality female voice
        'Google русский',
        'Tatyana',
        'Yuri'
      ];
      for (const name of preferredRussianVoices) {
        const found = this.voices.find(voice => voice.name === name && voice.lang.startsWith('ru'));
        if (found) {
          this.selectedRussianVoice = found;
          break;
        }
      }
      // Fallback for Russian
      if (!this.selectedRussianVoice) {
          this.selectedRussianVoice = this.voices.find(voice => voice.lang.startsWith('ru')) || null;
      }

      // --- English Voice Selection (GLaDOS style) ---
       const preferredEnglishVoices = [
        'Google UK English Female', // Often has a suitable robotic tone
        'Zoe (Enhanced)', // Premium macOS voice
        'Samantha', // Common, clear US voice
        'Google US English',
        'Microsoft Zira Desktop - English (United States)'
      ];

       for (const name of preferredEnglishVoices) {
          const found = this.voices.find(voice => voice.name === name && voice.lang.startsWith('en'));
          if (found) {
              this.selectedEnglishVoice = found;
              break;
          }
      }
      // Fallback for English
      if (!this.selectedEnglishVoice) {
          this.selectedEnglishVoice = this.voices.find(voice => voice.lang.startsWith('en')) || null;
      }

      if(this.selectedEnglishVoice || this.selectedRussianVoice) {
        this.isInitialized = true;
        console.log("TTS Initialized.", {
            english: this.selectedEnglishVoice?.name,
            russian: this.selectedRussianVoice?.name
        });
      }
    }
  };

  speak(text: string, onEnd?: () => void): void {
    if (!this.synth || !text) return;
    
    if (!this.isInitialized) {
       // Retry loading voices if not ready, it can be lazy.
       console.log("TTS not ready, retrying...");
       setTimeout(() => this.speak(text, onEnd), 250);
       return;
    }

    // Clean up text for better speech flow
    const cleanedText = text
        .replace(/---(.*?)---/g, '') // Remove file markers
        .replace(/#+\s/g, '') // Remove markdown headings
        .replace(/IPA/g, 'I. P. A.') // Pronounce acronym
        .replace(/v1.0/g, 'version one point oh');

    this.cancel(); // Stop any currently speaking utterance

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // --- Language Detection and Voice Assignment ---
    const isRussian = /[а-яА-Я]/.test(text);
    
    let voiceToUse: SpeechSynthesisVoice | null = null;

    if (isRussian) {
        voiceToUse = this.selectedRussianVoice;
        utterance.lang = 'ru-RU';
        utterance.pitch = 1; // Natural pitch for Russian
        utterance.rate = 1;  // Natural rate for Russian
    } else {
        voiceToUse = this.selectedEnglishVoice;
        utterance.lang = 'en-US';
        // GLaDOS-like settings
        utterance.pitch = 0.8; // Lower, more robotic pitch
        utterance.rate = 1.0;  // Deliberate and clear
    }

    if (voiceToUse) {
        utterance.voice = voiceToUse;
    } else {
        console.warn(`No voice available for language: ${isRussian ? 'Russian' : 'English'}`);
        // Fallback to browser default if no specific voice was found
    }

    utterance.volume = 1;

    if (onEnd) {
      utterance.onend = onEnd;
    }
    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        onEnd?.(); // Ensure callback is called on error too
    };

    this.synth.speak(utterance);
  }

  cancel(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }
}

// Export a singleton instance
export const ttsService = new TtsService();

class SoundService {
  private audioCtx: AudioContext | null = null;
  private isInitialized = false;

  // This must be called on the first user interaction (e.g., a click)
  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log("SoundService Initialized.");
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
    }
  }

  private playTone(freq: number, duration: number, volume: number, type: OscillatorType = 'sine') {
    if (!this.audioCtx || !this.isInitialized) return;

    // To prevent issues with rapid calls, ensure context is running
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

    oscillator.start(this.audioCtx.currentTime);
    oscillator.stop(this.audioCtx.currentTime + duration);
  }

  playHoverSound() {
    this.playTone(250, 0.05, 0.15, 'triangle');
  }

  playClickSound() {
    this.playTone(450, 0.07, 0.1, 'sine');
  }
}

export const soundService = new SoundService();