import seasonalData from '../data/seasonal.json';
import substitutesData from '../data/substitutes.json';
import { categorizeItem } from './categorizer';
import { fetchPurchaseHistoryFromFirestore } from './firestoreShopping';
import type { PurchaseHistoryEntry } from './firestoreShopping';

import type { Category, ShoppingItem } from '../types/ShoppingItem';

export type SuggestionSource = 'history' | 'seasonal' | 'substitute';

export interface Suggestion {
  id: string;
  name: string;
  category: Category;
  reason: string;
  source: SuggestionSource;
  parentItemName?: string;
}

// Default Fallback Purchase History if Firestore has no history yet
const DEFAULT_FALLBACK_HISTORY: { name: string; category: Category; reason: string }[] = [
  {
    name: 'Fresh Eggs',
    category: 'Dairy',
    reason: 'You usually buy this weekly (running low)',
  },
  {
    name: 'Unsalted Butter',
    category: 'Dairy',
    reason: 'Purchased 8 days ago',
  },
  {
    name: 'Paper Towels',
    category: 'Household',
    reason: 'Restock recommended',
  },
];

/**
 * Combines real Firestore purchase history (if available), seasonal items, and substitute sources into suggestions.
 */
export async function getSuggestions(
  currentItems: ShoppingItem[],
  userId?: string,
  monthIndex = new Date().getMonth()
): Promise<Suggestion[]> {
  const currentNames = new Set(
    currentItems.map((i) => i.name.toLowerCase().trim())
  );

  const suggestions: Suggestion[] = [];
  const addedNames = new Set<string>();

  // 1. Substitutes Source (Triggered by items in current list)
  for (const item of currentItems) {
    const itemNorm = item.name.toLowerCase().trim();
    for (const [key, subs] of Object.entries(substitutesData.substitutes)) {
      if (itemNorm.includes(key.toLowerCase()) || key.toLowerCase().includes(itemNorm)) {
        for (const sub of subs) {
          const subNorm = sub.name.toLowerCase().trim();
          if (!currentNames.has(subNorm) && !addedNames.has(subNorm)) {
            addedNames.add(subNorm);
            suggestions.push({
              id: `sub_${item.id}_${subNorm.replace(/\s+/g, '_')}`,
              name: sub.name,
              category: (sub.category as Category) || categorizeItem(sub.name),
              reason: `Healthy alternative for "${item.name}"`,
              source: 'substitute',
              parentItemName: item.name,
            });
          }
        }
      }
    }
  }

  // 2. Real History-Based Source (from Firestore purchaseHistory collection)
  let realHistoryEntries: PurchaseHistoryEntry[] = [];
  if (userId) {
    realHistoryEntries = await fetchPurchaseHistoryFromFirestore(userId);
  }

  if (realHistoryEntries.length > 0) {
    for (const entry of realHistoryEntries) {
      const nameNorm = entry.itemName.toLowerCase().trim();
      if (!currentNames.has(nameNorm) && !addedNames.has(nameNorm)) {
        addedNames.add(nameNorm);
        suggestions.push({
          id: `hist_real_${entry.id}`,
          name: entry.itemName,
          category: entry.category,
          reason: `Previously ${entry.action} — Running low?`,
          source: 'history',
        });
      }
    }
  } else {
    // Fallback to default history items if Firestore history is currently empty
    for (const historyItem of DEFAULT_FALLBACK_HISTORY) {
      const nameNorm = historyItem.name.toLowerCase().trim();
      if (!currentNames.has(nameNorm) && !addedNames.has(nameNorm)) {
        addedNames.add(nameNorm);
        suggestions.push({
          id: `hist_fb_${nameNorm.replace(/\s+/g, '_')}`,
          name: historyItem.name,
          category: historyItem.category,
          reason: historyItem.reason,
          source: 'history',
        });
      }
    }
  }

  // 3. Seasonal Source (Items mapped to current month)
  const monthKey = String(monthIndex) as keyof typeof seasonalData.seasons;
  const seasonalList = seasonalData.seasons[monthKey] || seasonalData.seasons['7'];

  for (const seasonalItem of seasonalList) {
    const nameNorm = seasonalItem.name.toLowerCase().trim();
    if (!currentNames.has(nameNorm) && !addedNames.has(nameNorm)) {
      addedNames.add(nameNorm);
      suggestions.push({
        id: `seas_${nameNorm.replace(/\s+/g, '_')}`,
        name: seasonalItem.name,
        category: (seasonalItem.category as Category) || categorizeItem(seasonalItem.name),
        reason: `Popular in ${getMonthName(monthIndex)} (In Season / On Sale)`,
        source: 'seasonal',
      });
    }
  }

  return suggestions;
}

function getMonthName(monthIndex: number): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[monthIndex] || 'August';
}

/**
 * Returns substitutes specific to a single item name if available.
 */
export function getSubstitutesForItem(
  itemName: string,
  currentItems: ShoppingItem[]
): { name: string; category: Category }[] {
  const itemNorm = itemName.toLowerCase().trim();
  const currentNames = new Set(currentItems.map((i) => i.name.toLowerCase().trim()));
  const results: { name: string; category: Category }[] = [];

  for (const [key, subs] of Object.entries(substitutesData.substitutes)) {
    if (itemNorm.includes(key.toLowerCase()) || key.toLowerCase().includes(itemNorm)) {
      for (const sub of subs) {
        const subNorm = sub.name.toLowerCase().trim();
        if (!currentNames.has(subNorm)) {
          results.push({
            name: sub.name,
            category: (sub.category as Category) || categorizeItem(sub.name),
          });
        }
      }
    }
  }

  return results;
}
