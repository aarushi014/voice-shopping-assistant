import React, { useState } from 'react';
import type { Suggestion, SuggestionSource } from '../services/suggestions';
import type { Category } from '../types/ShoppingItem';
import { SkeletonLoader } from './SkeletonLoader';

interface SuggestedPanelProps {
  suggestions: Suggestion[];
  isLoading?: boolean;
  onAddSuggestion: (name: string, category: Category) => void;
  className?: string;
}

export const SuggestedPanel: React.FC<SuggestedPanelProps> = ({
  suggestions,
  isLoading = false,
  onAddSuggestion,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | SuggestionSource>('all');

  const filteredSuggestions = suggestions.filter((s) =>
    activeFilter === 'all' ? true : s.source === activeFilter
  );

  const getSourceIcon = (source: SuggestionSource) => {
    switch (source) {
      case 'history':
        return '🕒';
      case 'seasonal':
        return '☀️';
      case 'substitute':
        return '🔄';
    }
  };

  const getSourceBadge = (source: SuggestionSource) => {
    switch (source) {
      case 'history':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'seasonal':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'substitute':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur transition-all ${className}`}>
      {/* Header & Collapsible Toggle */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-sm font-bold">
            💡
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <span>Suggested for You</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {suggestions.length}
              </span>
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer min-h-[44px] min-w-[44px] justify-center"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand suggestions panel' : 'Collapse suggestions panel'}
        >
          <span className="text-[11px] hidden sm:inline">
            {isCollapsed ? 'Expand' : 'Collapse'}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Collapsible Body */}
      {!isCollapsed && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          {/* Source Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer min-h-[36px] ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All ({suggestions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('history')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 min-h-[36px] ${
                activeFilter === 'history'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🕒</span> History
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('seasonal')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 min-h-[36px] ${
                activeFilter === 'seasonal'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>☀️</span> Seasonal
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('substitute')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 min-h-[36px] ${
                activeFilter === 'substitute'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🔄</span> Substitutes
            </button>
          </div>

          {/* Skeleton Loader or Suggestion Cards */}
          {isLoading ? (
            <SkeletonLoader type="suggestions" count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredSuggestions.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-3 flex items-center justify-between gap-2.5 group transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getSourceBadge(
                          item.source
                        )}`}
                      >
                        {getSourceIcon(item.source)} {item.source}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.reason}
                    </p>
                  </div>

                  {/* Click to Add Button */}
                  <button
                    type="button"
                    onClick={() => onAddSuggestion(item.name, item.category)}
                    className="shrink-0 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] justify-center"
                    aria-label={`Add ${item.name} to shopping list`}
                  >
                    <span>+</span> Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
