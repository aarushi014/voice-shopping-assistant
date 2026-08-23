import { useState, useEffect } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { SearchResults } from './components/SearchResults';
import { ShoppingList } from './components/ShoppingList';
import { SuggestedPanel } from './components/SuggestedPanel';
import { VoiceMicButton } from './components/VoiceMicButton';
import { categorizeItem } from './services/categorizer';
import { parseVoiceCommand } from './services/commandParser';
import { initAnonymousAuth } from './services/firebase';
import {
  subscribeShoppingList,
  saveShoppingItemToFirestore,
  deleteShoppingItemFromFirestore,
  logPurchaseHistoryEntry,
} from './services/firestoreShopping';
import type { SupportedLanguage } from './services/i18n/commandKeywords';
import { searchProducts } from './services/productSearch';
import type { Product } from './services/productSearch';
import { getSuggestions } from './services/suggestions';
import type { Suggestion } from './services/suggestions';
import type { Category, ShoppingItem } from './types/ShoppingItem';
import type { VoiceCommand } from './types/voice';

const INITIAL_DEMO_ITEMS: ShoppingItem[] = [
  {
    id: '1',
    name: 'whole milk',
    quantity: 1,
    category: 'Dairy',
    addedAt: new Date().toISOString(),
    purchased: false,
  },
  {
    id: '2',
    name: 'fresh apples',
    quantity: 5,
    category: 'Produce',
    addedAt: new Date().toISOString(),
    purchased: false,
  },
  {
    id: '3',
    name: 'bottled water',
    quantity: 2,
    category: 'Beverages',
    addedAt: new Date().toISOString(),
    purchased: false,
  },
];

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en-US');
  const [items, setItems] = useState<ShoppingItem[]>(INITIAL_DEMO_ITEMS);

  const [, setActiveCommand] = useState<VoiceCommand | null>(null);
  const [testInput, setTestInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ command: VoiceCommand; matches: Product[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // 1. Network Online/Offline Status Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setSyncStatus('synced');
    };
    const handleOffline = () => {
      setIsOffline(true);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Anonymous Auth Initialization
  useEffect(() => {
    initAnonymousAuth()
      .then((user) => {
        setUserId(user.uid);
      })
      .catch((err) => {
        console.warn('Anonymous auth failed, using local fallback:', err);
      });
  }, []);

  // 3. Real-Time Firestore Sync for shoppingLists/{userId}/items
  useEffect(() => {
    if (!userId) return;

    setSyncStatus('syncing');
    const unsubscribe = subscribeShoppingList(
      userId,
      (cloudItems) => {
        if (cloudItems.length > 0) {
          setItems(cloudItems);
        } else {
          INITIAL_DEMO_ITEMS.forEach((item) => {
            saveShoppingItemToFirestore(userId, item);
          });
          setItems(INITIAL_DEMO_ITEMS);
        }
        setSyncStatus('synced');
      },
      () => {
        setSyncStatus('offline');
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // 4. Compute Dynamic Suggestions
  useEffect(() => {
    setIsLoadingSuggestions(true);
    getSuggestions(items, userId || undefined)
      .then((s) => {
        setSuggestions(s);
        setIsLoadingSuggestions(false);
      })
      .catch(() => {
        setIsLoadingSuggestions(false);
      });
  }, [items, userId]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Add Item to Shopping List & Sync to Firestore
  const handleAddItem = (itemName: string, categoryOverride?: Category, quantity = 1) => {
    const normTarget = itemName.toLowerCase().trim();
    if (!normTarget) return;

    const addQty = Math.max(1, quantity);

    setSyncStatus('syncing');
    setItems((prevItems) => {
      // Find exact or clean item name match
      const existingIndex = prevItems.findIndex(
        (i) =>
          i.name.toLowerCase().trim() === normTarget ||
          i.name.toLowerCase().trim() === `${normTarget} bottle` ||
          normTarget === `${i.name.toLowerCase().trim()} bottle`
      );

      if (existingIndex >= 0) {
        const existing = prevItems[existingIndex];
        const updatedItem: ShoppingItem = {
          ...existing,
          quantity: existing.quantity + addQty,
        };
        const next = [...prevItems];
        next[existingIndex] = updatedItem;

        if (userId) {
          saveShoppingItemToFirestore(userId, updatedItem).finally(() => setSyncStatus('synced'));
        } else {
          setSyncStatus('synced');
        }
        showNotification(`Updated "${updatedItem.name}" to ${updatedItem.quantity} ✓`);
        return next;
      } else {
        const category = categoryOverride || categorizeItem(itemName);
        const newItem: ShoppingItem = {
          id: Date.now().toString() + Math.random().toString().slice(2, 6),
          name: itemName,
          quantity: addQty,
          category,
          addedAt: new Date().toISOString(),
          purchased: false,
        };
        const next = [newItem, ...prevItems];

        if (userId) {
          saveShoppingItemToFirestore(userId, newItem).finally(() => setSyncStatus('synced'));
        } else {
          setSyncStatus('synced');
        }
        showNotification(`Added ${newItem.name} (1) ✓`);
        return next;
      }
    });
  };


  // Execute Voice Command on Shopping List State & Firestore
  const handleVoiceCommand = (command: VoiceCommand) => {
    setActiveCommand(command);

    // Unrecognized Voice Command / Intent Edge Case
    if (command.intent === 'unknown' || (!command.item && command.intent !== 'search')) {
      showNotification("Sorry, I didn't catch that — try saying 'Add milk' or 'Find apples' 💡");
      return;
    }

    const normTarget = command.item.toLowerCase().trim();

    switch (command.intent) {
      case 'add': {
        handleAddItem(command.item, undefined, command.quantity || 1);
        setSearchQuery('');
        setSearchResults(null);
        break;
      }

      case 'remove': {
        const itemToRemove = items.find(
          (i) => i.name.toLowerCase().includes(normTarget) || normTarget.includes(i.name.toLowerCase())
        );

        if (itemToRemove) {
          setSyncStatus('syncing');
          setItems((prev) => prev.filter((i) => i.id !== itemToRemove.id));
          if (userId) {
            deleteShoppingItemFromFirestore(userId, itemToRemove.id).finally(() => setSyncStatus('synced'));
            logPurchaseHistoryEntry(userId, itemToRemove.name, itemToRemove.category, 'removed');
          } else {
            setSyncStatus('synced');
          }
          showNotification(`Removed ${itemToRemove.name} ✓`);
        } else {
          showNotification(`Item "${command.item}" not found in list`);
        }
        setSearchResults(null);
        break;
      }

      case 'update': {
        const targetQty = command.quantity ?? 1;
        const existingIndex = items.findIndex(
          (i) => i.name.toLowerCase().includes(normTarget) || normTarget.includes(i.name.toLowerCase())
        );

        if (existingIndex >= 0) {
          setSyncStatus('syncing');
          const updatedItem = {
            ...items[existingIndex],
            quantity: targetQty,
          };
          setItems((prev) => {
            const next = [...prev];
            next[existingIndex] = updatedItem;
            return next;
          });
          if (userId) {
            saveShoppingItemToFirestore(userId, updatedItem).finally(() => setSyncStatus('synced'));
          } else {
            setSyncStatus('synced');
          }
          showNotification(`Updated ${updatedItem.name} to ${targetQty} ✓`);
        } else {
          handleAddItem(command.item, undefined, targetQty);
        }
        setSearchResults(null);
        break;
      }

      case 'search': {
        setIsSearching(true);
        setTimeout(() => {
          const matches = searchProducts(command);
          setSearchResults({ command, matches });
          setSearchQuery(command.item);
          setIsSearching(false);
          if (matches.length > 0) {
            showNotification(`Found ${matches.length} catalog result(s) ✓`);
          } else {
            showNotification(`No products matching "${command.item}" found`);
          }
        }, 300);
        break;
      }

      default:
        showNotification("Sorry, I didn't catch that — try saying 'Add milk' or 'Find apples' 💡");
        break;
    }
  };

  const handleManualInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (testInput.trim()) {
      const parsed = parseVoiceCommand(testInput, selectedLang);
      handleVoiceCommand(parsed);
    } else {
      showNotification("Please type a command, e.g. 'Add milk'");
    }
  };

  const handleSampleClick = (phrase: string) => {
    setTestInput(phrase);
    const parsed = parseVoiceCommand(phrase, selectedLang);
    handleVoiceCommand(parsed);
  };

  const handleTogglePurchased = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    setSyncStatus('syncing');
    const updatedItem = { ...target, purchased: !target.purchased };
    setItems((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));

    if (userId) {
      saveShoppingItemToFirestore(userId, updatedItem).finally(() => setSyncStatus('synced'));
      if (updatedItem.purchased) {
        logPurchaseHistoryEntry(userId, updatedItem.name, updatedItem.category, 'purchased');
      }
    } else {
      setSyncStatus('synced');
    }
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    setSyncStatus('syncing');
    const updatedItem = { ...target, quantity: newQty };
    setItems((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));

    if (userId) {
      saveShoppingItemToFirestore(userId, updatedItem).finally(() => setSyncStatus('synced'));
    } else {
      setSyncStatus('synced');
    }
  };

  const handleRemoveItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    setSyncStatus('syncing');
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (userId) {
      deleteShoppingItemFromFirestore(userId, id).finally(() => setSyncStatus('synced'));
      logPurchaseHistoryEntry(userId, target.name, target.category, 'removed');
    } else {
      setSyncStatus('synced');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all items from your shopping list?')) {
      setSyncStatus('syncing');
      items.forEach((item) => {
        if (userId) {
          deleteShoppingItemFromFirestore(userId, item.id);
        }
      });
      setItems([]);
      setSyncStatus('synced');
      showNotification('Cleared list ✓');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start px-3 py-4 sm:p-6 font-sans select-none">
      {/* Container Optimized for Mobile Viewports (375px+) */}
      <div className="w-full max-w-md sm:max-w-xl mx-auto flex flex-col gap-5">
        {/* Navigation Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-600/30">
              🛒
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold tracking-tight text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                <span>Voice Assistant</span>
                {syncStatus === 'syncing' ? (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> Syncing...
                  </span>
                ) : syncStatus === 'offline' ? (
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
                    Offline
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                    Synced ✓
                  </span>
                )}
              </h1>
            </div>
          </div>

          <LanguageSelector
            onLanguageChange={(lang) => {
              setSelectedLang(lang);
            }}
          />
        </header>

        {/* User-Visible Offline Mode Banner */}
        {isOffline && (
          <div className="w-full bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Offline mode — changes are saved locally and will sync when reconnected</span>
          </div>
        )}

        {/* Floating Action Confirmation Toast / Snackbar */}
        {notification && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-2xl border border-indigo-400 text-xs sm:text-sm font-bold animate-bounce flex items-center gap-2">
            <span>✨</span>
            <span>{notification}</span>
          </div>
        )}

        {/* Big Center Microphone Section */}
        <section className="w-full flex flex-col items-center">
          <VoiceMicButton
            lang={selectedLang}
            onCommandParsed={(cmd) => {
              handleVoiceCommand(cmd);
              setTestInput(cmd.originalText);
            }}
          />
        </section>

        {/* Text Input Fallback & Preset Quick Action Chips */}
        <section className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <form onSubmit={handleManualInputSubmit} className="flex gap-2 mb-3">
            <label htmlFor="voice-text-fallback" className="sr-only">
              Type voice command fallback
            </label>
            <input
              id="voice-text-fallback"
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder={`Type command fallback (${selectedLang})...`}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm min-h-[44px]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer min-h-[44px] shrink-0"
            >
              Run
            </button>
          </form>

          {/* Quick Voice Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleSampleClick('Add 2 bottles of water')}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-950 hover:bg-indigo-600/30 text-slate-300 border border-slate-800 whitespace-nowrap cursor-pointer min-h-[36px]"
            >
              + Add 2 water
            </button>
            <button
              type="button"
              onClick={() => handleSampleClick('Find me organic apples')}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-950 hover:bg-indigo-600/30 text-slate-300 border border-slate-800 whitespace-nowrap cursor-pointer min-h-[36px]"
            >
              🔍 Organic apples
            </button>
            <button
              type="button"
              onClick={() => handleSampleClick('Change apples to 8')}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-950 hover:bg-indigo-600/30 text-slate-300 border border-slate-800 whitespace-nowrap cursor-pointer min-h-[36px]"
            >
              ⚡ Set apples 8
            </button>
            <button
              type="button"
              onClick={() => handleSampleClick('Remove whole milk')}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-950 hover:bg-rose-600/30 text-slate-300 border border-slate-800 whitespace-nowrap cursor-pointer min-h-[36px]"
            >
              - Remove whole milk
            </button>
          </div>
        </section>

        {/* Search Results Display & Loading Spinner */}
        {isSearching ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2 animate-pulse">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-semibold">Searching product catalog...</p>
          </div>
        ) : (
          searchResults && (
            <SearchResults
              command={searchResults.command}
              results={searchResults.matches}
              onAddProductToList={(name, category) => handleAddItem(name, category, 1)}
              onClose={() => setSearchResults(null)}
            />
          )
        )}

        {/* Collapsible Intelligent Suggestions Panel */}
        <SuggestedPanel
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          onAddSuggestion={(name, category) => handleAddItem(name, category, 1)}
        />

        {/* Categorized Shopping List */}
        <ShoppingList
          items={items}
          searchQuery={searchQuery}
          onTogglePurchased={handleTogglePurchased}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onAddSubstitute={(name, category) => handleAddItem(name, category, 1)}
          onClearAll={handleClearAll}
        />
      </div>
    </div>
  );
}
