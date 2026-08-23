import React from 'react';
import type { Product } from '../services/productSearch';
import type { Category } from '../types/ShoppingItem';
import type { VoiceCommand } from '../types/voice';

interface SearchResultsProps {
  command: VoiceCommand;
  results: Product[];
  onAddProductToList: (name: string, category: Category, price: number) => void;
  onClose: () => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  command,
  results,
  onAddProductToList,
  onClose,
  className = '',
}) => {
  return (
    <div className={`bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-sm font-bold">
            🔍
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              <span>Catalog Search Results</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {results.length} found
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Filtered for &quot;{command.originalText}&quot;
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 text-xs font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Close ✕
        </button>
      </div>

      {/* Filter Constraint Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {command.item && (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Query: &quot;{command.item}&quot;
          </span>
        )}
        {command.brand && (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Brand: {command.brand}
          </span>
        )}
        {command.maxPrice !== undefined && (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Max Price: ${command.maxPrice}
          </span>
        )}
        {command.tags &&
          command.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 capitalize"
            >
              Tag: 🌱 {tag}
            </span>
          ))}
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <div className="p-6 text-center bg-slate-950/60 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-xs sm:text-sm">
            No matching products found in catalog for this query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {results.map((product) => (
            <div
              key={product.id}
              className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 flex items-center justify-between gap-3 group transition-all"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {product.brand}
                  </span>
                  {product.tags.includes('organic') && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      🌱 Organic
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                  {product.name}
                </h4>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-extrabold text-emerald-400">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-400">({product.category})</span>
                </div>
              </div>

              {/* Add to List Action */}
              <button
                type="button"
                onClick={() => onAddProductToList(product.name, product.category, product.price)}
                className="shrink-0 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>+</span> Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
