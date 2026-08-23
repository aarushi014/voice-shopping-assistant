import React, { useEffect, useState } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { parseVoiceCommand } from '../services/commandParser';
import type { SupportedLanguage } from '../services/i18n/commandKeywords';
import type { VoiceCommand } from '../types/voice';

interface VoiceMicButtonProps {
  lang?: SupportedLanguage;
  onCommandParsed?: (command: VoiceCommand) => void;
  className?: string;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  lang = 'en-US',
  onCommandParsed,
  className = '',
}) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    continuous: false,
    interimResults: true,
    lang,
  });

  const [parsedCommand, setParsedCommand] = useState<VoiceCommand | null>(null);
  const activeText = (transcript + ' ' + interimTranscript).trim();

  // Parse voice text in real time as transcript updates
  useEffect(() => {
    if (activeText) {
      const parsed = parseVoiceCommand(activeText, lang);
      setParsedCommand(parsed);
      if (onCommandParsed) {
        onCommandParsed(parsed);
      }
    } else {
      setParsedCommand(null);
    }
  }, [activeText, lang, onCommandParsed]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening(lang);
    }
  };

  const getIntentBadgeColor = (intent: string) => {
    switch (intent) {
      case 'add':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'remove':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'search':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'update':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full max-w-md mx-auto ${className}`}>
      {/* Center Microphone Button Container */}
      <div className="relative flex flex-col items-center justify-center mb-5 my-2">
        {/* Animated Multi-Ring Waves when Listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping duration-1000 scale-150"></span>
            <span className="absolute -inset-4 rounded-full bg-rose-500/20 animate-pulse duration-700"></span>
            <span className="absolute -inset-8 rounded-full bg-rose-500/10 animate-pulse duration-1000"></span>
          </>
        )}

        {/* Large Center Microphone Action Button (72px+ for One-Handed Mobile Use) */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={!isSupported}
          aria-label={isListening ? 'Stop listening to voice command' : 'Start listening to voice command'}
          className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-2xl shadow-rose-600/60 scale-110 focus:ring-rose-400'
              : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-2xl shadow-indigo-600/40 hover:scale-105 focus:ring-indigo-400'
          } ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isListening ? (
            /* Stop Square Icon */
            <svg className="w-9 h-9 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            /* Idle Microphone Icon */
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>

        {/* Listening Status Badge & Audio Waves */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          {isListening ? (
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Listening ({lang})...
              </span>

              {/* Audio Wave Frequency Bars */}
              <div className="flex items-center gap-1 h-4">
                <span className="w-1 bg-rose-400 rounded-full animate-bounce h-3"></span>
                <span className="w-1 bg-rose-500 rounded-full animate-bounce h-4 delay-100"></span>
                <span className="w-1 bg-rose-400 rounded-full animate-bounce h-2 delay-200"></span>
                <span className="w-1 bg-rose-500 rounded-full animate-bounce h-4 delay-300"></span>
                <span className="w-1 bg-rose-400 rounded-full animate-bounce h-3 delay-150"></span>
              </div>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Tap mic to speak command ({lang})
            </span>
          )}
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="w-full mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-2.5">
          <svg
            className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            {!isSupported && (
              <p className="mt-1 text-slate-400 text-xs">
                Use the text input fallback box below to test commands keyboard-only.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Real-Time Transcript Display Box */}
      <div className="w-full bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Live Speech Transcript
          </span>
          {transcript && (
            <button
              type="button"
              onClick={resetTranscript}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors min-h-[36px] px-2 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="min-h-[44px] bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs font-mono text-slate-200 break-words mb-2">
          {transcript ? (
            <span>
              {transcript}{' '}
              {interimTranscript && (
                <span className="text-indigo-400 italic opacity-80">{interimTranscript}</span>
              )}
            </span>
          ) : interimTranscript ? (
            <span className="text-indigo-400 italic opacity-80">{interimTranscript}</span>
          ) : (
            <span className="text-slate-600 italic">No audio recorded yet...</span>
          )}
        </div>

        {/* Parsed Command Output Preview */}
        {parsedCommand && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Parsed Intent & Entities:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getIntentBadgeColor(
                  parsedCommand.intent
                )}`}
              >
                Intent: {parsedCommand.intent}
              </span>

              {parsedCommand.quantity !== undefined && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Qty: {parsedCommand.quantity}
                </span>
              )}

              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-slate-200 border border-slate-800">
                Item: &quot;{parsedCommand.item || 'N/A'}&quot;
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
