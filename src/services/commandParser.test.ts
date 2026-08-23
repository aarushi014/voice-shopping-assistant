import { parseVoiceCommand } from './commandParser';
import type { VoiceCommand } from '../types/voice';
import type { SupportedLanguage } from './i18n/commandKeywords';

interface TestCase {
  phrase: string;
  lang?: SupportedLanguage;
  expected: Partial<VoiceCommand>;
}

export const TEST_CASES: TestCase[] = [
  // English Cases
  {
    phrase: 'Add milk',
    lang: 'en-US',
    expected: { intent: 'add', item: 'milk' },
  },
  {
    phrase: 'Add 2 bottles of water',
    lang: 'en-US',
    expected: { intent: 'add', item: 'water', quantity: 2 },
  },
  {
    phrase: 'Remove milk from my list',
    lang: 'en-US',
    expected: { intent: 'remove', item: 'milk' },
  },
  {
    phrase: 'Search for organic coffee',
    lang: 'en-US',
    expected: { intent: 'search', item: 'organic coffee' },
  },

  // Hindi Cases
  {
    phrase: 'दूध जोड़ो',
    lang: 'hi-IN',
    expected: { intent: 'add', item: 'दूध' },
  },
  {
    phrase: '5 सेब चाहिए',
    lang: 'hi-IN',
    expected: { intent: 'add', item: 'सेब', quantity: 5 },
  },
  {
    phrase: 'सूची से दूध हटाएं',
    lang: 'hi-IN',
    expected: { intent: 'remove', item: 'दूध' },
  },
  {
    phrase: 'कॉफी खोजें',
    lang: 'hi-IN',
    expected: { intent: 'search', item: 'कॉफी' },
  },

  // Spanish Cases
  {
    phrase: 'Añadir leche',
    lang: 'es-ES',
    expected: { intent: 'add', item: 'leche' },
  },
  {
    phrase: 'Agregar 2 botellas de agua',
    lang: 'es-ES',
    expected: { intent: 'add', item: 'agua', quantity: 2 },
  },
  {
    phrase: 'Eliminar leche de mi lista',
    lang: 'es-ES',
    expected: { intent: 'remove', item: 'leche' },
  },
  {
    phrase: 'Buscar café orgánico',
    lang: 'es-ES',
    expected: { intent: 'search', item: 'café orgánico' },
  },

  // French Cases
  {
    phrase: 'Ajouter du lait',
    lang: 'fr-FR',
    expected: { intent: 'add', item: 'du lait' },
  },
  {
    phrase: "J'ai besoin de 5 pommes",
    lang: 'fr-FR',
    expected: { intent: 'add', item: 'pommes', quantity: 5 },
  },
  {
    phrase: 'Supprimer le lait de ma liste',
    lang: 'fr-FR',
    expected: { intent: 'remove', item: 'lait' },
  },
  {
    phrase: 'Chercher du café',
    lang: 'fr-FR',
    expected: { intent: 'search', item: 'du café' },
  },
];

export function runCommandParserTests(): { total: number; passed: number; results: any[] } {
  let passedCount = 0;
  const results = [];

  for (const test of TEST_CASES) {
    const lang = test.lang || 'en-US';
    const parsed = parseVoiceCommand(test.phrase, lang);
    const intentMatches = parsed.intent === test.expected.intent;
    const itemMatches = parsed.item.toLowerCase() === test.expected.item?.toLowerCase();
    const qtyMatches = test.expected.quantity === undefined || parsed.quantity === test.expected.quantity;

    const success = intentMatches && itemMatches && qtyMatches;

    if (success) {
      passedCount++;
    }

    results.push({
      phrase: test.phrase,
      lang,
      expected: test.expected,
      actual: {
        intent: parsed.intent,
        item: parsed.item,
        quantity: parsed.quantity,
      },
      passed: success,
    });
  }

  return {
    total: TEST_CASES.length,
    passed: passedCount,
    results,
  };
}
