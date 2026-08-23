declare const process: any;
import { getSuggestions, getSubstitutesForItem } from './suggestions';
import type { ShoppingItem } from '../types/ShoppingItem';

console.log('==============================================');
console.log(' INTELLIGENT SUGGESTIONS ENGINE UNIT TEST RUN ');
console.log('==============================================\n');

async function runTests() {
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, description: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✓ PASS: ${description}`);
    } else {
      console.error(`✗ FAIL: ${description}`);
    }
  }

  // Initial shopping list containing "whole milk" and "fresh apples"
  const currentItems: ShoppingItem[] = [
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
  ];

  // Test month index 7 (August)
  const suggestions = await getSuggestions(currentItems, undefined, 7);

  // 1. History Source Verification
  console.log('--- 1. History-Based Suggestions ---');
  const historySuggestions = suggestions.filter((s) => s.source === 'history');
  assert(historySuggestions.length > 0, 'Generated history-based purchase suggestions');
  const eggsSuggestion = historySuggestions.find((s) => s.name.toLowerCase().includes('eggs'));
  assert(
    eggsSuggestion !== undefined && eggsSuggestion.reason.includes('weekly'),
    'Found history suggestion "Fresh Eggs" with reason: ' + (eggsSuggestion?.reason || '')
  );
  console.log('');

  // 2. Seasonal Source Verification (August / Month 7)
  console.log('--- 2. Seasonal Suggestions (August) ---');
  const seasonalSuggestions = suggestions.filter((s) => s.source === 'seasonal');
  assert(seasonalSuggestions.length > 0, 'Generated seasonal summer suggestions for August');
  const mangoesSuggestion = seasonalSuggestions.find((s) => s.name.toLowerCase().includes('mango'));
  assert(
    mangoesSuggestion !== undefined && mangoesSuggestion.category === 'Produce',
    'Found seasonal recommendation "Fresh Mangoes" under Produce'
  );
  console.log('');

  // 3. Substitute Source Verification (Triggered by "whole milk")
  console.log('--- 3. Product Substitute Suggestions ---');
  const substituteSuggestions = suggestions.filter((s) => s.source === 'substitute');
  assert(substituteSuggestions.length > 0, 'Generated substitute recommendations for items in list');
  const almondMilkSub = substituteSuggestions.find((s) => s.name.toLowerCase().includes('almond milk'));
  assert(
    almondMilkSub !== undefined && almondMilkSub.parentItemName === 'whole milk',
    'Found substitute "Almond Milk" for parent item "whole milk"'
  );
  console.log('');

  // 4. Item-Specific Substitutes Helper Test
  console.log('--- 4. Item-Specific Substitutes Lookup ---');
  const milkSubs = getSubstitutesForItem('whole milk', currentItems);
  assert(
    milkSubs.some((sub) => sub.name === 'Almond Milk') && milkSubs.some((sub) => sub.name === 'Oat Milk'),
    'getSubstitutesForItem("whole milk") returned Almond Milk and Oat Milk'
  );
  console.log('');

  // 5. Tappable / Clickable Add Simulation
  console.log('--- 5. Clickable Add Suggestion Simulation ---');
  const updatedList: ShoppingItem[] = [
    ...currentItems,
    {
      id: '3',
      name: 'Almond Milk',
      quantity: 1,
      category: 'Beverages',
      addedAt: new Date().toISOString(),
      purchased: false,
    },
  ];

  const newSuggestions = await getSuggestions(updatedList, undefined, 7);
  const almondMilkPresentInSuggestions = newSuggestions.some((s) => s.name === 'Almond Milk');
  assert(
    !almondMilkPresentInSuggestions,
    'After clicking to add "Almond Milk", it is removed from suggestions list'
  );

  console.log('\n----------------------------------------------');
  console.log(`SUMMARY: ${passedTests} / ${totalTests} tests passed.`);
  console.log('----------------------------------------------');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
