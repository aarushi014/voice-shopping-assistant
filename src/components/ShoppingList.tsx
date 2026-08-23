import React, { useState } from 'react';
import { getSubstitutesForItem } from '../services/suggestions';
import type { Category, ShoppingItem } from '../types/ShoppingItem';

interface ShoppingListProps {
  items: ShoppingItem[];
  searchQuery?: string;
  onTogglePurchased: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onAddSubstitute?: (name: string, category: Category) => void;
  onClearAll?: () => void;
}

const CATEGORY_ORDER: Category[] = [
  'Dairy',
  'Produce',
  'Bakery',
  'Snacks',
  'Beverages',
  'Household',
  'Other',
];

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; icon: string }> = {
  Dairy: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: '🥛',
  },
  Produce: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: '🥦',
  },
  Bakery: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: '🍞',
  },
  Snacks: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: '🍿',
  },
  Beverages: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    icon: '🧃',
  },
  Household: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    icon: '🧻',
  },
  Other: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    icon: '📦',
  },
};

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  searchQuery = '',
  onTogglePurchased,
  onUpdateQuantity,
  onRemoveItem,
  onAddSubstitute,
  onClearAll,
}) => {
  const [dismissedSubstitutes, setDismissedSubstitutes] = useState<Set<string>>(new Set());

  const handleDismissSubstitute = (subKey: string) => {
    setDismissedSubstitutes((prev) => {
      const next = new Set(prev);
      next.add(subKey);
      return next;
    });
  };

  const filteredItems = items.filter((item) =>
    searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Group items by Category
  const groupedItems = CATEGORY_ORDER.reduce<Record<Category, ShoppingItem[]>>(
    (acc, cat) => {
      acc[cat] = filteredItems.filter((i) => i.category === cat);
      return acc;
    },
    {
      Dairy: [],
      Produce: [],
      Bakery: [],
      Snacks: [],
      Beverages: [],
      Household: [],
      Other: [],
    }
  );

  const totalItemCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
        <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 text-xl">
          🛒
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-1">Your Shopping List is Empty</h3>
        <p className="text-slate-400 text-xs max-w-xs mx-auto">
          Tap the center mic button to speak commands or use the text box below.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Shopping List</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
            </span>
          </h2>
        </div>

        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 min-h-[44px] px-2 cursor-pointer flex items-center"
          >
            Clear All
          </button>
        )}
      </div>

      {searchQuery && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>Filter: &quot;{searchQuery}&quot;</span>
          <span className="font-bold">{filteredItems.length} match(es)</span>
        </div>
      )}

      {/* Render Category Sections */}
      {CATEGORY_ORDER.map((category) => {
        const categoryItems = groupedItems[category];
        if (categoryItems.length === 0) return null;

        const config = CATEGORY_COLORS[category];

        return (
          <div
            key={category}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Category Header */}
            <div className={`px-4 py-2.5 border-b border-slate-800 flex items-center justify-between ${config.bg}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{config.icon}</span>
                <h3 className={`text-xs font-extrabold uppercase tracking-wider ${config.text}`}>
                  {category}
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.bg} ${config.text} ${config.border}`}>
                {categoryItems.length}
              </span>
            </div>

            {/* Category Items List */}
            <ul className="divide-y divide-slate-800/60">
              {categoryItems.map((item) => {
                const substitutes = getSubstitutesForItem(item.name, items);

                return (
                  <li
                    key={item.id}
                    className={`p-3 sm:px-4 flex flex-col gap-2 transition-colors ${
                      item.purchased ? 'bg-slate-950/40 text-slate-500' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      {/* Left: Checkbox & Name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onTogglePurchased(item.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 min-h-[44px] min-w-[44px] ${
                            item.purchased
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-slate-700 hover:border-slate-400 bg-slate-950 text-slate-400'
                          }`}
                          aria-label={item.purchased ? `Mark ${item.name} as unpurchased` : `Mark ${item.name} as purchased`}
                        >
                          {item.purchased && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs sm:text-sm font-semibold capitalize break-words block ${
                              item.purchased ? 'line-through text-slate-500' : 'text-slate-200'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                      </div>

                      {/* Right: Quantity Controls & Delete Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quantity Controls (Minimum 44px Touch Targets) */}
                        <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer text-base font-bold"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-extrabold text-slate-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-base font-bold"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>

                        {/* Delete Item Button (44px Touch Target) */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="w-9 h-9 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                          aria-label={`Remove ${item.name} from list`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Inline Dismissible Substitute Chips */}
                    {substitutes.length > 0 && !item.purchased && (
                      <div className="pl-9 flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                          <span>🔄</span> Alternative:
                        </span>

                        {substitutes.map((sub) => {
                          const subKey = `${item.id}_${sub.name}`;
                          if (dismissedSubstitutes.has(subKey)) return null;

                          return (
                            <div
                              key={subKey}
                              className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-2 py-1 text-[11px] text-cyan-300 font-medium min-h-[36px]"
                            >
                              <button
                                type="button"
                                onClick={() => onAddSubstitute && onAddSubstitute(sub.name, sub.category)}
                                className="hover:underline font-bold cursor-pointer"
                              >
                                + {sub.name}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDismissSubstitute(subKey)}
                                className="text-cyan-400/70 hover:text-cyan-200 ml-1 text-xs cursor-pointer min-w-[24px] text-center"
                                title="Dismiss suggestion"
                                aria-label={`Dismiss ${sub.name} suggestion`}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
