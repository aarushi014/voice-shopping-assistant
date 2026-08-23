export type VoiceIntent = 'add' | 'remove' | 'search' | 'update' | 'unknown';

export interface VoiceCommand {
  intent: VoiceIntent;
  item: string;
  quantity?: number;
  brand?: string;
  maxPrice?: number;
  minPrice?: number;
  tags?: string[];
  originalText: string;
}

// Ambient declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
