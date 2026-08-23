declare const process: any;
import { runCommandParserTests } from './commandParser.test';

console.log('========================================');
console.log(' VOICE COMMAND PARSER UNIT TEST RUNNER ');
console.log('========================================\n');

const outcome = runCommandParserTests();

outcome.results.forEach((r, idx) => {
  const statusSymbol = r.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`Test #${idx + 1}: [${statusSymbol}] [${r.lang}] "${r.phrase}"`);
  console.log(`  Expected -> Intent: '${r.expected.intent}', Item: '${r.expected.item}'${r.expected.quantity !== undefined ? `, Qty: ${r.expected.quantity}` : ''}`);
  console.log(`  Actual   -> Intent: '${r.actual.intent}', Item: '${r.actual.item}'${r.actual.quantity !== undefined ? `, Qty: ${r.actual.quantity}` : ''}`);
  console.log('');
});

console.log('----------------------------------------');
console.log(`SUMMARY: ${outcome.passed} / ${outcome.total} tests passed.`);
console.log('----------------------------------------\n');

if (outcome.passed !== outcome.total) {
  process.exit(1);
}

