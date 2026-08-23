declare const process: any;
import { parseVoiceCommand } from './commandParser';
import { searchProducts } from './productSearch';

console.log('==================================================');
console.log(' VOICE-ACTIVATED PRODUCT SEARCH ENGINE UNIT TEST ');
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

// Test Case 1: "Find me organic apples"
console.log('--- 1. Testing Voice Command: "Find me organic apples" ---');
const cmd1 = parseVoiceCommand('Find me organic apples');

assert(cmd1.intent === 'search', 'Parsed intent is "search"');
assert(cmd1.item.toLowerCase() === 'apples', 'Parsed item is "apples"');
assert(
  cmd1.tags !== undefined && cmd1.tags.includes('organic'),
  'Extracted tag ["organic"]'
);

const results1 = searchProducts(cmd1);
assert(results1.length > 0, `Search returned ${results1.length} product(s)`);
assert(
  results1.every((p) => p.name.toLowerCase().includes('apple') && p.tags.includes('organic')),
  'All returned results match "apple" and are tagged "organic"'
);

console.log('Filtered Results for "Find me organic apples":');
results1.forEach((p) => {
  console.log(`  - [${p.brand}] ${p.name} ($${p.price.toFixed(2)}) - Tags: ${p.tags.join(', ')}`);
});
console.log('');

// Test Case 2: "Find toothpaste under $5"
console.log('--- 2. Testing Voice Command: "Find toothpaste under $5" ---');
const cmd2 = parseVoiceCommand('Find toothpaste under $5');

assert(cmd2.intent === 'search', 'Parsed intent is "search"');
assert(cmd2.item.toLowerCase() === 'toothpaste', 'Parsed item is "toothpaste"');
assert(cmd2.maxPrice === 5, 'Parsed maxPrice is 5');

const results2 = searchProducts(cmd2);
assert(results2.length > 0, `Search returned ${results2.length} product(s)`);
assert(
  results2.every((p) => p.name.toLowerCase().includes('toothpaste') && p.price <= 5),
  'All returned results match "toothpaste" and have price <= $5.00'
);

const sensodyneExcluded = !results2.some((p) => p.brand.toLowerCase() === 'sensodyne');
assert(
  sensodyneExcluded,
  'Sensodyne ($6.49) is correctly excluded because its price exceeds $5.00'
);

console.log('Filtered Results for "Find toothpaste under $5":');
results2.forEach((p) => {
  console.log(`  - [${p.brand}] ${p.name} ($${p.price.toFixed(2)})`);
});

console.log('\n--------------------------------------------------');
console.log(`SUMMARY: ${passedTests} / ${totalTests} tests passed.`);
console.log('--------------------------------------------------');

if (passedTests !== totalTests) {
  process.exit(1);
}
