import type { VoiceCommand, VoiceIntent } from '../types/voice';
import { LANGUAGE_KEYWORD_MAP } from './i18n/commandKeywords';
import type { SupportedLanguage } from './i18n/commandKeywords';


const KNOWN_BRANDS = [
  'colgate',
  'crest',
  'sensodyne',
  'chobani',
  'tropicana',
  'starbucks',
  'dole',
  'silk',
  'oatly',
  'toms',
  "tom's",
  'horizon',
  'kettle',
  'lindt',
  'bounty',
  'dawn',
  'kerrygold',
];

const KNOWN_TAGS = ['organic', 'fresh', 'gluten-free', 'dairy-free', 'vegan', 'natural'];

/**
 * Parses raw speech text into a structured VoiceCommand object based on target language keywords.
 */
export function parseVoiceCommand(
  text: string,
  lang: SupportedLanguage = 'en-US'
): VoiceCommand {
  const originalText = text.trim();
  if (!originalText) {
    return { intent: 'unknown', item: '', originalText };
  }

  const langConfig = LANGUAGE_KEYWORD_MAP[lang] || LANGUAGE_KEYWORD_MAP['en-US'];
  let normalized = originalText.toLowerCase();

  // Special handling for UPDATE Intent (e.g., "Change apples to 5")
  const updatePatterns = [
    /^(?:change|update|set|modify|make)\s+(?:the\s+)?(?:quantity\s+of\s+)?(.*)\s+(?:to|be|as)\s+(\d+|\w+)/i,
    /^(?:change|update|set|modify)\s+(\d+)?\s*(.*)\s+to\s+(\d+)/i,
  ];

  for (const pattern of updatePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const rawItemName = match[1] || match[2] || '';
      const rawQtyStr = match[2] || match[3] || '';
      let parsedQty: number | undefined = parseInt(rawQtyStr, 10);

      if (isNaN(parsedQty) && langConfig.wordNumbers) {
        parsedQty = langConfig.wordNumbers[rawQtyStr.toLowerCase()];
      }

      let cleanItem = rawItemName;
      if (langConfig.containersToStrip) {
        cleanItem = cleanItem.replace(langConfig.containersToStrip, '');
      }
      if (langConfig.targetsToStrip) {
        cleanItem = cleanItem.replace(langConfig.targetsToStrip, '');
      }
      cleanItem = cleanItem
        .replace(/^(a|an|the|to)\s+/i, '')
        .replace(/\b(quantity|qty)\b/i, '')
        .trim();

      if (cleanItem) {
        return {
          intent: 'update',
          item: cleanItem,
          quantity: isNaN(parsedQty as number) ? undefined : parsedQty,
          originalText,
        };
      }
    }
  }

  // 1. Extract Price Constraints (Max Price / Min Price)
  let maxPrice: number | undefined = undefined;
  let minPrice: number | undefined = undefined;

  // Match max price: e.g. "under $5", "under 5 dollars", "under 5", "less than $10", "below 5"
  const maxPriceMatch = normalized.match(
    /\b(?:under|below|less\s+than|max|up\s+to)\s*\$?(\d+(?:\.\d+)?)\s*(?:dollars|bucks)?\b/i
  );
  if (maxPriceMatch) {
    maxPrice = parseFloat(maxPriceMatch[1]);
    normalized = normalized.replace(maxPriceMatch[0], '').trim();
  }

  // Match min price: e.g. "above $5", "more than $5", "over $10"
  const minPriceMatch = normalized.match(
    /\b(?:above|over|more\s+than|min|above)\s*\$?(\d+(?:\.\d+)?)\s*(?:dollars|bucks)?\b/i
  );
  if (minPriceMatch) {
    minPrice = parseFloat(minPriceMatch[1]);
    normalized = normalized.replace(minPriceMatch[0], '').trim();
  }

  // 2. Extract Tags (e.g. "organic", "gluten-free")
  const extractedTags: string[] = [];
  for (const tag of KNOWN_TAGS) {
    const tagRegex = new RegExp(`\\b${tag}\\b`, 'i');
    if (tagRegex.test(normalized)) {
      extractedTags.push(tag);
      // Remove tag keyword from item query for clean matching
      normalized = normalized.replace(tagRegex, '').trim();
    }
  }

  // 3. Extract Brand (e.g. "colgate", "chobani")
  let extractedBrand: string | undefined = undefined;
  for (const brand of KNOWN_BRANDS) {
    const brandRegex = new RegExp(`\\b${brand}\\b`, 'i');
    if (brandRegex.test(normalized)) {
      extractedBrand = brand;
      normalized = normalized.replace(brandRegex, '').trim();
      break;
    }
  }

  // 4. Extract Quantity
  let quantity: number | undefined = undefined;
  const digitMatch = normalized.match(/\b(\d+)\b/);
  if (digitMatch) {
    quantity = parseInt(digitMatch[1], 10);
    normalized = normalized.replace(/\b\d+\b/, '').trim();
  } else if (langConfig.wordNumbers) {
    for (const [word, num] of Object.entries(langConfig.wordNumbers)) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
      if (wordRegex.test(normalized)) {
        quantity = num;
        normalized = normalized.replace(wordRegex, '').trim();
        break;
      }
    }
  }

  // 5. Identify Intent
  let intent: VoiceIntent = 'unknown';
  let rawItem = normalized;

  const checkIntentKeywords = (keywords: string[]): string | null => {
    if (!keywords) return null;
    for (const kw of keywords) {
      const lowerKw = kw.toLowerCase();
      if (normalized.startsWith(lowerKw)) {
        return normalized.slice(lowerKw.length).trim();
      }
      if (normalized.endsWith(lowerKw)) {
        return normalized.slice(0, normalized.length - lowerKw.length).trim();
      }
      const kwRegex = new RegExp(`\\b${lowerKw}\\b`, 'i');
      if (kwRegex.test(normalized)) {
        return normalized.replace(kwRegex, '').trim();
      }
    }
    return null;
  };

  // Check SEARCH Intent
  const searchMatched = checkIntentKeywords(langConfig.search);
  if (searchMatched !== null) {
    intent = 'search';
    rawItem = searchMatched;
  }

  // If explicit search attributes (maxPrice, brand, tags) are present, force intent = 'search'
  if (maxPrice !== undefined || minPrice !== undefined || extractedBrand !== undefined) {
    intent = 'search';
  }

  // Check REMOVE Intent
  if (intent === 'unknown') {
    const removeMatched = checkIntentKeywords(langConfig.remove);
    if (removeMatched !== null) {
      intent = 'remove';
      rawItem = removeMatched;
    }
  }

  // Check ADD Intent
  if (intent === 'unknown') {
    const addMatched = checkIntentKeywords(langConfig.add);
    if (addMatched !== null) {
      intent = 'add';
      rawItem = addMatched;
    }
  }

  // Fallback checks across English keywords
  if (intent === 'unknown' && lang !== 'en-US') {
    const fallbackAdd = checkIntentKeywords(LANGUAGE_KEYWORD_MAP['en-US'].add);
    if (fallbackAdd !== null) {
      intent = 'add';
      rawItem = fallbackAdd;
    } else {
      const fallbackRemove = checkIntentKeywords(LANGUAGE_KEYWORD_MAP['en-US'].remove);
      if (fallbackRemove !== null) {
        intent = 'remove';
        rawItem = fallbackRemove;
      } else {
        const fallbackSearch = checkIntentKeywords(LANGUAGE_KEYWORD_MAP['en-US'].search);
        if (fallbackSearch !== null) {
          intent = 'search';
          rawItem = fallbackSearch;
        }
      }
    }
  }

  // 6. Clean up Item Text
  let cleanedItem = rawItem;

  if (langConfig.containersToStrip) {
    cleanedItem = cleanedItem.replace(langConfig.containersToStrip, '');
  }
  if (langConfig.targetsToStrip) {
    cleanedItem = cleanedItem.replace(langConfig.targetsToStrip, '');
  }

  cleanedItem = cleanedItem
    .replace(/^[,\s.!?]+/g, '')
    .replace(/[,\s.!?]+$/g, '')
    .replace(/^(a|an|the|un|una|el|la|los|las|le|les|la|me|for)\s+/i, '')
    .trim();

  if (!cleanedItem && normalized) {
    cleanedItem = normalized;
  }

  return {
    intent,
    item: cleanedItem,
    ...(quantity !== undefined ? { quantity } : {}),
    ...(extractedBrand !== undefined ? { brand: extractedBrand } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(extractedTags.length > 0 ? { tags: extractedTags } : {}),
    originalText,
  };
}
