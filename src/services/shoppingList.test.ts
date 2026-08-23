declare const process: any;
import { categorizeItem } from './categorizer';
import { parseVoiceCommand } from './commandParser';
import type { ShoppingItem } from '../types/ShoppingItem';


console.log('====================================================');
console.log(' SHOPPING LIST & VOICE INTEGRATION END-TO-END TEST ');
console.log('====================================================\n');

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

// 1. Test Categorizer
console.log('--- 1. Categorizer Keyword Unit Tests ---');
assert(categorizeItem('milk') === 'Dairy', 'categorizeItem("milk") => Dairy');
assert(categorizeItem('apples') === 'Produce', 'categorizeItem("apples") => Produce');
assert(categorizeItem('bottled water') === 'Beverages', 'categorizeItem("bottled water") => Beverages');
assert(categorizeItem('bread') === 'Bakery', 'categorizeItem("bread") => Bakery');
assert(categorizeItem('chips') === 'Snacks', 'categorizeItem("chips") => Snacks');
assert(categorizeItem('shampoo') === 'Household', 'categorizeItem("shampoo") => Household');
console.log('');

// 2. End-to-End Voice Command -> Shopping List Simulation
console.log('--- 2. End-to-End Voice Commands -> Shopping List Simulation ---');

let list: ShoppingItem[] = [];

function applyVoiceCommand(phrase: string, lang = 'en-US') {
  const cmd = parseVoiceCommand(phrase, lang as any);
  const normTarget = cmd.item.toLowerCase().trim();

  if (cmd.intent === 'add') {
    const qty = cmd.quantity || 1;
    const existingIndex = list.findIndex((i) =>
      i.name.toLowerCase().includes(normTarget) || normTarget.includes(i.name.toLowerCase())
    );

    if (existingIndex >= 0) {
      list[existingIndex].quantity += qty;
    } else {
      const category = categorizeItem(cmd.item);
      list.push({
        id: Date.now().toString() + Math.random(),
        name: cmd.item,
        quantity: qty,
        category,
        addedAt: new Date().toISOString(),
        purchased: false,
      });
    }
  } else if (cmd.intent === 'update') {
    const qty = cmd.quantity ?? 1;
    const existingIndex = list.findIndex((i) =>
      i.name.toLowerCase().includes(normTarget) || normTarget.includes(i.name.toLowerCase())
    );

    if (existingIndex >= 0) {
      list[existingIndex].quantity = qty;
    } else {
      const category = categorizeItem(cmd.item);
      list.push({
        id: Date.now().toString() + Math.random(),
        name: cmd.item,
        quantity: qty,
        category,
        addedAt: new Date().toISOString(),
        purchased: false,
      });
    }
  } else if (cmd.intent === 'remove') {
    list = list.filter(
      (i) => !i.name.toLowerCase().includes(normTarget) && !normTarget.includes(i.name.toLowerCase())
    );
  }
}

// Step A: Add 3 different items by voice
applyVoiceCommand('Add 2 bottles of water');
applyVoiceCommand('I need 5 apples');
applyVoiceCommand('Buy 1 loaf of bread');

assert(list.length === 3, 'Voice commands added 3 items to list');

const waterItem = list.find((i) => i.name.toLowerCase().includes('water'));
assert(
  waterItem !== undefined && waterItem.category === 'Beverages' && waterItem.quantity === 2,
  'Water added to Beverages with quantity 2'
);

const applesItem = list.find((i) => i.name.toLowerCase().includes('apple'));
assert(
  applesItem !== undefined && applesItem.category === 'Produce' && applesItem.quantity === 5,
  'Apples added to Produce with quantity 5'
);

const breadItem = list.find((i) => i.name.toLowerCase().includes('bread'));
assert(
  breadItem !== undefined && breadItem.category === 'Bakery' && breadItem.quantity === 1,
  'Bread added to Bakery with quantity 1'
);

// Step B: Quantity Update by Voice ("Change apples to 8")
applyVoiceCommand('Change apples to 8');
const updatedApples = list.find((i) => i.name.toLowerCase().includes('apple'));
assert(
  updatedApples !== undefined && updatedApples.quantity === 8,
  'Voice command "Change apples to 8" updated apples quantity to 8'
);

// Step C: Voice Removal ("Remove water")
applyVoiceCommand('Remove water');
const removedWater = list.find((i) => i.name.toLowerCase().includes('water'));
assert(removedWater === undefined, 'Voice command "Remove water" removed water from list');
assert(list.length === 2, 'List item count updated to 2 after deletion');

console.log('\n----------------------------------------------------');
console.log(`SUMMARY: ${passedTests} / ${totalTests} tests passed.`);
console.log('----------------------------------------------------');

if (passedTests !== totalTests) {
  process.exit(1);
}
