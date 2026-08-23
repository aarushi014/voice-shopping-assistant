declare const process: any;
import { parseVoiceCommand } from './commandParser';
import { categorizeItem } from './categorizer';
import { searchProducts } from './productSearch';

console.log('==================================================');
console.log(' COMPREHENSIVE ERROR & EDGE CASE TEST SUITE ');
console.log('==================================================\n');

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

// Edge Case 1: Unrecognized Voice Command / Gibberish
console.log('--- 1. Testing Unrecognized Voice Command Fallback ---');
const cmd1 = parseVoiceCommand('blablabla random noise 123');
assert(
  cmd1.intent === 'unknown',
  'Gibberish input correctly parsed as intent "unknown"'
);
assert(
  cmd1.originalText === 'blablabla random noise 123' || cmd1.item.includes('blablabla'),
  'Preserved original text for fallback message'
);

console.log('');

// Edge Case 2: Empty or Whitespace Voice Input
console.log('--- 2. Testing Empty or Whitespace Voice Inputs ---');
const cmd2 = parseVoiceCommand('   ');
assert(cmd2.intent === 'unknown', 'Whitespace input returns intent "unknown"');
assert(cmd2.item === '', 'Empty string item handles null pointer exception');
console.log('');

// Edge Case 3: Categorizer Unrecognized Item Fallback
console.log('--- 3. Testing Unrecognized Item Auto-Categorization ---');
const cat1 = categorizeItem('unknown gadget 99');
assert(
  cat1 === 'Other',
  'Unrecognized item name correctly defaults to "Other" category'
);
console.log('');

// Edge Case 4: Product Catalog Search with 0 Matches
console.log('--- 4. Testing Product Catalog Search Zero Matches ---');
const cmd4 = parseVoiceCommand('Find hoverboard under $1');
const searchResults = searchProducts(cmd4);
assert(
  searchResults.length === 0,
  'Search for non-existent item returned 0 results cleanly without throwing error'
);
console.log('');

// Edge Case 5: Extremely High Quantity or Price Bounds
console.log('--- 5. Testing Boundary Parsing for Price & Quantity ---');
const cmd5 = parseVoiceCommand('Add 999 bottles of water under $9999');
assert(cmd5.quantity === 999, 'Parsed large quantity 999');
assert(cmd5.maxPrice === 9999, 'Parsed large max price bound $9999');

console.log('\n--------------------------------------------------');
console.log(`SUMMARY: ${passedTests} / ${totalTests} tests passed.`);
console.log('--------------------------------------------------');

if (passedTests !== totalTests) {
  process.exit(1);
}
